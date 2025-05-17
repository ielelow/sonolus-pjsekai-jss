import { skin, getZ, layer } from '../skin.js';
import { NormalLayout } from '../../../../../shared/src/engine/data/utils.js';
import { options } from '../../configuration/options.js';

export class Judg extends SpawnableArchetype({
    j: Number,
    t: Number
})
{
    endTime = this.entityMemory(Number);
    layout = this.entityMemory(Quad);
    z = this.entityMemory(Number);
    combo = levelMemory(Number);
    comboc = this.entityMemory(Number);
    check = this.entityMemory(Boolean)
    ratio = this.entityMemory(Number);
    initialize() {
        this.endTime = this.spawnData.t + 0.5;
        this.z = getZ(layer.judgment, -this.spawnData.t, 0);
    }
    updateParallel() {
        if (time.now >= this.endTime) {
            this.despawn = true;
            return;
        }
        if (this.comboc != this.combo) {
            this.despawn = true;
            return;
        }
        const targetAspectRatio = 16 / 9;
        const stage = {
            w: options.lockStageAspectRatio
                ? screen.aspectRatio >= targetAspectRatio
                    ? targetAspectRatio * screen.h
                    : screen.w
                : screen.w,
            h: options.lockStageAspectRatio
                ? screen.aspectRatio >= targetAspectRatio
                    ? screen.h
                    : screen.w / targetAspectRatio
                : screen.h,
        };
        switch (this.spawnData.j) {
            case Judgment.Perfect:
                this.ratio = 3.83;
                break;
            case Judgment.Great:
                this.ratio = 3.49;
                break;
            case Judgment.Good:
                this.ratio = 2.65;
                break;
            case Judgment.Miss:
                this.ratio = 2.23;
                break;
        }
        const h = stage.h * 0.052 * ui.configuration.judgment.scale
        const w = h * this.ratio * 6
        const centerX = 0
        const centerY = stage.h * 0.38
        const s = Math.min(1, Math.unlerp(this.spawnData.t, this.spawnData.t + 0.07, time.now));
        NormalLayout({
            l: centerX - (w * s) / 2,
            r: centerX + (w * s) / 2,
            t: centerY - (h * s) / 2,
            b: centerY + (h * s) / 2,
        }).copyTo(this.layout);
        switch (this.spawnData.j) {
            case Judgment.Perfect:
                skin.sprites.perfect.draw(this.layout, this.z, 1);
                break;
            case Judgment.Great:
                skin.sprites.great.draw(this.layout, this.z, 1);
                break;
            case Judgment.Good:
                skin.sprites.good.draw(this.layout, this.z, 1);
                break;
            case Judgment.Miss:
                skin.sprites.miss.draw(this.layout, this.z, 1);
                break;
        }
    }
    updateSequential() {
        if (!this.check) {
            this.combo += 1
            this.comboc = this.combo
        }
        this.check = true
    }
}