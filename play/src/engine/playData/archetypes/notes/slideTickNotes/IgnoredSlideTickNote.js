import { Note } from '../Note.js';
import { archetypes } from '../../index.js';
import { options } from '../../../../configuration/options.js';
export class IgnoredSlideTickNote extends Note {
    hasInput = false;
    leniency = 0;
    spawnOrder() {
        return 999999;
    }
    shouldSpawn() {
        return false;
    }
    terminate() {
        if (options.customJudgment) {
            archetypes.Judg.spawn({ j: this.result.judgment, t: time.now });
        }
        if (options.customCombo) {
            archetypes.ComboN.spawn({ j: this.result.judgment, t: time.now });
            archetypes.ComboE.spawn({ j: this.result.judgment, t: time.now });
            archetypes.ComboG.spawn({ j: this.result.judgment, t: time.now });
        }
    }
}
