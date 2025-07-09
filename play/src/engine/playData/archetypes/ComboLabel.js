import { NormalLayout } from '../../../../../shared/src/engine/data/utils.js'
import { getZ, layer, skin } from '../skin.js'
import { options } from '../../configuration/options.js'
import { archetypes } from './index.js'
export class ComboLabel extends SpawnableArchetype({}) {
    endTime = this.entityMemory(Number)
    z = this.entityMemory(Number)
    z2 = this.entityMemory(Number)
    initialize() {
        this.endTime = 999999
        this.z = getZ(layer.judgment, 0, 0)
        this.z2 = getZ(layer.judgment - 1, 0, 0)
    }
    updateParallel() {
        const h = 0.0425 * ui.configuration.combo.scale
        const w = h * 3.22 * 6.65
        const hg = 0.06 * ui.configuration.combo.scale
        const wg = h * 3.22 * 8
        const centerX = 5.45
        const centerY = 0.48
        const a = ui.configuration.combo.alpha * 1
        const a2 = ui.configuration.combo.alpha * 0.8 * ((Math.cos(time.now * Math.PI) + 1) / 2)
        const layout = NormalLayout({
            l: centerX - w / 2,
            r: centerX + w / 2,
            t: centerY - h / 2,
            b: centerY + h / 2,
        })
        const glow = NormalLayout({
            l: centerX - wg / 2,
            r: centerX + wg / 2,
            t: centerY - hg / 2,
            b: centerY + hg / 2,
        })
        if (this.customCombo.combo == 0)
            return
        else if (this.customCombo.ap || !options.ap)
            skin.sprites.combo.draw(layout, this.z, a)
        else {
            skin.sprites.apCombo.draw(layout, this.z, a)
            skin.sprites.glowCombo.draw(glow, this.z2, a2)
        }
    }
    get customCombo() {
        return archetypes.Stage.customCombo.get(0)
    }
}
