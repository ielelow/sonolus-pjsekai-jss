import { Note } from '../Note.js';
import { options } from '../../../../configuration/options.js';
import { archetypes } from '../../index.js';
export class SlideTickNote extends Note {
    globalPreprocess() {
        if (this.hasInput)
            this.life.miss = -40;
    }
    preprocess() {
        if (options.mirror)
            this.import.lane *= -1;
        this.targetTime = bpmChanges.at(this.import.beat).time;
        if (this.hasInput)
            this.result.time = this.targetTime;
        if (options.customJudgment) {
            archetypes.Judg.spawn({ t: this.targetTime, j: this.import.judgment });
        }
    }
}
