import { FlatNote } from "../FlatNote.js";
export class SlideStartNote extends FlatNote {
  render() {
    if (time.scaled > this.visualTime.max) return;
    super.render();
  }
}
