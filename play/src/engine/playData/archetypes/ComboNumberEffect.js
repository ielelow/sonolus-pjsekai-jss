import { skin, getZ, layer } from '../skin.js';
import { NormalLayout } from '../../../../../shared/src/engine/data/utils.js';
import { archetypes } from './index.js';
import { options } from '../../configuration/options.js';
export class ComboNumberEffect extends SpawnableArchetype({
    j: Number,
    t: Number,
})
{
    endTime = this.entityMemory(Number);
    layout = this.entityMemory(Quad);
    z = this.entityMemory(Number);
    comboc = this.entityMemory(Number);
    check = this.entityMemory(Boolean);
    combo = levelMemory(Number);
    AP = levelMemory(Boolean);
    comboExport = this.defineExport({
        combo: { name: 'combo', type: Number },
        ap: { name: 'ap', type: Boolean }
    });
    sharedMemory = this.defineSharedMemory({
        lastActiveTime: Number,
        ap: Boolean
    });
    initialize() {
        this.endTime = 999999;
        this.z = getZ(layer.judgment, -this.spawnData.t, 0);
    }
    updateParallel() {
        if (this.comboc != this.combo) {
            this.despawn = true;
            return;
        }
        const c = this.combo;
        const digits = [
            Math.floor(c / 1000) % 10,
            Math.floor(c / 100) % 10,
            Math.floor(c / 10) % 10,
            c % 10,
        ];
        let digitCount = 4;
        if (digits[0] === 0) digitCount = 3;
        if (digits[0] === 0 && digits[1] === 0) digitCount = 2;
        if (digits[0] === 0 && digits[1] === 0 && digits[2] === 0) digitCount = 1;
        const h = 0.19 * ui.configuration.combo.scale
        const centerX = 5.45
        const centerY = 0.585
        // 애니메이션 = s * (원래좌표) + (1 - s) * centerX, s * (원래좌표) + (1 - s) * centerY
        const s = 0.7 + 0.3 * Math.ease('Out', 'Cubic', Math.min(1, Math.unlerp(this.spawnData.t + 0.1, this.spawnData.t + 0.15, time.now)))
        const a = time.now >= this.spawnData.t + 0.1 ? 0.45 * ui.configuration.combo.alpha * Math.ease('Out', 'Cubic', Math.unlerp(this.spawnData.t + 0.15, this.spawnData.t + 0.1, time.now)) : 0
        const digitWidth = h * 0.773 * 6.65
        const digitGap = digitWidth * (options.comboDistance - 0.17);
        const totalWidth = digitCount * digitWidth + (digitCount - 1) * digitGap;
        const startX = centerX - totalWidth / 2;
        if (digitCount === 1) {
            const digitLayout = NormalLayout({
                l: s * (centerX - digitWidth / 2) + (1 - s) * centerX,
                r: s * (centerX + digitWidth / 2) + (1 - s) * centerX,
                t: s * (centerY - h / 2) + (1 - s) * centerY,
                b: s * (centerY + h / 2) + (1 - s) * centerY,
            });
            this.drawDigit(digits[3], digitLayout, this.z, a, skin);
        } else if (digitCount === 2) {
            // 첫 번째 자리
            const digitLayout0 = NormalLayout({
                l: s * (startX) + (1 - s) * centerX,
                r: s * (startX + digitWidth) + (1 - s) * centerX,
                t: s * (centerY - h / 2) + (1 - s) * centerY,
                b: s * (centerY + h / 2) + (1 - s) * centerY,
            });
            this.drawDigit(digits[2], digitLayout0, this.z, a, skin);

            // 두 번째 자리
            const digitLayout1 = NormalLayout({
                l: s * (startX + digitWidth + digitGap) + (1 - s) * centerX,
                r: s * (startX + 2 * digitWidth + digitGap) + (1 - s) * centerX,
                t: s * (centerY - h / 2) + (1 - s) * centerY,
                b: s * (centerY + h / 2) + (1 - s) * centerY,
            });
            this.drawDigit(digits[3], digitLayout1, this.z, a, skin);
        } else if (digitCount === 3) {
            // 첫 번째 자리
            const digitLayout0 = NormalLayout({
                l: s * (startX) + (1 - s) * centerX,
                r: s * (startX + digitWidth) + (1 - s) * centerX,
                t: s * (centerY - h / 2) + (1 - s) * centerY,
                b: s * (centerY + h / 2) + (1 - s) * centerY,
            });
            this.drawDigit(digits[1], digitLayout0, this.z, a, skin);

            // 두 번째 자리
            const digitLayout1 = NormalLayout({
                l: s * (startX + digitWidth + digitGap) + (1 - s) * centerX,
                r: s * (startX + 2 * digitWidth + digitGap) + (1 - s) * centerX,
                t: s * (centerY - h / 2) + (1 - s) * centerY,
                b: s * (centerY + h / 2) + (1 - s) * centerY,
            });
            this.drawDigit(digits[2], digitLayout1, this.z, a, skin);

            // 세 번째 자리
            const digitLayout2 = NormalLayout({
                l: s * (startX + 2 * (digitWidth + digitGap)) + (1 - s) * centerX,
                r: s * (startX + 3 * digitWidth + 2 * digitGap) + (1 - s) * centerX,
                t: s * (centerY - h / 2) + (1 - s) * centerY,
                b: s * (centerY + h / 2) + (1 - s) * centerY,
            });
            this.drawDigit(digits[3], digitLayout2, this.z, a, skin);

        } else if (digitCount === 4) {
            // 첫 번째 자리
            const digitLayout0 = NormalLayout({
                l: s * (startX) + (1 - s) * centerX,
                r: s * (startX + digitWidth) + (1 - s) * centerX,
                t: s * (centerY - h / 2) + (1 - s) * centerY,
                b: s * (centerY + h / 2) + (1 - s) * centerY,
            });
            this.drawDigit(digits[0], digitLayout0, this.z, a, skin);

            // 두 번째 자리
            const digitLayout1 = NormalLayout({
                l: s * (startX + digitWidth + digitGap) + (1 - s) * centerX,
                r: s * (startX + 2 * digitWidth + digitGap) + (1 - s) * centerX,
                t: s * (centerY - h / 2) + (1 - s) * centerY,
                b: s * (centerY + h / 2) + (1 - s) * centerY,
            });
            this.drawDigit(digits[1], digitLayout1, this.z, a, skin);

            // 세 번째 자리
            const digitLayout2 = NormalLayout({
                l: s * (startX + 2 * (digitWidth + digitGap)) + (1 - s) * centerX,
                r: s * (startX + 3 * digitWidth + 2 * digitGap) + (1 - s) * centerX,
                t: s * (centerY - h / 2) + (1 - s) * centerY,
                b: s * (centerY + h / 2) + (1 - s) * centerY,
            });
            this.drawDigit(digits[2], digitLayout2, this.z, a, skin);

            // 네 번째 자리
            const digitLayout3 = NormalLayout({
                l: s * (startX + 3 * (digitWidth + digitGap)) + (1 - s) * centerX,
                r: s * (startX + 4 * digitWidth + 3 * digitGap) + (1 - s) * centerX,
                t: s * (centerY - h / 2) + (1 - s) * centerY,
                b: s * (centerY + h / 2) + (1 - s) * centerY,
            });
            this.drawDigit(digits[3], digitLayout3, this.z, a, skin);
        }
    }
    updateSequential() {
        if (this.spawnData.j != Judgment.Good && this.spawnData.j != Judgment.Miss) {
            if (!this.check) {
                this.combo += 1
                this.comboc = this.combo
            }
        }
        else {
            this.combo = 0
            this.comboc = -999
        }
        if (this.spawnData.j != Judgment.Perfect) {
            this.AP = true
        }
        this.check = true
    }
    drawDigit(digit, layout, z, a, skin) {
        if (this.AP || !options.ap) {
            switch (digit) {
                case 0: skin.sprites.c0.draw(layout, z, a); break;
                case 1: skin.sprites.c1.draw(layout, z, a); break;
                case 2: skin.sprites.c2.draw(layout, z, a); break;
                case 3: skin.sprites.c3.draw(layout, z, a); break;
                case 4: skin.sprites.c4.draw(layout, z, a); break;
                case 5: skin.sprites.c5.draw(layout, z, a); break;
                case 6: skin.sprites.c6.draw(layout, z, a); break;
                case 7: skin.sprites.c7.draw(layout, z, a); break;
                case 8: skin.sprites.c8.draw(layout, z, a); break;
                case 9: skin.sprites.c9.draw(layout, z, a); break;
            }
        }
        else {
            switch (digit) {
                case 0: skin.sprites.ap0.draw(layout, z, a); break;
                case 1: skin.sprites.ap1.draw(layout, z, a); break;
                case 2: skin.sprites.ap2.draw(layout, z, a); break;
                case 3: skin.sprites.ap3.draw(layout, z, a); break;
                case 4: skin.sprites.ap4.draw(layout, z, a); break;
                case 5: skin.sprites.ap5.draw(layout, z, a); break;
                case 6: skin.sprites.ap6.draw(layout, z, a); break;
                case 7: skin.sprites.ap7.draw(layout, z, a); break;
                case 8: skin.sprites.ap8.draw(layout, z, a); break;
                case 9: skin.sprites.ap9.draw(layout, z, a); break;
            }
        }
    }
}