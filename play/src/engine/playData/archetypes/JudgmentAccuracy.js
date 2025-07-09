import { NormalLayout } from '../../../../../shared/src/engine/data/utils.js'
import { getZ, layer, skin } from '../skin.js'
import { archetypes } from './index.js'

export class JudgmentAccuracy extends SpawnableArchetype({}) {
    endTime = this.entityMemory(Number)
    layout = this.entityMemory(Quad)
    z = this.entityMemory(Number)
    ratio = this.entityMemory(Number)
    initialize() {
        this.endTime = 999999
        this.z = getZ(layer.judgment, 0, 0)
    }
    updateParallel() {
        if (this.customCombo.accuracyTime + 1 < time.now)
            return
        const h = 0.06 * ui.configuration.judgment.scale
        const w = h * 20
        const centerX = 0
        const centerY = 0.72
        const s = Math.ease(
            'Out',
            'Cubic',
            Math.min(1, Math.unlerp(this.customCombo.accuracyTime, this.customCombo.accuracyTime + 0.066, time.now)),
        )
        const a = ui.configuration.judgment.alpha *
            Math.ease(
                'Out',
                'Cubic',
                Math.min(1, Math.unlerp(this.customCombo.accuracyTime, this.customCombo.accuracyTime + 0.066, time.now)),
            )
        NormalLayout({
            l: centerX - (w * s) / 2,
            r: centerX + (w * s) / 2,
            t: centerY - (h * s) / 2,
            b: centerY + (h * s) / 2,
        }).copyTo(this.layout)
        if (this.customCombo.accuracy == 3)
            skin.sprites.flick.draw(this.layout, this.z, a)
        else if (this.customCombo.accuracy == 1)
            skin.sprites.fast.draw(this.layout, this.z, a)
        else if (this.customCombo.accuracy == 2)
            skin.sprites.late.draw(this.layout, this.z, a)
    }
    get customCombo() {
        return archetypes.Stage.customCombo.get(0)
    }
}
