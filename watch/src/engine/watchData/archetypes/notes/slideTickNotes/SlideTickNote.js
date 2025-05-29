import { Note } from '../Note.js';
import { options } from '../../../../configuration/options.js';
import { archetypes } from '../../index.js';
export class SlideTickNote extends Note {
    preprocessOrder = 0.1;
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
        if (options.customCombo) {
            if (!options.autoCombo || replay.isReplay) {
                this.entityArray.get(this.info.index).time = timeScaleChanges.at(this.targetTime).scaledTime
                this.entityArray.get(this.info.index).Judgment = this.import.judgment
                archetypes.ComboN.spawn({ t: this.targetTime, i: this.info.index })
                archetypes.ComboG.spawn({ t: this.targetTime, i: this.info.index })
                archetypes.ComboE.spawn({ t: this.targetTime, i: this.info.index })
                archetypes.ComboT.spawn({ t: this.targetTime, i: this.info.index })
            }
        }
    }
}
