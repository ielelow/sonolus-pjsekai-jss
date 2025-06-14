import { getAttached } from '../../utils.js'
import { VisibleSlideTickNote } from '../VisibleSlideTickNote.js'
export class AttachedSlideTickNote extends VisibleSlideTickNote {
    attachedSlideTickImport = this.defineImport({
        attachRef: { name: 'attach', type: Number },
    })
    preprocessOrder = 1
    preprocess() {
        ;({ lane: this.import.lane, size: this.import.size } = getAttached(
            this.attachedSlideTickImport.attachRef,
            bpmChanges.at(this.import.beat).time,
        ))
    }
}
