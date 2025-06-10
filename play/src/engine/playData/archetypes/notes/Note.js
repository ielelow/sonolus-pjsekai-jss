import { EngineArchetypeDataName } from '@sonolus/core';
import { options } from '../../../configuration/options.js';
import { archetypes } from '../index.js';
export class Note extends Archetype {
    hasInput = true;
    import = this.defineImport({
        beat: { name: EngineArchetypeDataName.Beat, type: Number },
        lane: { name: 'lane', type: Number },
        size: { name: 'size', type: Number },
    });
    sharedMemory = this.defineSharedMemory({
        lastActiveTime: Number,
        exportStartTime: Number,
        circular: ParticleEffectInstanceId,
        linear: ParticleEffectInstanceId,
    });
    targetTime = this.entityMemory(Number);
    spawnTime = this.entityMemory(Number);
    hitbox = this.entityMemory(Rect);
    fullHitbox = this.entityMemory(Rect);
    flick = this.entityMemory(Boolean);
    preprocess() {
        this.sharedMemory.lastActiveTime = -1000;
        this.sharedMemory.exportStartTime = -1000;
        this.targetTime = bpmChanges.at(this.import.beat).time;
        if (options.mirror) { this.import.lane *= -1; }
    }
    spawnOrder() {
        return 1000 + this.spawnTime;
    }
    shouldSpawn() {
        return time.scaled >= this.spawnTime;
    }
    updateSequentialOrder = 2;
    terminate() {
        if (options.customJudgment) {
            archetypes.JudgmentText.spawn({ j: this.result.judgment, t: time.now });
            if (options.fastLate) {
                archetypes.JudgmentAccuracy.spawn({
                    j: this.result.judgment,
                    t: time.now,
                    accuracy: this.result.accuracy,
                    late: this.windows.perfect.max,
                    fast: this.windows.perfect.min,
                    flick: this.flick
                });
            }
        }
        if (options.customCombo) {
            archetypes.ComboNumber.spawn({ j: this.result.judgment, t: time.now });
            archetypes.ComboNumberEffect.spawn({ j: this.result.judgment, t: time.now });
            archetypes.ComboNumberGlow.spawn({ j: this.result.judgment, t: time.now });
        }
    }
}
