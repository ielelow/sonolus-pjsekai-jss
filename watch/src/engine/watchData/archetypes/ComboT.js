import { skin, getZ, layer } from '../skin.js';
import { NormalLayout } from '../../../../../shared/src/engine/data/utils.js';
import { options } from '../../configuration/options.js';

export class ComboT extends SpawnableArchetype({
    t: Number,
    i: Number
})
{
    endTime = this.entityMemory(Number);
    layout = this.entityMemory(Quad);
    z = this.entityMemory(Number);
    entityArray = this.defineSharedMemory({
        value: Number,
        time: Number,
        length: Number,
        start: Number,
        combo: Number,
        Judgment: DataType,
        tail: Number,
        ap: Boolean
    })
    initialize() {
        this.z = getZ(layer.judgment, -this.spawnData.t, 0);
    }
    spawnTime() {
        return timeScaleChanges.at(this.spawnData.t).scaledTime;
    }
    despawnTime() {
        if (this.entityArray.get(this.spawnData.i).value != this.entityArray.get(this.entityArray.get(0).tail).value)
            return this.entityArray.get(this.entityArray.get(this.spawnData.i).value).time
        else
            return 999999
    }
    updateParallel() {
        const c = this.entityArray.get(this.spawnData.i).combo
        const h = 0.05 * ui.configuration.combo.scale
        const w = h * 3.22 * 6.65
        const centerX = 5.15
        const centerY = 0.475
        const s = c == 1 ? Math.ease('Out', 'Cubic', Math.min(1, Math.unlerp(this.spawnData.t, this.spawnData.t + 0.066, time.now))) : 1
        const a = c == 1 ? ui.configuration.combo.alpha * Math.ease('Out', 'Cubic', Math.min(1, Math.unlerp(this.spawnData.t, this.spawnData.t + 0.066, time.now))) : 1
        NormalLayout({
            l: centerX - (w * s) / 2,
            r: centerX + (w * s) / 2,
            t: centerY - (h * s) / 2,
            b: centerY + (h * s) / 2,
        }).copyTo(this.layout);
        if (c == 0) { }
        else if (this.entityArray.get(this.spawnData.i).ap == true || !options.ap)
            skin.sprites.combo.draw(this.layout, this.z, a);
        else
            skin.sprites.apcombo.draw(this.layout, this.z, a);
    }
}