import { SlideTickNote } from './SlideTickNote.js'
import { options } from '../../../../configuration/options.js'
export class IgnoredSlideTickNote extends SlideTickNote {
    hasInput = false
    preprocess() {
        if (options.mirror) this.import.lane *= -1
        this.targetTime = bpmChanges.at(this.import.beat).time
    }
}
