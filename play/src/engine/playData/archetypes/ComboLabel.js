import { skin, getZ, layer } from '../skin.js';
import { NormalLayout } from '../../../../../shared/src/engine/data/utils.js';

export class ComboLabel extends SpawnableArchetype({
    c: Number,
    t: Number,
    ap: Boolean
})
{
    endTime = this.entityMemory(Number);
    z = this.entityMemory(Number);
    z2 = this.entityMemory(Number);
    comboc = this.entityMemory(Number);
    combo = levelMemory(Number);
    check = this.entityMemory(Boolean);
    initialize() {
        this.endTime = 999999
        this.z = getZ(layer.judgment, -this.spawnData.t, 0);
        this.z2 = getZ(layer.judgment - 1, -this.spawnData.t, 0);
    }
    updateParallel() {
        if (this.comboc != this.combo) {
            this.despawn = true;
            return;
        }
        const h = 0.0425 * ui.configuration.combo.scale
        const w = h * 3.22 * 6.65
        const hg = 0.06 * ui.configuration.combo.scale
        const wg = h * 3.22 * 8
        const centerX = 5.45
        const centerY = 0.48
        const s = this.spawnData.c == 0 ? Math.ease('Out', 'Cubic', Math.min(1, Math.unlerp(this.spawnData.t, this.spawnData.t + 0.066, time.now))) : 1
        const a = ui.configuration.combo.alpha * this.spawnData.c == 0 ? Math.ease('Out', 'Cubic', Math.min(1, Math.unlerp(this.spawnData.t, this.spawnData.t + 0.066, time.now))) : 1
        const a2 = ui.configuration.combo.alpha * 0.8 * ((Math.cos(time.now * Math.PI) + 1) / 2)
        // 애니메이션 = s * (원래좌표) + (1 - s) * centerX, s * (원래좌표) + (1 - s) * centerY
        const layout = NormalLayout({
            l: centerX - (w * s) / 2,
            r: centerX + (w * s) / 2,
            t: centerY - (h * s) / 2,
            b: centerY + (h * s) / 2,
        })
        const glow = NormalLayout({
            l: centerX - (wg * s) / 2,
            r: centerX + (wg * s) / 2,
            t: centerY - (hg * s) / 2,
            b: centerY + (hg * s) / 2,
        })
        if (this.spawnData.c == 0) {

        }
        else if (this.spawnData.ap)
            skin.sprites.combo.draw(layout, this.z, a);
        else {
            skin.sprites.apCombo.draw(layout, this.z, a);
            skin.sprites.glowCombo.draw(glow, this.z2, a2);
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