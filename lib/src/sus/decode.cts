import { USC, USCObject } from './index.cjs'

interface SUSNote {
  measure: number
  position: number
  lane: number
  width: number
  type: number
}

interface SUSData {
  offset: number
  ticksPerBeat: number
  bpmChanges: Array<{ measure: number; position: number; bpm: number; id: string }>
  timeScaleChanges: Array<{ measure: number; tick: number; timeScale: number }>
  tapNotes: SUSNote[]
  directionalNotes: SUSNote[]
  slideNotes: SUSNote[]
  meta: Map<string, string>
}

export const uscToSUS = (usc: USC): string => {
  const ticksPerBeat = 480 // Default ticks per beat
  const susData: SUSData = {
    offset: usc.offset,
    ticksPerBeat,
    bpmChanges: [],
    timeScaleChanges: [],
    tapNotes: [],
    directionalNotes: [],
    slideNotes: [],
    meta: new Map()
  }

  // Set basic metadata
  susData.meta.set('REQUEST', '"ticks_per_beat 480"')
  susData.meta.set('WAVEOFFSET', (-usc.offset).toString())

  let bpmCounter = 0
  let slideCounter = 0
  const bpmMap = new Map<number, string>()

  for (const obj of usc.objects) {
    switch (obj.type) {
      case 'bpm': {
        const bpmId = (bpmCounter++).toString(36).padStart(2, '0').toUpperCase()
        const bpm = obj.bpm
        bpmMap.set(bpm, bpmId)
        
        const { measure, position } = beatToMeasurePosition(obj.beat, ticksPerBeat)
        susData.bpmChanges.push({ measure, position, bpm, id: bpmId })
        break
      }

      case 'timeScaleGroup': {
        // Handle time scale changes (simplified - using first group only)
        if (obj.changes && obj.changes.length > 0) {
          for (const change of obj.changes) {
            const { measure, tick } = beatToMeasureTick(change.beat, ticksPerBeat)
            susData.timeScaleChanges.push({ 
              measure, 
              tick, 
              timeScale: change.timeScale 
            })
          }
        }
        break
      }

      case 'single': {
        const { measure, position } = beatToMeasurePosition(obj.beat, ticksPerBeat)
        const lane = Math.round(obj.lane + 8 - obj.size)
        const width = Math.round(obj.size * 2)
        
        let type = 1 // Normal tap
        if (obj.critical && obj.trace) type = 6
        else if (obj.critical) type = 2
        else if (obj.trace) type = 5

        susData.tapNotes.push({ measure, position, lane, width, type })

        // Handle flick directions
        if (obj.direction) {
          let dirType = 1 // up
          if (obj.direction === 'left') dirType = 3
          else if (obj.direction === 'right') dirType = 4
          
          susData.directionalNotes.push({ 
            measure, position, lane, width, type: dirType 
          })
        }
        break
      }

      case 'damage': {
        const { measure, position } = beatToMeasurePosition(obj.beat, ticksPerBeat)
        const lane = Math.round(obj.lane + 8 - obj.size)
        const width = Math.round(obj.size * 2)
        
        susData.tapNotes.push({ 
          measure, position, lane, width, type: 4 
        })
        break
      }

      case 'slide': {
        const slideId = slideCounter.toString(36).toUpperCase()
        slideCounter++

        for (const connection of obj.connections) {
          const { measure, position } = beatToMeasurePosition(connection.beat, ticksPerBeat)
          let lane: number, width: number, type: number

          if (connection.type === 'attach') {
            // For attach notes, we need to handle them specially
            // Skip for now as they need special processing
            continue
          } else {
            lane = Math.round(connection.lane + 8 - connection.size)
            width = Math.round(connection.size * 2)
          }

          switch (connection.type) {
            case 'start':
              type = 1
              // Handle trace/critical modifiers
              if (connection.judgeType === 'trace') {
                susData.tapNotes.push({ measure, position, lane, width, type: 5 })
              } else if (connection.judgeType === 'none') {
                susData.tapNotes.push({ measure, position, lane, width, type: 7 })
              }
              if (connection.critical) {
                susData.tapNotes.push({ measure, position, lane, width, type: 2 })
              }
              break
            case 'end':
              type = 2
              // Handle flick direction
              if (connection.direction) {
                let dirType = 1
                if (connection.direction === 'left') dirType = 3
                else if (connection.direction === 'right') dirType = 4
                susData.directionalNotes.push({ 
                  measure, position, lane, width, type: dirType 
                })
              }
              // Handle trace/critical modifiers
              if (connection.judgeType === 'trace') {
                susData.tapNotes.push({ measure, position, lane, width, type: 5 })
              } else if (connection.judgeType === 'none') {
                susData.tapNotes.push({ measure, position, lane, width, type: 7 })
              }
              if (connection.critical) {
                susData.tapNotes.push({ measure, position, lane, width, type: 2 })
              }
              break
            case 'tick':
              type = 3
              break
            default:
              continue
          }

          susData.slideNotes.push({ measure, position, lane, width, type })
        }
        break
      }

      case 'guide': {
        // Convert guides to slide notes with type 9 (guide)
        const slideId = slideCounter.toString(36).toUpperCase()
        slideCounter++

        for (let i = 0; i < obj.midpoints.length; i++) {
          const midpoint = obj.midpoints[i]
          const { measure, position } = beatToMeasurePosition(midpoint.beat, ticksPerBeat)
          const lane = Math.round(midpoint.lane + 8 - midpoint.size)
          const width = Math.round(midpoint.size * 2)
          
          let type: number
          if (i === 0) type = 1 // start
          else if (i === obj.midpoints.length - 1) type = 2 // end
          else type = 3 // tick

          susData.slideNotes.push({ measure, position, lane, width, type })
        }
        break
      }
    }
  }

  return generateSUSString(susData)
}

function beatToMeasurePosition(beat: number, ticksPerBeat: number): { measure: number; position: number } {
  const totalTicks = beat * ticksPerBeat
  const measure = Math.floor(totalTicks / (4 * ticksPerBeat))
  const ticksInMeasure = totalTicks % (4 * ticksPerBeat)
  const position = Math.round(ticksInMeasure)
  
  return { measure, position }
}

function beatToMeasureTick(beat: number, ticksPerBeat: number): { measure: number; tick: number } {
  const totalTicks = beat * ticksPerBeat
  const measure = Math.floor(totalTicks / (4 * ticksPerBeat))
  const tick = Math.round(totalTicks % (4 * ticksPerBeat))
  
  return { measure, tick }
}

function generateSUSString(susData: SUSData): string {
  const lines: string[] = []

  // Add metadata
  for (const [key, value] of susData.meta) {
    lines.push(`#${key} ${value}`)
  }

  // Add BPM definitions
  const bpmDefs = new Map<string, number>()
  for (const bpmChange of susData.bpmChanges) {
    if (!bpmDefs.has(bpmChange.id)) {
      bpmDefs.set(bpmChange.id, bpmChange.bpm)
      lines.push(`#BPM${bpmChange.id} ${bpmChange.bpm}`)
    }
  }

  // Add time scale changes
  if (susData.timeScaleChanges.length > 0) {
    const tilData = susData.timeScaleChanges
      .map(change => `${change.measure}'${change.tick}:${change.timeScale}`)
      .join(', ')
    lines.push(`#TIL00 "${tilData}"`)
  }

  // Group notes by measure and create data lines
  const measureData = new Map<string, string[]>()

  // Helper function to add note to measure data
  const addToMeasureData = (header: string, measure: number, position: number, value: string, resolution: number) => {
    const measureStr = measure.toString().padStart(3, '0')
    const fullHeader = `${measureStr}${header}`
    
    if (!measureData.has(fullHeader)) {
      measureData.set(fullHeader, new Array(resolution).fill('00'))
    }
    
    const data = measureData.get(fullHeader)!
    const index = Math.round((position / (4 * susData.ticksPerBeat)) * resolution)
    if (index < resolution) {
      data[index] = value
    }
  }

  // Add BPM changes
  for (const bpmChange of susData.bpmChanges) {
    addToMeasureData('08', bpmChange.measure, bpmChange.position, bpmChange.id, 32)
  }

  // Add tap notes
  const tapNotesByLane = new Map<number, SUSNote[]>()
  for (const note of susData.tapNotes) {
    if (!tapNotesByLane.has(note.lane)) {
      tapNotesByLane.set(note.lane, [])
    }
    tapNotesByLane.get(note.lane)!.push(note)
  }

  for (const [lane, notes] of tapNotesByLane) {
    const laneStr = lane.toString(36).toLowerCase()
    for (const note of notes) {
      const value = note.type.toString(36) + note.width.toString(36)
      addToMeasureData(`1${laneStr}`, note.measure, note.position, value, 64)
    }
  }

  // Add directional notes
  const dirNotesByLane = new Map<number, SUSNote[]>()
  for (const note of susData.directionalNotes) {
    if (!dirNotesByLane.has(note.lane)) {
      dirNotesByLane.set(note.lane, [])
    }
    dirNotesByLane.get(note.lane)!.push(note)
  }

  for (const [lane, notes] of dirNotesByLane) {
    const laneStr = lane.toString(36).toLowerCase()
    for (const note of notes) {
      const value = note.type.toString(36) + note.width.toString(36)
      addToMeasureData(`5${laneStr}`, note.measure, note.position, value, 64)
    }
  }

  // Add slide notes (simplified - group by lane and assign to channels)
  const slideNotesByLane = new Map<number, SUSNote[]>()
  for (const note of susData.slideNotes) {
    if (!slideNotesByLane.has(note.lane)) {
      slideNotesByLane.set(note.lane, [])
    }
    slideNotesByLane.get(note.lane)!.push(note)
  }

  let channelCounter = 0
  for (const [lane, notes] of slideNotesByLane) {
    const laneStr = lane.toString(36).toLowerCase()
    const channelStr = channelCounter.toString(36).toLowerCase()
    channelCounter++
    
    for (const note of notes) {
      const value = note.type.toString(36) + note.width.toString(36)
      addToMeasureData(`3${laneStr}${channelStr}`, note.measure, note.position, value, 64)
    }
  }

  // Generate measure data lines
  const sortedHeaders = Array.from(measureData.keys()).sort()
  for (const header of sortedHeaders) {
    const data = measureData.get(header)!
    lines.push(`#${header}:${data.join('')}`)
  }

  return lines.join('\n')
}