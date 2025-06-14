import { EngineArchetypeDataName } from '@sonolus/core'
import { options } from '../../../configuration/options.js'
import { archetypes } from '../index.js'
export class Note extends Archetype {
    hasInput = true
    preprocessOrder = 0
    import = this.defineImport({
        beat: { name: EngineArchetypeDataName.Beat, type: Number },
        lane: { name: 'lane', type: Number },
        size: { name: 'size', type: Number },
        judgment: { name: EngineArchetypeDataName.Judgment, type: DataType },
        accuracy: { name: EngineArchetypeDataName.Accuracy, type: Number },
        flick: { name: 'flick', type: Boolean },
        jud: { name: 'jud', type: Number },
    })
    entityArray = this.defineSharedMemory({
        value: Number,
        time: Number,
        length: Number,
        start: Number,
        combo: Number,
        Judgment: DataType,
        tail: Number,
        ap: Boolean,
    })
    targetTime = this.entityMemory(Number)
    check = levelMemory(Boolean)
    combo = levelMemory(Number)
    preprocess() {
        if (options.mirror) this.import.lane *= -1
        this.targetTime = bpmChanges.at(this.import.beat).time
        if (this.hasInput) this.result.time = this.targetTime
        if (options.customJudgment) {
            archetypes.JudgmentText.spawn({
                t: this.targetTime,
                j: this.import.judgment,
            })
            if (options.fastLate && replay.isReplay) {
                archetypes.JudgmentAccuracy.spawn({
                    t: this.targetTime,
                    j: this.import.judgment,
                    accuracy: this.import.accuracy,
                    fastLate: this.import.jud,
                    flick: this.import.flick,
                })
            }
        }
        if (options.customCombo) {
            if (!options.autoCombo || replay.isReplay) {
                this.entityArray.get(this.info.index).time = timeScaleChanges.at(
                    this.targetTime,
                ).scaledTime
                this.entityArray.get(this.info.index).Judgment = this.import.judgment
                archetypes.ComboNumber.spawn({
                    t: this.targetTime,
                    i: this.info.index,
                })
                archetypes.ComboNumberGlow.spawn({
                    t: this.targetTime,
                    i: this.info.index,
                })
                archetypes.ComboNumberEffect.spawn({
                    t: this.targetTime,
                    i: this.info.index,
                })
                archetypes.ComboLabel.spawn({ t: this.targetTime, i: this.info.index })
            }
        }
    }
}
