import { skin, getZ, layer } from '../skin.js';
import { NormalLayout } from '../../../../../shared/src/engine/data/utils.js';
import { options } from '../../configuration/options.js';

export class ComboT extends SpawnableArchetype({
    t: Number,
    ap: Boolean,
    j: DataType,
})
{
    endTime = this.entityMemory(Number);
    layout = this.entityMemory(Quad);
    z = this.entityMemory(Number);
    comboc = this.entityMemory(Number);
    combo = levelMemory(Number);
    check = this.entityMemory(Boolean);
    initialize() {
        this.z = getZ(layer.judgment, -this.spawnData.t, 0);
    }
    spawnTime() {
        return timeScaleChanges.at(this.spawnData.t).scaledTime;
    }
    despawnTime() {
        if (this.check == true && this.comboc != this.combo)
            return timeScaleChanges.at(bpmChanges.at(time.now).time).scaledTime;
        else
            return 999999;
    }
    updateParallel() {
        if (this.check == true && this.comboc != this.combo) {
            this.despawnTime
            return
        }
        const h = 0.05 * ui.configuration.combo.scale
        const w = h * 3.22 * 6.65
        const centerX = 5.15
        const centerY = 0.475
        const s = this.combo == 0 ? Math.ease('Out', 'Cubic', Math.min(1, Math.unlerp(this.spawnData.t, this.spawnData.t + 0.066, time.now))) : 1
        const a = this.combo == 0 ? ui.configuration.combo.alpha * Math.ease('Out', 'Cubic', Math.min(1, Math.unlerp(this.spawnData.t, this.spawnData.t + 0.066, time.now))) : 1
        NormalLayout({
            l: centerX - (w * s) / 2,
            r: centerX + (w * s) / 2,
            t: centerY - (h * s) / 2,
            b: centerY + (h * s) / 2,
        }).copyTo(this.layout);
        if (this.combo == 0) { }
        else if (this.spawnData.ap || !options.ap)
            skin.sprites.combo.draw(this.layout, this.z, a);
        else
            skin.sprites.apcombo.draw(this.layout, this.z, a);
    }
    updateSequential() {
        if (!this.check) {
            if (replay.isReplay && (this.spawnData.j == Judgment.Good || this.spawnData.j == Judgment.Miss)) {
                this.combo = 0
                this.comboc = -999
            }
            else {
                this.combo += 1
                this.comboc = this.combo
            }
        }
        this.check = true
    }
    terminate() {
        this.check = false
    }
}