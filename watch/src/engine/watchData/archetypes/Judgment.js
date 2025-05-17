import { skin, getZ, layer } from '../skin.js';
import { NormalLayout } from '../../../../../shared/src/engine/data/utils.js';
import { options } from '../../configuration/options.js';

export class Judg extends SpawnableArchetype({
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
        this.endTime = this.spawnData.t + 1;
        this.z = getZ(layer.judgment, -this.spawnData.t, 0);
    }
    spawnTime() {
        return timeScaleChanges.at(this.spawnData.t).scaledTime;
    }
    despawnTime() {
        if (this.check == true && this.comboc != this.combo)
            return timeScaleChanges.at(bpmChanges.at(time.now).time).scaledTime;
        else
            return timeScaleChanges.at(this.spawnData.t + 0.5).scaledTime;
    }
    updateParallel() {
        if (this.check == true && this.comboc != this.combo) {
            this.despawnTime
            return
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
        if (options.auto)
            this.ratio = 2.23;
        else
            this.ratio = 3.83;
        const h = stage.h * 0.052 * ui.configuration.judgment.scale
        const w = h * this.ratio * 5.8
        const centerX = 0
        const centerY = stage.h * 0.38
        const s = Math.min(1, Math.unlerp(this.spawnData.t, this.spawnData.t + 0.07, time.now));
        NormalLayout({
            l: centerX - (w * s) / 2,
            r: centerX + (w * s) / 2,
            t: centerY - (h * s) / 2,
            b: centerY + (h * s) / 2,
        }).copyTo(this.layout);
        if (options.auto)
            skin.sprites.auto.draw(this.layout, this.z, 1);
        else
            skin.sprites.perfect.draw(this.layout, this.z, 1);
    }
    updateSequential() {
        if (!this.check) {
            this.combo += 1
            this.comboc = this.combo
        }
        this.check = true
    }
}