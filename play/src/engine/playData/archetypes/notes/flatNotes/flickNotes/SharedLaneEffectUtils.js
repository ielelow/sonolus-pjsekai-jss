import { lane } from '../../../../../../../../shared/src/engine/data/lane.js'
import { perspectiveLayout } from '../../../../../../../../shared/src/engine/data/utils.js'
import { particle } from '../../../../particle.js'

export const SharedLaneEffectUtils = {
    isLaneOverlapping(newLeft, newRight, existingLeft, existingRight) {
        // 구간이 겹치는지(딱 붙어있는 경우는 제외)
        const isRangeOverlap = !(newRight <= existingLeft || newLeft >= existingRight)
        // 중심 거리 3 이하 조건
        const newCenter = (newLeft + newRight) / 2
        const existingCenter = (existingLeft + existingRight) / 2
        const isCenterClose = Math.abs(newCenter - existingCenter) <= 3
        // 두 조건 모두 true여야 오버랩
        return isRangeOverlap && isCenterClose
    },
    playAndHandleLaneEffect(note, idMemory, laneMemory) {
        const l = note.import.lane
        const left = note.import.lane - note.import.size
        const right = note.import.lane + note.import.size

        // 이펙트 먼저 생성
        const effectId = particle.effects.criticalFlickLane.spawn(
            perspectiveLayout({
                l: left,
                r: right,
                b: lane.b,
                t: lane.t,
            }),
            1,
            false,
        )
        if (this.isLaneOverlapping(left, right, laneMemory.l.get(l), laneMemory.r.get(l))) {
            particle.effects.destroy(idMemory.get(l))
        }
        idMemory.set(l, effectId)
        laneMemory.l.set(l, left)
        laneMemory.r.set(l, right)
    },
}
