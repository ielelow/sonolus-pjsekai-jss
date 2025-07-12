import { options } from '../../../../configuration/options.js'
import { getHitbox } from '../../../lane.js'
import { archetypes } from '../../index.js'
import { disallowEmpty } from '../../InputManager.js'
import { Note } from '../Note.js'
export class SlideTickNote extends Note {
    leniency = 1
    inputTime = this.entityMemory(Number)
    globalPreprocess() {
        if (this.hasInput) this.life.miss = -40
    }
    preprocess() {
        super.preprocess()
        this.inputTime = this.targetTime + input.offset
        this.spawnTime = timeScaleChanges.at(this.inputTime).scaledTime
    }
    initialize() {
        getHitbox({
            l: this.import.lane - this.import.size,
            r: this.import.lane + this.import.size,
            leniency: this.leniency,
        }).copyTo(this.fullHitbox)
        this.result.accuracy = 0.125
    }
    touch() {
        if (time.now < this.inputTime) return
        for (const touch of touches) {
            if (!this.fullHitbox.contains(touch.position)) continue
            this.complete(touch)
            return
        }
    }
    updateParallel() {
        if (time.now > this.inputTime) this.despawn = true
    }
    complete(touch) {
        disallowEmpty(touch)
        this.result.judgment = Judgment.Perfect
        this.result.accuracy = 0
        this.playHitEffects()
        this.despawn = true
    }
    playHitEffects() {}
    terminate() {
        if (options.customJudgment)
            archetypes.JudgmentText.spawn({
                time: time.now,
                judgment: this.result.judgment,
            })
        if (options.customCombo) {
            archetypes.ComboNumber.spawn({
                time: time.now,
                judgment: this.result.judgment,
            })
            archetypes.ComboNumberEffect.spawn({
                time: time.now,
                judgment: this.result.judgment,
            })
            archetypes.ComboNumberGlow.spawn({
                time: time.now,
                judgment: this.result.judgment,
            })
            archetypes.ComboLabel.spawn({
                time: time.now,
                judgment: this.result.judgment,
            })
        }
    }
}
