import { skin, getZ, layer } from '../skin.js';
import { NormalLayout } from '../../../../../shared/src/engine/data/utils.js';
export class JudgmentAccuracy extends SpawnableArchetype({
    j: DataType,
    t: Number,
    accuracy: Number,
    fastLate: Number,
    flick: Boolean,
})
{
    endTime = this.entityMemory(Number);
    layout = this.entityMemory(Quad);
    z = this.entityMemory(Number);
    combo = levelMemory(Number);
    comboc = this.entityMemory(Number);
    check = this.entityMemory(Boolean)
    ratio = this.entityMemory(Number);
    spawnTime() {
        return timeScaleChanges.at(this.spawnData.t).scaledTime;
    }
    despawnTime() {
        if (this.check == true && this.comboc != this.combo)
            return timeScaleChanges.at(bpmChanges.at(time.now).time).scaledTime;
        else
            return timeScaleChanges.at(this.spawnData.t + 0.5).scaledTime;
    }
    initialize() {
        this.endTime = this.spawnData.t + 0.5;
        this.z = getZ(layer.judgment, -this.spawnData.t, 0);
    }
    updateParallel() {
        if (this.check == true && this.comboc != this.combo) {
            this.despawnTime
            return
        }
        const h = 0.06 * ui.configuration.judgment.scale
        const w = h * 20
        const centerX = 0
        const centerY = 0.72
        const s = Math.ease('Out', 'Cubic', Math.min(1, Math.unlerp(this.spawnData.t, this.spawnData.t + 0.066, time.now)))
        const a = ui.configuration.judgment.alpha * Math.ease('Out', 'Cubic', Math.min(1, Math.unlerp(this.spawnData.t, this.spawnData.t + 0.066, time.now)))
        NormalLayout({
            l: centerX - (w * s) / 2,
            r: centerX + (w * s) / 2,
            t: centerY - (h * s) / 2,
            b: centerY + (h * s) / 2,
        }).copyTo(this.layout);
        if (this.spawnData.j != Judgment.Perfect && this.spawnData.j != Judgment.Miss) {
            if (this.spawnData.flick == true)
                skin.sprites.flick.draw(this.layout, this.z, a);
            else if (this.spawnData.fastLate == 1)
                skin.sprites.fast.draw(this.layout, this.z, a);
            else if (this.spawnData.fastLate == 2)
                skin.sprites.late.draw(this.layout, this.z, a);
        }
    }
    updateSequential() {
        if (this.spawnData.j != Judgment.Perfect && this.spawnData.j != Judgment.Miss)
            if (!this.check) {
                this.combo += 1
                this.comboc = this.combo
            }
        this.check = true
    }
    terminate() {
        this.check = false
    }
}