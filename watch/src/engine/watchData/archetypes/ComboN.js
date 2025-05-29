import { skin, getZ, layer } from '../skin.js';
import { NormalLayout } from '../../../../../shared/src/engine/data/utils.js';
import { options } from '../../configuration/options.js';

export class ComboN extends SpawnableArchetype({
    t: Number,
    i: Number
}) {
    endTime = this.entityMemory(Number);
    layout = this.entityMemory(Quad);
    z = this.entityMemory(Number);
    check = this.entityMemory(Boolean);

    preprocessOrder = 5;

    entityArray = this.defineSharedMemory({
        value: Number,
        time: Number,
        length: Number,
        start: Number,
        combo: Number,
        Judgment: DataType,
        tail: Number,
        ap: Boolean
    });

    initialize() {
        this.z = getZ(layer.judgment, -this.spawnData.t, 0);
    }

    spawnTime() {
        return timeScaleChanges.at(this.spawnData.t).scaledTime;
    }

    despawnTime() {
        if (this.entityArray.get(this.spawnData.i).value != this.entityArray.get(this.entityArray.get(0).tail).value)
            return this.entityArray.get(this.entityArray.get(this.spawnData.i).value).time;
        else
            return 999999;
    }

    updateParallel() {
        const c = this.entityArray.get(this.spawnData.i).combo;
        if (c > 0) {
            const digits = String(c).split('').map(Number);
            const digitCount = digits.length;

            const h = 0.1624 * ui.configuration.combo.scale;
            const centerX = 5.36;
            const centerY = 0.59;

            const s = 0.6 + 0.4 * Math.ease('Out', 'Cubic', Math.min(1, Math.unlerp(this.spawnData.t, this.spawnData.t + 0.15, time.now)));
            const a = ui.configuration.combo.alpha * Math.ease('Out', 'Cubic', Math.min(1, Math.unlerp(this.spawnData.t, this.spawnData.t + 0.15, time.now)));

            const digitWidth = h * 0.71889 * 7.5145;
            const digitGap = digitWidth * -0.04;
            const totalWidth = digitCount * digitWidth + (digitCount - 1) * digitGap;
            const startX = centerX - totalWidth / 2;

            for (let i = 0; i < digitCount; i++) {
                const digit = digits[i];

                const layout = NormalLayout({
                    l: s * (startX + i * (digitWidth + digitGap)) + (1 - s) * centerX,
                    r: s * (startX + i * (digitWidth + digitGap) + digitWidth) + (1 - s) * centerX,
                    t: s * (centerY - h / 2) + (1 - s) * centerY,
                    b: s * (centerY + h / 2) + (1 - s) * centerY,
                });

                this.drawDigit(digit, layout, this.z, a, skin);
            }
        }
    }

    drawDigit(digit, layout, z, a, skin) {
        const isAP = this.entityArray.get(this.spawnData.i).ap === true;
        const useAP = options.ap && !isAP;

        const sprites = useAP ? skin.sprites : skin.sprites;

        switch (digit) {
            case 0: (useAP ? sprites.ap0 : sprites.c0).draw(layout, z, a); break;
            case 1: (useAP ? sprites.ap1 : sprites.c1).draw(layout, z, a); break;
            case 2: (useAP ? sprites.ap2 : sprites.c2).draw(layout, z, a); break;
            case 3: (useAP ? sprites.ap3 : sprites.c3).draw(layout, z, a); break;
            case 4: (useAP ? sprites.ap4 : sprites.c4).draw(layout, z, a); break;
            case 5: (useAP ? sprites.ap5 : sprites.c5).draw(layout, z, a); break;
            case 6: (useAP ? sprites.ap6 : sprites.c6).draw(layout, z, a); break;
            case 7: (useAP ? sprites.ap7 : sprites.c7).draw(layout, z, a); break;
            case 8: (useAP ? sprites.ap8 : sprites.c8).draw(layout, z, a); break;
            case 9: (useAP ? sprites.ap9 : sprites.c9).draw(layout, z, a); break;
        }
    }
}
