import { Note } from '../Note.js'
export class SlideTickNote extends Note {
    preprocessOrder = 0.1
    globalPreprocess() {
        if (this.hasInput) this.life.miss = -40
    }
}
