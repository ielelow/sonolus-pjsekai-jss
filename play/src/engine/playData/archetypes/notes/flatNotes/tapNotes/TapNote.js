import { windows } from '../../../../../../../../shared/src/engine/data/windows.js';
import { claimStart, disallowEmpty, disallowEnd, getClaimedStart } from '../../../InputManager.js';
import { FlatNote } from '../FlatNote.js';
export class TapNote extends FlatNote {
    leniency = 0.75;
    judExport = this.defineExport({
        jud: { name: 'jud', type: Number },
    });
    updateSequential() {
        if (time.now < this.inputTime.min)
            return;
        claimStart(this.info.index, this.targetTime, this.hitbox, this.fullHitbox);
    }
    touch() {
        if (time.now < this.inputTime.min)
            return;
        const index = getClaimedStart(this.info.index);
        if (index === -1)
            return;
        this.complete(touches.get(index));
    }
    complete(touch) {
        disallowEmpty(touch);
        disallowEnd(touch, this.targetTime + windows.slideEndLockoutDuration);
        this.result.judgment = input.judge(touch.startTime, this.targetTime, this.windows);
        this.result.accuracy = touch.startTime - this.targetTime;
        this.result.bucket.index = this.bucket.index;
        this.result.bucket.value = this.result.accuracy * 1000;
        this.playHitEffects(touch.startTime);
        if (this.windows.perfect.min > this.result.accuracy)
            this.judExport('jud', 1);
        else if (this.windows.perfect.max < this.result.accuracy)
            this.judExport('jud', 2);
        this.despawn = true;
    }
}
