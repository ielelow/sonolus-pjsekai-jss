import { NormalLayout } from '../../../../../shared/src/engine/data/utils.js'
import { options } from '../../configuration/options.js'
import { getZ, layer, skin } from '../skin.js'

export class JudgmentText extends SpawnableArchetype({}) {
    preprocessOrder = 5
    check = this.entityMemory(Boolean)
    head = this.entityMemory(Number)
    layout = this.entityMemory(Quad)
    z = this.entityMemory(Number)
    customCombo = this.defineSharedMemory({
        value: Number,
        time: Number,
        scaledTime: Number,
        length: Number,
        start: Number,
        combo: Number,
        judgment: DataType,
        tail: Number,
        ap: Boolean,
        accuracy: Number,
    })
    initialize() {
        this.z = getZ(layer.judgment, 0, 0)
        this.head = this.customCombo.get(0).start
    }
    spawnTime() {
        return -999999
    }
    despawnTime() {
        return 999999
    }
    updateParallel() {
        if (time.now <= this.customCombo.get(this.customCombo.get(0).start).time && this.check) {
            this.head = this.customCombo.get(0).start
            this.check = false
        }
        if (time.skip) {
            let ptr = this.customCombo.get(this.customCombo.get(0).start).value
            const tail = this.customCombo.get(0).tail
            while (ptr != tail && ptr != this.customCombo.get(0).start) {
                const currentNodeTime = this.customCombo.get(this.customCombo.get(ptr).value).time
                if (currentNodeTime > time.now) {
                    this.head = ptr
                    this.check = true
                    break
                }
                ptr = this.customCombo.get(ptr).value
            }
        }
        while (
            time.now >= this.customCombo.get(this.customCombo.get(this.head).value).time &&
            this.head != this.customCombo.get(0).tail
        ) {
            this.head = this.customCombo.get(this.head).value
            this.check = true
        }
        if (time.now < this.customCombo.get(this.customCombo.get(0).start).time) return
        if (this.customCombo.get(this.head).time + 1 < time.now) return
        const t = this.customCombo.get(this.head).time
        const h = 0.1 * ui.configuration.judgment.scale
        const w = h * 25.5
        const centerX = 0
        const centerY = 0.79
        const s = Math.ease('Out', 'Cubic', Math.min(1, Math.unlerp(t, t + 0.066, time.now)))
        const a =
            ui.configuration.judgment.alpha *
            Math.ease('Out', 'Cubic', Math.min(1, Math.unlerp(t, t + 0.066, time.now)))
        NormalLayout({
            l: centerX - (w * s) / 2,
            r: centerX + (w * s) / 2,
            t: centerY - (h * s) / 2,
            b: centerY + (h * s) / 2,
        }).copyTo(this.layout)
        if (replay.isReplay) {
            switch (this.customCombo.get(this.head).judgment) {
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
}
