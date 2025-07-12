import { NormalLayout } from '../../../../../shared/src/engine/data/utils.js'
import { getZ, layer, skin } from '../skin.js'
import { archetypes } from './index.js'

export class JudgmentAccuracy extends SpawnableArchetype({
    time: Number,
    judgment: Number,
    accuracy: Number,
    min: Number,
    max: Number,
    flick: Boolean
}) {
    layout = this.entityMemory(Quad)
    accuracy = this.entityMemory(Number)
    z = this.entityMemory(Number)
    check = this.entityMemory(Boolean)
    combo = this.entityMemory(Number)
    comboCheck = levelMemory(Number)
    initialize() {
        this.z = getZ(layer.judgment, 0, 0)
    }
    updateParallel() {
        if (this.spawnData.judgment == Judgment.Perfect || this.spawnData.judgment == Judgment.Miss) {
            this.despawn = true
            return
        }
        if (this.combo != this.comboCheck) {
            this.despawn = true
            return
        }
        if (time.now >= this.spawnData.time + 1) {
            this.despawn = true
            return
        }
        const h = 0.06 * ui.configuration.judgment.scale
        const w = h * 20
        const centerX = 0
        const centerY = 0.72
        const s = Math.ease(
            'Out',
            'Cubic',
            Math.min(1, Math.unlerp(this.spawnData.time, this.spawnData.time + 0.066, time.now)),
        )
        const a =
            ui.configuration.judgment.alpha *
            Math.ease(
                'Out',
                'Cubic',
                Math.min(1, Math.unlerp(this.spawnData.time, this.spawnData.time + 0.066, time.now)),
            )
        NormalLayout({
            l: centerX - (w * s) / 2,
            r: centerX + (w * s) / 2,
            t: centerY - (h * s) / 2,
            b: centerY + (h * s) / 2,
        }).copyTo(this.layout)
        if (this.accuracy == 3) skin.sprites.flick.draw(this.layout, this.z, a)
        else if (this.accuracy == 1) skin.sprites.fast.draw(this.layout, this.z, a)
        else if (this.accuracy == 2) skin.sprites.late.draw(this.layout, this.z, a)
    }
    updateSequential() {
        if (this.check) return
        this.check = true
        if (this.spawnData.judgment == Judgment.Perfect || this.spawnData.judgment == Judgment.Miss) return
        this.comboCheck += 1
        this.combo = this.comboCheck
        if (this.spawnData.judgment == Judgment.Great || this.spawnData.judgment == Judgment.Good) {
            if (this.spawnData.flick == true) this.accuracy = 3
            else if (this.spawnData.min > this.spawnData.accuracy) this.accuracy = 1
            else if (this.spawnData.max < this.spawnData.accuracy) this.accuracy = 2
        } else this.accuracy = 0
    }
    terminate() {
        this.check = false
        this.combo = 0
        this.accuracy = 0
    }
}
