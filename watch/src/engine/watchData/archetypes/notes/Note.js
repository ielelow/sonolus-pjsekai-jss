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
        flickWarning: { name: 'flickWarning', type: Boolean },
        fast: { name: 'fast', type: Number },
        late: { name: 'late', type: Number },
    })
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
    targetTime = this.entityMemory(Number)
    preprocess() {
        if (options.mirror) this.import.lane *= -1
        this.targetTime = bpmChanges.at(this.import.beat).time
        if (this.hasInput) this.result.time = this.targetTime
        if (options.customJudgment || options.customCombo) {
            this.customCombo.get(this.info.index).time = this.hitTime
            this.customCombo.get(this.info.index).judgment = this.import.judgment
            this.customCombo.get(this.info.index).ap = replay.isReplay
                ? this.import.judgment != Judgment.Perfect
                    ? true
                    : false
                : false
            this.customCombo.get(this.info.index).accuracy =
                this.import.flickWarning == true
                    ? 3
                    : this.import.fast > this.import.accuracy
                      ? 1
                      : this.import.late < this.import.accuracy
                        ? 2
                        : 0
        }
    }
    get hitTime() {
        return this.targetTime + (replay.isReplay ? this.import.accuracy : 0)
    }
}
