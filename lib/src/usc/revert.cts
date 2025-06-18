import * as B from './ccIndex.cjs'
import * as A from './index.cjs'

/**
 * B 타입의 USC Easing 값을 A 타입으로 변환합니다.
 * 'inout'은 'in'으로, 'outin'은 'out'으로 매핑됩니다.
 * @param ease B 타입의 Easing 값
 * @returns A 타입의 Easing 값
 */
const convertEase = (ease: B.USCConnectionTickNote['ease']): A.USCConnectionTickNote['ease'] => {
    switch (ease) {
        case 'inout':
            return 'in'
        case 'outin':
            return 'out'
        case 'in':
        case 'out':
        case 'linear':
            return ease
        default:
            return 'linear'
    }
}

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
                    ease: convertEase(connection.ease),
                }
            }
            return {
                type: 'start',
                beat: connection.beat,
                lane: connection.lane,
                size: connection.size,
                critical: connection.critical,
                trace: connection.judgeType === 'trace',
                ease: convertEase(connection.ease),
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
                    ease: convertEase(connection.ease),
                }
            } else {
                return {
                    type: 'ignore',
                    beat: connection.beat,
                    lane: connection.lane,
                    size: connection.size,
                    ease: convertEase(connection.ease),
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
                    // A타입의 ignore 노트는 ease 속성이 필요하지만, B의 end 노트는 없습니다.
                    // 따라서 'linear'를 기본값으로 사용합니다.
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
 * B 타입의 USC 객체를 A 타입 USC 객체로 변환합니다.
 * @param uscB B 타입 USC 객체
 * @returns A 타입 USC 객체
 */
export const uscToUSC = (uscB: B.USC): A.USC => {
    const newObjects: A.USCObject[] = []

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
                newObjects.push({
                    type: 'single',
                    beat: object.beat,
                    lane: object.lane,
                    size: object.size,
                    critical: object.critical,
                    trace: object.trace,
                    // B타입의 'none' 방향은 A타입에 없으므로 undefined로 처리합니다.
                    direction: object.direction === 'none' ? undefined : object.direction,
                })
                break

            case 'slide':
                {
                    const newSlide: A.USCSlideNote = {
                        type: 'slide',
                        // B타입의 모든 slide는 A타입의 active slide로 간주합니다.
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
                // B타입의 timeScaleGroup을 A타입의 개별 timeScale 변경점으로 변환합니다.
                for (const change of object.changes) {
                    newObjects.push({
                        type: 'timeScale',
                        beat: change.beat,
                        timeScale: change.timeScale,
                    })
                }
                break

            case 'guide':
                {
                    // B타입의 guide를 A타입의 비활성(active: false) 슬라이드로 변환합니다.
                    const guideConnections = object.midpoints.map(
                        (midpoint): A.USCConnectionIgnoreNote => ({
                            type: 'ignore',
                            beat: midpoint.beat,
                            lane: midpoint.lane,
                            size: midpoint.size,
                            ease: convertEase(midpoint.ease),
                        }),
                    )

                    const newGuideSlide: A.USCSlideNote = {
                        type: 'slide',
                        active: false,
                        // B타입의 guide color가 'yellow'이면 critical로 판단합니다.
                        critical: object.color === 'yellow',
                        connections: guideConnections as A.USCSlideNote['connections'],
                    }
                    newObjects.push(newGuideSlide)
                }
                break

            // 'damage' 노트는 A타입에 없으므로 무시합니다.
            case 'damage':
                break
        }
    }

    return {
        offset: uscB.offset,
        objects: newObjects,
    }
}
