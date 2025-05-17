import { getAttached } from '../../utils.js';
import { VisibleSlideTickNote } from '../VisibleSlideTickNote.js';
import { archetypes } from '../../../../index.js';
export class AttachedSlideTickNote extends VisibleSlideTickNote {
    attachedSlideTickImport = this.defineImport({
        attachRef: { name: 'attach', type: Number },
    });
    preprocessOrder = 1;
    preprocess() {
        super.preprocess();
        ({ lane: this.import.lane, size: this.import.size } = getAttached(this.attachedSlideTickImport.attachRef, this.targetTime));
    }
    terminate() {
        archetypes.Judg.spawn({ j: this.result.judgment, t: time.now });
    }
}
