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
        if (options.customJudgment || options.customJudgment)
            archetypes.ComboManager.spawn({
                judgment: this.result.judgment,
                flick: this.sharedMemory.get(this.info.index).flick,
                accuracy: this.result.accuracy,
                fast: this.windows.perfect.min,
                late: this.windows.perfect.max,
            })
    }
}
