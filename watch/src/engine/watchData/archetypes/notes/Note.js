import { EngineArchetypeDataName } from '@sonolus/core';
import { options } from '../../../configuration/options.js';
import { archetypes } from '../index.js';
export class Note extends Archetype {
    hasInput = true;
    import = this.defineImport({
        beat: { name: EngineArchetypeDataName.Beat, type: Number },
        lane: { name: 'lane', type: Number },
        size: { name: 'size', type: Number },
        judgment: { name: EngineArchetypeDataName.Judgment, type: (DataType) },
        accuracy: { name: EngineArchetypeDataName.Accuracy, type: Number },
        flick: { name: 'flick', type: Boolean },
        jud: { name: 'jud', type: Number },
    });
    targetTime = this.entityMemory(Number);
    preprocess() {
        if (options.mirror)
            this.import.lane *= -1;
        this.targetTime = bpmChanges.at(this.import.beat).time;
        if (this.hasInput)
            this.result.time = this.targetTime;
        if (options.customJudgment) {
            archetypes.Judg.spawn({ t: this.targetTime, j: this.import.judgment });
        }
        if (options.fastLate && replay.isReplay && options.customJudgment) {
            archetypes.FastLate.spawn({
                t: this.targetTime,
                j: this.import.judgment,
                accuracy: this.import.accuracy,
                fastLate: this.import.jud,
                flick: this.import.flick,
            });
        }
    }
}
