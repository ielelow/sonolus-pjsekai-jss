import { Note } from '../Note.js';
export class SlideTickNote extends Note {
    globalPreprocess() {
        if (this.hasInput)
            this.life.miss = -40;
    }
}
