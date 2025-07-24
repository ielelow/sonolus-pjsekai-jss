import * as B from './ccIndex.js'
import * as A from './index.js'

/**
 * B 타입의 USC 슬라이드 연결 노드를 A 타입으로 변환합니다.
 * @param connection B 타입의 연결 노트
 * @returns A 타입의 연결 노트
 */
const convertConnection = (
    connection: B.USCSlideNote['connections'][number],
): A.USCSlideNote['connections'][number] => {
    switch (connection.type) {
        case 'start':
            if (connection.judgeType === 'none') {
                return {
                    type: 'ignore',
                    beat: connection.beat,
                    lane: connection.lane,
                    size: connection.size,
                    ease: connection.ease,
                }
            }
            return {
                type: 'start',
                beat: connection.beat,
                lane: connection.lane,
                size: connection.size,
                critical: connection.critical,
                trace: connection.judgeType === 'trace',
                ease: connection.ease,
            }
        case 'tick':
            // B타입 tick 노트의 critical 유무에 따라 A타입의 tick 또는 hidden으로 분기합니다.
            if (connection.critical !== undefined) {
                return {
                    type: 'tick',
                    beat: connection.beat,
                    lane: connection.lane,
                    size: connection.size,
                    critical: connection.critical,
                    // A타입의 tick 노트는 trace 속성을 가지지만 B타입에는 없습니다.
                    // 따라서 false로 기본값을 설정합니다.
                    trace: false,
                    ease: connection.ease,
                }
            } else {
                return {
                    type: 'ignore',
                    beat: connection.beat,
                    lane: connection.lane,
                    size: connection.size,
                    ease: connection.ease,
                }
            }
        case 'attach':
            return {
                type: 'attach',
                beat: connection.beat,
                critical: connection.critical ?? false,
            }
        case 'end':
            if (connection.judgeType === 'none') {
                return {
                    type: 'ignore',
                    beat: connection.beat,
                    lane: connection.lane,
                    size: connection.size,
                    ease: 'linear',
                }
            }
            return {
                type: 'end',
                beat: connection.beat,
                lane: connection.lane,
                size: connection.size,
                critical: connection.critical,
                trace: connection.judgeType === 'trace',
                direction: connection.direction,
            }
    }
}

/**
 * 정렬을 위해 객체의 대표 beat 값을 가져옵니다.
 * @param obj A 타입 USCObject
 * @returns 정렬에 사용될 beat 값
 */
const getBeatForSort = (obj: A.USCObject): number => {
    if (obj.type === 'slide') {
        return obj.connections[0]?.beat ?? 0
    }
    return obj.beat
}

/**
 * B 타입의 USC 객체를 A 타입 USC 객체로 변환합니다.
 * @param uscB B 타입 USC 객체
 * @returns A 타입 USC 객체
 */
export const uscToUSC = (uscB: B.USC): A.USC => {
    const newObjects: A.USCObject[] = []
    let timeScaleGroupConverted = false // 첫 번째 timeScaleGroup만 변환하기 위한 플래그

    for (const object of uscB.objects) {
        switch (object.type) {
            case 'bpm':
                newObjects.push({
                    type: 'bpm',
                    beat: object.beat,
                    bpm: object.bpm,
                })
                break

            case 'single':
                // A타입에는 timeScaleGroup 속성이 없으므로 제거하고 변환합니다.
                const { timeScaleGroup: _, ...singleProps } = object
                newObjects.push({
                    ...singleProps,
                    direction: object.direction === 'none' ? undefined : object.direction,
                })
                break

            case 'slide':
                {
                    const newSlide: A.USCSlideNote = {
                        type: 'slide',
                        active: true,
                        critical: object.critical,
                        connections: object.connections.map(
                            convertConnection,
                        ) as A.USCSlideNote['connections'],
                    }
                    newObjects.push(newSlide)
                }
                break

            case 'timeScaleGroup':
                // 첫 번째 timeScaleGroup이 아직 변환되지 않았다면 변환합니다.
                if (!timeScaleGroupConverted) {
                    const sortedChanges = [...object.changes].sort((a, b) => a.beat - b.beat)

                    for (const change of sortedChanges) {
                        newObjects.push({
                            type: 'timeScale',
                            beat: change.beat,
                            timeScale: change.timeScale,
                        })
                    }
                    // 플래그를 true로 설정하여 이후의 timeScaleGroup들은 무시하도록 합니다.
                    timeScaleGroupConverted = true
                }
                break

            case 'guide':
                {
                    const guideConnections = object.midpoints.map(
                        (midpoint): A.USCConnectionIgnoreNote => ({
                            type: 'ignore',
                            beat: midpoint.beat,
                            lane: midpoint.lane,
                            size: midpoint.size,
                            ease: midpoint.ease,
                        }),
                    )

                    const newGuideSlide: A.USCSlideNote = {
                        type: 'slide',
                        active: false,
                        critical: object.color === 'yellow',
                        connections: guideConnections as A.USCSlideNote['connections'],
                    }
                    newObjects.push(newGuideSlide)
                }
                break

            case 'damage':
                break
        }
    }

    newObjects.sort((a, b) => getBeatForSort(a) - getBeatForSort(b))

    return {
        offset: uscB.offset,
        objects: newObjects,
    }
}
