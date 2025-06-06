import { skin, getZ, layer } from '../skin.js';
import { NormalLayout } from '../../../../../shared/src/engine/data/utils.js';

export class ComboT extends SpawnableArchetype({
    c: Number,
    t: Number,
    ap: Boolean
})
{
    endTime = this.entityMemory(Number);
    layout = this.entityMemory(Quad);
    z = this.entityMemory(Number);
    ratio = this.entityMemory(Number);
    comboc = this.entityMemory(Number);
    combo = levelMemory(Number);
    check = this.entityMemory(Boolean);
    initialize() {
        this.endTime = 999999
        this.z = getZ(layer.judgment, -this.spawnData.t, 0);
    }
    updateParallel() {
        if (this.comboc != this.combo) {
            this.despawn = true;
            return;
        }
        this.ratio = 3.22;
        const h = 0.05 * ui.configuration.combo.scale
        const w = h * this.ratio * 7.315
        const centerX = 5.36
        const centerY = 0.475
        const s = this.spawnData.c == 0 ? Math.ease('Out', 'Cubic', Math.min(1, Math.unlerp(this.spawnData.t, this.spawnData.t + 0.066, time.now))) : 1
        const a = ui.configuration.combo.alpha * this.spawnData.c == 0 ? Math.ease('Out', 'Cubic', Math.min(1, Math.unlerp(this.spawnData.t, this.spawnData.t + 0.066, time.now))) : 1
        // 애니메이션 = s * (원래좌표) + (1 - s) * centerX, s * (원래좌표) + (1 - s) * centerY
        NormalLayout({
            l: centerX - (w * s) / 2,
            r: centerX + (w * s) / 2,
            t: centerY - (h * s) / 2,
            b: centerY + (h * s) / 2,
        }).copyTo(this.layout);
        if (this.spawnData.c == 0) {

        }
        else if (this.spawnData.ap)
            skin.sprites.combo.draw(this.layout, this.z, a);
        else
            skin.sprites.apcombo.draw(this.layout, this.z, a);
    }
    updateSequential() {
        if (!this.check) {
            this.combo += 1
            this.comboc = this.combo
        }
        this.check = true
    }
}
