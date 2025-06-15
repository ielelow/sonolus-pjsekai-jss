import {
    USC,
    USCObject,
    USCBpmChange,
    USCTimeScaleChange,
    USCSingleNote,
    USCSlideNote,
    USCGuideNote,
    USCDamageNote,
    USCConnectionStartNote,
    USCConnectionTickNote,
    USCConnectionAttachNote,
    USCConnectionEndNote,
  } from "./index.cjs"
  
  interface SUSMeasureData {
    [channel: string]: string
  }
  
  interface SUSData {
    meta: Map<string, string>
    measures: Map<number, SUSMeasureData>
    bpmDefinitions: Map<string, number>
  }
  
  /** Convert a USC to a SUS */
  export const uscToSUS = (usc: USC): string => {
    const ticksPerBeat = 480
    const susData: SUSData = {
      meta: new Map(),
      measures: new Map(),
      bpmDefinitions: new Map(),
    }
  
    // Initialize default metadata
    susData.meta.set("TITLE", '""')
    susData.meta.set("ARTIST", '""')
    susData.meta.set("DESIGNER", '""')
    susData.meta.set("DIFFICULTY", "0")
    susData.meta.set("PLAYLEVEL", "")
    susData.meta.set("SONGID", '""')
    susData.meta.set("WAVE", '""')
    susData.meta.set("WAVEOFFSET", (-usc.offset).toString())
    susData.meta.set("JACKET", '""')
    susData.meta.set("REQUEST", `"ticks_per_beat ${ticksPerBeat}"`)
  
    // Process objects
    let bpmCounter = 1
    const bpmMap = new Map<number, string>()
    const slideChannels = new Map<string, string>()
    const guideChannels = new Map<string, string>()
    let slideChannelCounter = 0
    let guideChannelCounter = 0
  
    // Sort objects by beat for processing
    const sortedObjects = [...usc.objects].sort((a, b) => {
      const beatA = 'beat' in a ? a.beat : 0
      const beatB = 'beat' in b ? b.beat : 0
      return beatA - beatB
    })
  
    for (const obj of sortedObjects) {
      switch (obj.type) {
        case "bpm":
          processBpmChange(obj, susData, bpmMap, bpmCounter++, ticksPerBeat)
          break
        case "timeScaleGroup":
          processTimeScaleGroup(obj, susData, ticksPerBeat)
          break
        case "single":
          processSingleNote(obj, susData, ticksPerBeat)
          break
        case "damage":
          processDamageNote(obj, susData, ticksPerBeat)
          break
        case "slide":
          processSlideNote(obj, susData, slideChannels, slideChannelCounter++, ticksPerBeat)
          break
        case "guide":
          processGuideNote(obj, susData, guideChannels, guideChannelCounter++, ticksPerBeat)
          break
      }
    }
  
    return generateSUSString(susData)
  }
  
  function processBpmChange(
    obj: USCBpmChange,
    susData: SUSData,
    bpmMap: Map<number, string>,
    counter: number,
    ticksPerBeat: number
  ) {
    const bpmId = counter.toString().padStart(2, "0")
    bpmMap.set(obj.bpm, bpmId)
    susData.bpmDefinitions.set(bpmId, obj.bpm)
  
    const { measure, position, length } = beatToMeasurePosition(obj.beat, ticksPerBeat)
    const channel = `${measure.toString().padStart(3, "0")}08`
    
    addToMeasure(susData, measure, channel, position, length, bpmId)
  }
  
  function processTimeScaleGroup(
    obj: USCTimeScaleChange,
    susData: SUSData,
    ticksPerBeat: number
  ) {
    const tilData = obj.changes.map(change => {
      const tick = Math.round(change.beat * ticksPerBeat)
      const measure = Math.floor(tick / (4 * ticksPerBeat))
      const tickInMeasure = tick % (4 * ticksPerBeat)
      return `${measure}'${tickInMeasure}:${change.timeScale}`
    }).join(", ")
    
    susData.meta.set("TIL00", `"${tilData}"`)
  }
  
  function processSingleNote(
    obj: USCSingleNote,
    susData: SUSData,
    ticksPerBeat: number
  ) {
    const lane = Math.round(obj.lane + 8 - obj.size)
    const width = Math.round(obj.size * 2)
    const laneHex = lane.toString(36)
    
    let noteType = 1
    if (obj.critical && obj.trace) noteType = 6
    else if (obj.critical) noteType = 2
    else if (obj.trace) noteType = 3
  
    const noteValue = noteType.toString(36) + width.toString(36)
    const { measure, position, length } = beatToMeasurePosition(obj.beat, ticksPerBeat)
    const channel = `${measure.toString().padStart(3, "0")}1${laneHex}`
    
    addToMeasure(susData, measure, channel, position, length, noteValue)
  
    // Add directional note if needed
    if (obj.direction && obj.direction !== "none") {
      let dirType = 1
      switch (obj.direction) {
        case "up": dirType = 1; break
        case "left": dirType = 3; break
        case "right": dirType = 4; break
      }
      const dirValue = dirType.toString(36) + width.toString(36)
      const dirChannel = `${measure.toString().padStart(3, "0")}5${laneHex}`
      addToMeasure(susData, measure, dirChannel, position, length, dirValue)
    }
  }
  
  function processDamageNote(
    obj: USCDamageNote,
    susData: SUSData,
    ticksPerBeat: number
  ) {
    const lane = Math.round(obj.lane + 8 - obj.size)
    const width = Math.round(obj.size * 2)
    const laneHex = lane.toString(36)
    
    const noteValue = "4" + width.toString(36)
    const { measure, position, length } = beatToMeasurePosition(obj.beat, ticksPerBeat)
    const channel = `${measure.toString().padStart(3, "0")}1${laneHex}`
    
    addToMeasure(susData, measure, channel, position, length, noteValue)
  }
  
  function processSlideNote(
    obj: USCSlideNote,
    susData: SUSData,
    slideChannels: Map<string, string>,
    counter: number,
    ticksPerBeat: number
  ) {
    const channelId = counter.toString(36)
    
    for (const connection of obj.connections) {
      let noteType: number
      let lane: number
      let width: number
      let laneHex: string
      
      switch (connection.type) {
        case "start": 
          noteType = 1
          lane = Math.round(connection.lane + 8 - connection.size)
          width = Math.round(connection.size * 2)
          laneHex = lane.toString(36)
          break
        case "end": 
          noteType = 2
          lane = Math.round(connection.lane + 8 - connection.size)
          width = Math.round(connection.size * 2)
          laneHex = lane.toString(36)
          break
        case "tick": 
          noteType = 3
          lane = Math.round(connection.lane + 8 - connection.size)
          width = Math.round(connection.size * 2)
          laneHex = lane.toString(36)
          break
        case "attach": 
          continue // Skip attach notes in SUS as they don't have position data
      }
      
      const noteValue = noteType.toString(36) + width.toString(36)
      const { measure, position, length } = beatToMeasurePosition(connection.beat, ticksPerBeat)
      const channel = `${measure.toString().padStart(3, "0")}3${laneHex}${channelId}`
      
      addToMeasure(susData, measure, channel, position, length, noteValue)
      
      // Add directional note for end connection if needed
      if (connection.type === "end" && connection.direction) {
        let dirType = 1
        switch (connection.direction) {
          case "up": dirType = 1; break
          case "left": dirType = 3; break
          case "right": dirType = 4; break
        }
        const dirValue = dirType.toString(36) + width.toString(36)
        const dirChannel = `${measure.toString().padStart(3, "0")}5${laneHex}`
        addToMeasure(susData, measure, dirChannel, position, length, dirValue)
      }
    }
  }
  
  function processGuideNote(
    obj: USCGuideNote,
    susData: SUSData,
    guideChannels: Map<string, string>,
    counter: number,
    ticksPerBeat: number
  ) {
    const channelId = counter.toString(36)
    
    for (let i = 0; i < obj.midpoints.length; i++) {
      const midpoint = obj.midpoints[i]
      const lane = Math.round(midpoint.lane + 8 - midpoint.size)
      const width = Math.round(midpoint.size * 2)
      const laneHex = lane.toString(36)
      
      const noteType = i === 0 ? 1 : (i === obj.midpoints.length - 1 ? 2 : 3)
      const noteValue = noteType.toString(36) + width.toString(36)
      const { measure, position, length } = beatToMeasurePosition(midpoint.beat, ticksPerBeat)
      const channel = `${measure.toString().padStart(3, "0")}9${laneHex}${channelId}`
      
      addToMeasure(susData, measure, channel, position, length, noteValue)
    }
  }
  
  function beatToMeasurePosition(beat: number, ticksPerBeat: number) {
    const tick = Math.round(beat * ticksPerBeat)
    const ticksPerMeasure = 4 * ticksPerBeat
    const measure = Math.floor(tick / ticksPerMeasure)
    const tickInMeasure = tick % ticksPerMeasure
    
    // Find appropriate subdivision
    const subdivisions = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 192]
    let bestLength = 192
    let bestPosition = Math.round((tickInMeasure * 192) / ticksPerMeasure)
    
    for (const length of subdivisions) {
      const position = Math.round((tickInMeasure * length) / ticksPerMeasure)
      if (Math.abs(position * ticksPerMeasure - tickInMeasure * length) < 0.001) {
        bestLength = length
        bestPosition = position
        break
      }
    }
    
    return { measure, position: bestPosition, length: bestLength }
  }
  
  function addToMeasure(
    susData: SUSData,
    measure: number,
    channel: string,
    position: number,
    length: number,
    value: string
  ) {
    if (!susData.measures.has(measure)) {
      susData.measures.set(measure, {})
    }
    
    const measureData = susData.measures.get(measure)!
    if (!measureData[channel]) {
      measureData[channel] = "00".repeat(length)
    }
    
    // Extend or truncate to match length
    const currentLength = measureData[channel].length / 2
    if (currentLength < length) {
      measureData[channel] += "00".repeat(length - currentLength)
    } else if (currentLength > length) {
      // Need to downsample
      const ratio = currentLength / length
      const newData = new Array(length).fill("00")
      for (let i = 0; i < currentLength; i++) {
        const oldValue = measureData[channel].substr(i * 2, 2)
        if (oldValue !== "00") {
          const newIndex = Math.floor(i / ratio)
          if (newIndex < length) {
            newData[newIndex] = oldValue
          }
        }
      }
      measureData[channel] = newData.join("")
    }
    
    // Set the value at the position
    const valueArray = measureData[channel].match(/.{2}/g) || []
    if (position < valueArray.length) {
      valueArray[position] = value.padEnd(2, "0").substr(0, 2)
      measureData[channel] = valueArray.join("")
    }
  }
  
  function generateSUSString(susData: SUSData): string {
    const lines: string[] = []
    
    // Add header comment
    lines.push("This file was generated by USC to SUS converter.")
    
    // Add metadata
    for (const [key, value] of susData.meta) {
      lines.push(`#${key} ${value}`)
    }
    
    // Add measure length definitions (default to 4/4)
    const measures = Array.from(susData.measures.keys()).sort((a, b) => a - b)
    for (const measure of measures) {
      lines.push(`#${measure.toString().padStart(3, "0")}02: 4`)
    }
    
    // Add BPM definitions
    for (const [id, bpm] of susData.bpmDefinitions) {
      lines.push(`#BPM${id}: ${bpm}`)
    }
    
    // Add BPM change at start
    if (susData.bpmDefinitions.size > 0) {
      const firstBpm = Array.from(susData.bpmDefinitions.entries())[0][0]
      lines.push(`#00008: ${firstBpm}`)
    }
    
    // Add measure data
    for (const measure of measures) {
      const measureData = susData.measures.get(measure)!
      const channels = Object.keys(measureData).sort()
      
      for (const channel of channels) {
        const data = measureData[channel]
        if (data && data !== "00".repeat(data.length / 2)) {
          lines.push(`#${channel}:${data}`)
        }
      }
    }
    
    return lines.join("\n")
  }