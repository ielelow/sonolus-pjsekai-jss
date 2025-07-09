import { NormalLayout } from '../../../../../shared/src/engine/data/utils.js'
import { getZ, layer, skin } from '../skin.js'
import { archetypes } from './index.js'

export class JudgmentText extends SpawnableArchetype({}) {
    endTime = this.entityMemory(Number)
    layout = this.entityMemory(Quad)
    z = this.entityMemory(Number)
    combo = levelMemory(Number)
    comboc = this.entityMemory(Number)
    check = this.entityMemory(Boolean)
    ratio = this.entityMemory(Number)
    initialize() {
        this.endTime = 999999
        this.z = getZ(layer.judgment, 0, 0)
    }
    updateParallel() {
        const h = 0.1 * ui.configuration.judgment.scale
        const w = h * 25.5
        const centerX = 0
        const centerY = 0.78
        const s = Math.ease(
            'Out',
            'Cubic',
            Math.min(1, Math.unlerp(this.customCombo.time, this.customCombo.time + 0.066, time.now)),
        )
        const a =
            time.now > this.customCombo.time + 2
                ? 0
                : ui.configuration.judgment.alpha *
                Math.ease(
                    'Out',
                    'Cubic',
                    Math.min(1, Math.unlerp(this.customCombo.time, this.customCombo.time + 0.066, time.now)),
                )
        NormalLayout({
            l: centerX - (w * s) / 2,
            r: centerX + (w * s) / 2,
            t: centerY - (h * s) / 2,
            b: centerY + (h * s) / 2,
        }).copyTo(this.layout)
        switch (this.customCombo.judgment) {
            case Judgment.Perfect:
                skin.sprites.perfect.draw(this.layout, this.z, a)
                break
            case Judgment.Great:
                skin.sprites.great.draw(this.layout, this.z, a)
                break
            case Judgment.Good:
                skin.sprites.good.draw(this.layout, this.z, a)
                break
            case Judgment.Miss:
                skin.sprites.miss.draw(this.layout, this.z, a)
                break
        }
    }
    updateSequential() {
        if (!this.check) {
            this.combo += 1
            this.comboc = this.combo
        }
        this.check = true
    }
    get customCombo() {
        return archetypes.Stage.customCombo.get(0)
    }
}
