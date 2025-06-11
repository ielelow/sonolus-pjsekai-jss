import { particle } from "../../../../particle.js";

export const SharedLaneEffectUtils = {
  isLaneOverlapping(newLeft, newRight, existingLeft, existingRight) {
    // 구간이 겹치는지(딱 붙어있는 경우는 제외)
    const isRangeOverlap = !(
      newRight <= existingLeft || newLeft >= existingRight
    );
    // 중심 거리 3 이하 조건
    const newCenter = (newLeft + newRight) / 2;
    const existingCenter = (existingLeft + existingRight) / 2;
    const isCenterClose = Math.abs(newCenter - existingCenter) <= 3;
    // 두 조건 모두 true여야 오버랩
    return isRangeOverlap && isCenterClose;
  },
  playAndHandleLaneEffect(id, l, r, memory) {
    if (memory.id1 !== 0 && memory.id1 !== id) {
      if (this.isLaneOverlapping(l, r, memory.lanes1.l, memory.lanes1.r)) {
        particle.effects.destroy(memory.id1);
        memory.id1 = 0;
        memory.lanes1.l = 0;
        memory.lanes1.r = 0;
        memory.count--;
      }
    }
    if (memory.id2 !== 0 && memory.id2 !== id) {
      if (this.isLaneOverlapping(l, r, memory.lanes2.l, memory.lanes2.r)) {
        particle.effects.destroy(memory.id2);
        memory.id2 = 0;
        memory.lanes2.l = 0;
        memory.lanes2.r = 0;
        memory.count--;
      }
    }
    if (memory.id3 !== 0 && memory.id3 !== id) {
      if (this.isLaneOverlapping(l, r, memory.lanes3.l, memory.lanes3.r)) {
        particle.effects.destroy(memory.id3);
        memory.id3 = 0;
        memory.lanes3.l = 0;
        memory.lanes3.r = 0;
        memory.count--;
      }
    }
    if (memory.id4 !== 0 && memory.id4 !== id) {
      if (this.isLaneOverlapping(l, r, memory.lanes4.l, memory.lanes4.r)) {
        particle.effects.destroy(memory.id4);
        memory.id4 = 0;
        memory.lanes4.l = 0;
        memory.lanes4.r = 0;
        memory.count--;
      }
    }

    // FIFO 처리
    if (memory.count >= 4) {
      memory.id4 = memory.id3;
      memory.lanes4.l = memory.lanes3.l;
      memory.lanes4.r = memory.lanes3.r;

      memory.id3 = memory.id2;
      memory.lanes3.l = memory.lanes2.l;
      memory.lanes3.r = memory.lanes2.r;

      memory.id2 = memory.id1;
      memory.lanes2.l = memory.lanes1.l;
      memory.lanes2.r = memory.lanes1.r;

      memory.id1 = 0;
      memory.lanes1.l = 0;
      memory.lanes1.r = 0;

      memory.count--;
    }

    // 새 이펙트 메모리 등록
    if (memory.id1 === 0) {
      memory.id1 = id;
      memory.lanes1.l = l;
      memory.lanes1.r = r;
    } else if (memory.id2 === 0) {
      memory.id2 = id;
      memory.lanes2.l = l;
      memory.lanes2.r = r;
    } else if (memory.id3 === 0) {
      memory.id3 = id;
      memory.lanes3.l = l;
      memory.lanes3.r = r;
    } else if (memory.id4 === 0) {
      memory.id4 = id;
      memory.lanes4.l = l;
      memory.lanes4.r = r;
    }
    memory.count++;
  },
};
