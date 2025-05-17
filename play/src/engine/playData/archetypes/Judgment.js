import { skin, getZ, layer } from '../skin.js';
import { NormalLayout } from '../../../../../shared/src/engine/data/utils.js';
import { options } from '../../configuration/options.js';

export class Judg extends SpawnableArchetype({
    j: Number,
    t: Number,
})
{
    endTime = this.entityMemory(Number);
    layout = this.entityMemory(Quad);
    z = this.entityMemory(Number);
    initialize() {
        debug.log(this.spawnData.j)
        this.endTime = this.spawnData.t + 1;
        NormalLayout({
            l: -0.3,
            r: 0.3,
            t: 0.85,
            b: 0.75,
        }).copyTo(this.layout);
        this.z = getZ(layer.judgment, -this.spawnData.t, 0);
    }
    updateParallel() {
        if (time.now >= this.endTime) {
            this.despawn = true;
            return;
        }
        if (options.customJudgment) {
            const a = Math.unlerp(this.endTime, this.spawnData.t, time.now);
            switch (this.spawnData.j) {
                case Judgment.Perfect:
                    skin.sprites.perfect.draw(this.layout, this.z, a);
                    break;
                case Judgment.Great:
                    skin.sprites.great.draw(this.layout, this.z, a);
                    break;
                case Judgment.Good:
                    skin.sprites.good.draw(this.layout, this.z, a);
                    break;
                case Judgment.Miss:
                    skin.sprites.miss.draw(this.layout, this.z, a);
                    break;
            }
        }
        /*if (options.customCombo) {
        }*/
    }
}