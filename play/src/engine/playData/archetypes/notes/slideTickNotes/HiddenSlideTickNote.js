import { SlideTickNote } from './SlideTickNote.js';
import { getAttached } from './utils.js';
import { archetypes } from '../../index.js';
import { options } from '../../../../configuration/options.js';
export class HiddenSlideTickNote extends SlideTickNote {
    attachedSlideTickImport = this.defineImport({
        attachRef: { name: 'attach', type: Number },
    });
    preprocessOrder = 1;
    preprocess() {
        super.preprocess();
        ({ lane: this.import.lane, size: this.import.size } = getAttached(this.attachedSlideTickImport.attachRef, this.targetTime));
    }
    terminate() {
        if (options.customJudgment) {
            archetypes.Judg.spawn({ j: this.result.judgment, t: time.now });
        }
        if (options.customCombo) {
            archetypes.ComboN.spawn({ j: this.result.judgment, t: time.now });
        }
    }
}
