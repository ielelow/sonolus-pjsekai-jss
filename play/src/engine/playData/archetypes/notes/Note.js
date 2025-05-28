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
    comboExport = this.defineExport({
        ap: { name: 'ap', type: Boolean },
    });
    sharedMemory = this.defineSharedMemory({
        lastActiveTime: Number,
        ap: Boolean
    });
    targetTime = this.entityMemory(Number);
    spawnTime = this.entityMemory(Number);
    hitbox = this.entityMemory(Rect);
    fullHitbox = this.entityMemory(Rect);
    flick = this.entityMemory(Boolean);
    preprocess() {
        this.sharedMemory.lastActiveTime = -1000;
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
            archetypes.Judg.spawn({ j: this.result.judgment, t: time.now });
            if (options.fastLate) {
                archetypes.FastLate.spawn({
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
            if (this.result.judgment != Judgment.Perfect || this.sharedMemory.get(0).ap == true) {
                this.comboExport('ap', true);
            }
            archetypes.ComboN.spawn({ j: this.result.judgment, t: time.now });
        }
    }
}
