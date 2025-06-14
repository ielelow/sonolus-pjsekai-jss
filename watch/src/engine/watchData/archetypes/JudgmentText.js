import { NormalLayout } from '../../../../../shared/src/engine/data/utils.js'
import { options } from '../../configuration/options.js'
import { getZ, layer, skin } from '../skin.js'

export class JudgmentText extends SpawnableArchetype({
    t: Number,
    j: DataType,
}) {
    endTime = this.entityMemory(Number)
    layout = this.entityMemory(Quad)
    z = this.entityMemory(Number)
    combo = levelMemory(Number)
    comboc = this.entityMemory(Number)
    check = this.entityMemory(Boolean)
    ratio = this.entityMemory(Number)
    initialize() {
        this.endTime = this.spawnData.t + 0.5
        this.z = getZ(layer.judgment, -this.spawnData.t, 0)
    }
    spawnTime() {
        return timeScaleChanges.at(this.spawnData.t).scaledTime
    }
    despawnTime() {
        if (this.check == true && this.comboc != this.combo)
            return timeScaleChanges.at(bpmChanges.at(time.now).time).scaledTime
        else return timeScaleChanges.at(this.spawnData.t + 0.5).scaledTime
    }
    updateParallel() {
        if (this.check == true && this.comboc != this.combo) {
            this.despawnTime
            return
        }
        const h = 0.1 * ui.configuration.judgment.scale
        const w = h * 25.5
        const centerX = 0
        const centerY = 0.78
        const s = Math.ease(
            'Out',
            'Cubic',
            Math.min(1, Math.unlerp(this.spawnData.t, this.spawnData.t + 0.066, time.now)),
        )
        const a =
            ui.configuration.judgment.alpha *
            Math.ease(
                'Out',
                'Cubic',
                Math.min(1, Math.unlerp(this.spawnData.t, this.spawnData.t + 0.066, time.now)),
            )
        NormalLayout({
            l: centerX - (w * s) / 2,
            r: centerX + (w * s) / 2,
            t: centerY - (h * s) / 2,
            b: centerY + (h * s) / 2,
        }).copyTo(this.layout)
        if (replay.isReplay) {
            switch (this.spawnData.j) {
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
        } else {
            if (options.auto) skin.sprites.auto.draw(this.layout, this.z, a)
            else skin.sprites.perfect.draw(this.layout, this.z, a)
        }
    }
    updateSequential() {
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
