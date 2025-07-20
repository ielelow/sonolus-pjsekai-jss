import { EngineArchetypeDataName } from '@sonolus/core'
import { options } from '../../../configuration/options.js'
import { archetypes } from '../index.js'
export class Note extends Archetype {
    hasInput = true
    import = this.defineImport({
        beat: { name: EngineArchetypeDataName.Beat, type: Number },
        lane: { name: 'lane', type: Number },
        size: { name: 'size', type: Number },
    })
    accuracyExport = this.defineExport({
        fast: { name: 'fast', type: Number },
        late: { name: 'late', type: Number },
    })
    sharedMemory = this.defineSharedMemory({
        lastActiveTime: Number,
        exportStartTime: Number,
        circular: ParticleEffectInstanceId,
        linear: ParticleEffectInstanceId,
        noneMoveLinear: Number,
        slotEffects: Number,
        flick: Boolean,
    })
    targetTime = this.entityMemory(Number)
    spawnTime = this.entityMemory(Number)
    hitbox = this.entityMemory(Rect)
    fullHitbox = this.entityMemory(Rect)
    preprocess() {
        this.sharedMemory.lastActiveTime = -1000
        this.sharedMemory.exportStartTime = -1000
        this.targetTime = bpmChanges.at(this.import.beat).time
        if (options.mirror) {
            this.import.lane *= -1
        }
    }
    spawnOrder() {
        return 1000 + this.spawnTime
    }
    shouldSpawn() {
        return time.scaled >= this.spawnTime
    }
    updateSequentialOrder = 2
    terminate() {
        this.accuracyExport('fast', this.windows.perfect.min)
        this.accuracyExport('late', this.windows.perfect.max)
        if (this.result.judgment == Judgment.Miss && options.customDamage)
            archetypes.Damage.spawn({
                time: time.now,
            })
        if (options.customJudgment)
            archetypes.JudgmentText.spawn({
                time: time.now,
                judgment: this.result.judgment,
            })
        if (
            options.fastLate &&
            this.result.judgment != Judgment.Perfect &&
            this.result.judgment != Judgment.Miss
        )
            archetypes.JudgmentAccuracy.spawn({
                time: time.now,
                judgment: this.result.judgment,
                accuracy: this.result.accuracy,
                min: this.windows.perfect.min,
                max: this.windows.perfect.max,
                flick: this.sharedMemory.get(this.info.index).flick,
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
