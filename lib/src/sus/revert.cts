import {
    USC,
    USCBpmChange,
    USCDamageNote,
    USCGuideNote,
    USCSingleNote,
    USCSlideNote,
    USCTimeScaleChange,
} from './index.cjs'

const TICKS_PER_BEAT = 480

export const uscToSUS = (uscData: any): string => {
    const usc: USC = uscData.usc ? uscData.usc : uscData

    const susLines: string[] = []
    const noteData = new Map<
        number,
        Map<string, { tick: number; value: string; timeScaleGroup: number }[]>
    >()
    let slideChannelCounter = 0

    // (메타데이터 및 전역 정의 생성은 이전과 동일)
    susLines.push(
        `#TITLE ""`,
        `#ARTIST ""`,
        `#DESIGNER ""`,
        `#WAVEOFFSET ${-usc.offset}`,
        `#REQUEST "ticks_per_beat ${TICKS_PER_BEAT}"`,
        ``,
    )

    const ticksPerMeasure = TICKS_PER_BEAT * 4

    const bpmObjects = usc.objects.filter((obj): obj is USCBpmChange => obj.type === 'bpm')
    const bpmDefinitions = new Map<number, string>()
    let bpmCounter = 1
    for (const bpmObject of bpmObjects) {
        if (!bpmDefinitions.has(bpmObject.bpm)) {
            const bpmId = bpmCounter.toString().padStart(2, '0')
            bpmDefinitions.set(bpmObject.bpm, bpmId)
            susLines.push(`#BPM${bpmId}: ${bpmObject.bpm}`)
            bpmCounter++
        }
    }
    susLines.push(``)

    const timeScaleGroups = usc.objects.filter(
        (obj): obj is USCTimeScaleChange => obj.type === 'timeScaleGroup',
    )
    const tilIdMap = new Map<number, string>()
    timeScaleGroups.forEach((group, index) => {
        const tilId = index.toString().padStart(2, '0')
        tilIdMap.set(index, tilId)
        const changesString = group.changes
            .map((change) => {
                const totalTicks = change.beat * TICKS_PER_BEAT
                const measure = Math.floor(totalTicks / ticksPerMeasure)
                const tickInMeasure = totalTicks % ticksPerMeasure
                return `${measure}'${tickInMeasure}:${change.timeScale}`
            })
            .join(', ')
        susLines.push(`#TIL${tilId}: "${changesString}"`)
    })
    susLines.push(``)

    addNoteData(0, '00002', 0, '4', 0)

    for (const bpmObject of bpmObjects) {
        const tick = bpmObject.beat * TICKS_PER_BEAT
        const measure = Math.floor(tick / ticksPerMeasure)
        const tickInMeasure = tick % ticksPerMeasure
        const bpmId = bpmDefinitions.get(bpmObject.bpm)
        if (bpmId) {
            addNoteData(
                measure,
                `${measure.toString().padStart(3, '0')}08`,
                tickInMeasure,
                bpmId,
                0,
            )
        }
    }

    for (const obj of usc.objects) {
        switch (obj.type) {
            case 'single':
            case 'damage':
                processSingleOrDamage(obj)
                break
            case 'slide':
                processSlide(obj)
                slideChannelCounter++
                break
            case 'guide':
                processGuide(obj)
                slideChannelCounter++
                break
            case 'timeScaleGroup':
            case 'bpm':
                break
        }
    }

    // ▼▼▼ 노트 겹침 및 BPM 겹침 오류를 모두 해결한 최종 렌더링 로직 ▼▼▼
  const sortedMeasures = Array.from(noteData.keys()).sort((a, b) => a - b);
  let activeTimeScaleGroup = -1;

  for (const measure of sortedMeasures) {
    const headerMap = noteData.get(measure)!;
    const sortedHeaders = Array.from(headerMap.keys()).sort();
    for (const header of sortedHeaders) {
      const notes = headerMap.get(header)!;
      if (!notes || notes.length === 0) continue;
      
      const noteTimeScaleGroup = notes[0].timeScaleGroup;
      const tilId = tilIdMap.get(noteTimeScaleGroup);
      if (noteTimeScaleGroup !== activeTimeScaleGroup && tilId !== undefined) {
          susLines.push(`#HISPEED ${tilId}`);
          activeTimeScaleGroup = noteTimeScaleGroup;
      }
      
      if (header.endsWith("02")) {
        susLines.push(`#${header}: ${notes[0].value}`);
        continue;
      }

      const granularity = 1920;
      const data = Array(granularity).fill("00");
      const finalNotes = new Map<number, string>();

      const getPriority = (value: string): number => {
        const typeChar = value.charAt(0);
        // Hidden 노트(타입 5)는 우선순위가 낮습니다.
        if (typeChar === '5') return 2;
        // 그 외 모든 노트(BPM 변경 포함)는 우선순위가 높습니다.
        return 1;
      };

      for (const note of notes) {
        const index = Math.floor((note.tick / ticksPerMeasure) * granularity);
        if (index >= granularity) continue;

        const existingNoteValue = finalNotes.get(index);
        const newNoteValue = note.value;
        
        if (!existingNoteValue || getPriority(newNoteValue) <= getPriority(existingNoteValue)) {
          finalNotes.set(index, newNoteValue);
        }
      }

      for (const [index, value] of finalNotes.entries()) {
        data[index] = value;
      }
      
      susLines.push(`#${header}: ${data.join("")}`);
    }
  }

  return susLines.join("\r\n");

    // --- Helper Functions ---

    function addNoteData(
        measure: number,
        header: string,
        tickInMeasure: number,
        value: string,
        timeScaleGroup: number,
    ) {
        if (!noteData.has(measure)) noteData.set(measure, new Map())
        const headerMap = noteData.get(measure)!
        if (!headerMap.has(header)) headerMap.set(header, [])
        headerMap.get(header)!.push({ tick: tickInMeasure, value, timeScaleGroup })
    }

    function getSusLaneAndWidth(uscLane: number, uscSize: number): [number, number] {
        const susWidth = Math.round(uscSize * 2)
        const susLane = Math.round(uscLane - uscSize + 8)
        return [Math.max(0, susLane), Math.max(1, susWidth)]
    }

    function addTapNote(
        beat: number,
        lane: number,
        width: number,
        noteType: string,
        timeScaleGroup: number,
    ) {
        const tick = beat * TICKS_PER_BEAT
        const measure = Math.floor(tick / ticksPerMeasure)
        const tickInMeasure = tick % ticksPerMeasure
        const laneHex = lane.toString(36)
        const widthHex = width.toString(36)
        const header = `${measure.toString().padStart(3, '0')}1${laneHex}`
        const value = `${noteType}${widthHex}`
        addNoteData(measure, header, tickInMeasure, value, timeScaleGroup)
    }

    function processSingleOrDamage(note: USCSingleNote | USCDamageNote) {
        if (note.type === 'damage') {
            const [lane, width] = getSusLaneAndWidth(note.lane, note.size)
            addTapNote(note.beat, lane, width, '4', note.timeScaleGroup)
            return
        }
        const [lane, width] = getSusLaneAndWidth(note.lane, note.size)
        let susNoteType = '1'
        if (note.critical && note.trace) susNoteType = '6'
        else if (note.critical) susNoteType = '2'
        else if (note.trace) susNoteType = '5'
        addTapNote(note.beat, lane, width, susNoteType, note.timeScaleGroup)
        if (note.direction && note.direction !== 'none') {
            let directionalType
            switch (note.direction) {
                case 'up':
                    directionalType = '1'
                    break
                case 'left':
                    directionalType = '3'
                    break
                case 'right':
                    directionalType = '4'
                    break
                default:
                    return
            }
            const [dirLane, dirWidth] = getSusLaneAndWidth(note.lane, note.size)
            const tick = note.beat * TICKS_PER_BEAT
            const measure = Math.floor(tick / ticksPerMeasure)
            const tickInMeasure = tick % ticksPerMeasure
            const dirHeader = `${measure.toString().padStart(3, '0')}5${dirLane.toString(36)}`
            const dirValue = `${directionalType}${dirWidth.toString(36)}`
            addNoteData(measure, dirHeader, tickInMeasure, dirValue, note.timeScaleGroup)
        }
    }

    // ▼▼▼ `ease` 처리 로직을 최종 수정한 `processSlide` 함수 ▼▼▼
    function processSlide(slide: USCSlideNote) {
        const channel = (slideChannelCounter % 36).toString(36)
        const sortedConnections = [...slide.connections].sort((a, b) => a.beat - b.beat);
        let lastKnownLane: number = 0
        let lastKnownWidth: number = 0

        for (const conn of sortedConnections) {
            const tick = conn.beat * TICKS_PER_BEAT
            const measure = Math.floor(tick / ticksPerMeasure)
            const tickInMeasure = tick % ticksPerMeasure
            const timeScaleGroup = conn.timeScaleGroup ?? 0
            const isCritical = slide.critical || conn.critical

            let lane: number, width: number
            if (conn.type !== 'attach' && 'lane' in conn && 'size' in conn) {
                ;[lane, width] = getSusLaneAndWidth(conn.lane, conn.size)
                lastKnownLane = lane
                lastKnownWidth = width
            } else {
                lane = lastKnownLane
                width = lastKnownWidth
            }

            const laneHex = lane.toString(36)
            const widthHex = width.toString(36)

            // --- 마커 및 방향성 노트 생성 로직 ---

            // 1. Easing 마커 (start, end, tick 모두에 적용)
            if ('ease' in conn && conn.ease) {
                let easeType = conn.ease
                if (easeType === 'inout') easeType = 'in'
                if (easeType === 'outin') easeType = 'out'
                let directionalType: string | null = null
                if (easeType === 'in') directionalType = '2'
                else if (easeType === 'out') directionalType = '5'
                if (directionalType) {
                    const dirHeader = `${measure.toString().padStart(3, '0')}5${laneHex}`
                    const dirValue = `${directionalType}${widthHex}`
                    addNoteData(measure, dirHeader, tickInMeasure, dirValue, timeScaleGroup)
                }
            }

            // 2. 기타 마커 및 Flick (start, end 에만 적용)
            if (conn.type === 'start' || conn.type === 'end') {
                let markerType: string | null = null
                if ('judgeType' in conn) {
                    if (conn.judgeType === 'none') markerType = isCritical ? '8' : '7'
                    else if (conn.judgeType === 'trace') markerType = isCritical ? '6' : '5'
                }
                if (conn.type === 'start' && isCritical && markerType === null) {
                    markerType = '2'
                }
                if (markerType) {
                    addTapNote(conn.beat, lane, width, markerType, timeScaleGroup)
                }

                if (conn.type === 'end' && conn.direction) {
                    let directionalType
                    switch (conn.direction) {
                        case 'up':
                            directionalType = '1'
                            break
                        case 'left':
                            directionalType = '3'
                            break
                        case 'right':
                            directionalType = '4'
                            break
                        default:
                            continue
                    }
                    const dirHeader = `${measure.toString().padStart(3, '0')}5${laneHex}`
                    const dirValue = `${directionalType}${widthHex}`
                    addNoteData(measure, dirHeader, tickInMeasure, dirValue, timeScaleGroup)
                }
            }

            // --- 실제 슬라이드 경로 노트 생성 로직 ---
            let noteType: string | null = null
            switch (conn.type) {
                case 'start':
                    noteType = '1'
                    break
                case 'end':
                    noteType = '2'
                    break
                case 'tick':
                    noteType = conn.critical !== undefined ? '3' : '5'
                    break
                case 'attach':
                    // `convert.ts` 원리: '보이는 경유점(타입 3)' + '틱 제거 마커(타입 3)' 조합으로 변환
                    const attachHeader = `${measure.toString().padStart(3, '0')}3${laneHex}${channel}`
                    const attachValue = `3${widthHex}` // 보이는 경유점
                    addNoteData(measure, attachHeader, tickInMeasure, attachValue, timeScaleGroup)
                    // 틱 제거용 마커(SUS 탭 타입 3)
                    addTapNote(conn.beat, lane, width, '3', timeScaleGroup)
                    continue
            }

            if (noteType) {
                const header = `${measure.toString().padStart(3, '0')}3${laneHex}${channel}`
                const value = `${noteType}${widthHex}`
                addNoteData(measure, header, tickInMeasure, value, timeScaleGroup)
            }
        }
    }

    function processGuide(guide: USCGuideNote) {
        const channel = (slideChannelCounter % 36).toString(36)
        const sortedMidpoints = [...guide.midpoints].sort((a, b) => a.beat - b.beat);
        sortedMidpoints.forEach((midpoint, index) => {
            const tick = midpoint.beat * TICKS_PER_BEAT
            const measure = Math.floor(tick / ticksPerMeasure)
            const tickInMeasure = tick % ticksPerMeasure
            let noteType
            if (index === 0) noteType = '1'
            else if (index === sortedMidpoints.length - 1) noteType = '2'
            else noteType = '3'
            const [lane, width] = getSusLaneAndWidth(midpoint.lane, midpoint.size)
            const laneHex = lane.toString(36)
            const widthHex = width.toString(36)

            if (guide.fade === 'in' && index === 0) {
                const dirHeader = `${measure.toString().padStart(3, '0')}5${laneHex}`
                const dirValue = `2${widthHex}`
                addNoteData(measure, dirHeader, tickInMeasure, dirValue, midpoint.timeScaleGroup)
            }
            if (guide.fade === 'out' && index === sortedMidpoints.length - 1) {
                const dirHeader = `${measure.toString().padStart(3, '0')}5${laneHex}`
                const dirValue = `5${widthHex}`
                addNoteData(measure, dirHeader, tickInMeasure, dirValue, midpoint.timeScaleGroup)
            }
            if (midpoint.ease) {
                let easeType = midpoint.ease
                if (easeType === 'inout') easeType = 'in'
                if (easeType === 'outin') easeType = 'out'
                let directionalType: string | null = null
                if (easeType === 'in') directionalType = '2'
                else if (easeType === 'out') directionalType = '5'
                if (directionalType) {
                    const dirHeader = `${measure.toString().padStart(3, '0')}5${laneHex}`
                    const dirValue = `${directionalType}${widthHex}`
                    addNoteData(
                        measure,
                        dirHeader,
                        tickInMeasure,
                        dirValue,
                        midpoint.timeScaleGroup,
                    )
                }
            }

            const header = `${measure.toString().padStart(3, '0')}9${laneHex}${channel}`
            const value = `${noteType}${widthHex}`
            addNoteData(measure, header, tickInMeasure, value, midpoint.timeScaleGroup)
        })
    }
}
