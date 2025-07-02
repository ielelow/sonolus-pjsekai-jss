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
    playAndHandleLaneEffect(id, lane, l, r, idMemory, laneMemory) {
        if (this.isLaneOverlapping(l, r, laneMemory.l.get(lane), laneMemory.r.get(lane))) {
            particle.effects.destroy(idMemory.get(lane))
        }
        idMemory.set(lane, id)
        laneMemory.l.set(lane, l)
        laneMemory.r.set(lane, r)
    },
}
