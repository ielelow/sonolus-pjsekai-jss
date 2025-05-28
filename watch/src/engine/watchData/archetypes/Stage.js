import { lane } from '../../../../../shared/src/engine/data/lane.js';
import { perspectiveLayout } from '../../../../../shared/src/engine/data/utils.js';
import { options } from '../../configuration/options.js';
import { note } from '../note.js';
import { scaledScreen } from '../scaledScreen.js';
import { layer, skin } from '../skin.js';
import { archetypes } from './index.js';
import { EngineArchetypeDataName } from '@sonolus/core';
export class Stage extends Archetype {
    preprocessOrder = 3;
    entityArray = this.defineSharedMemory({
        value: Number,
        time: Number,
        length: Number,
        start: Number,
        combo: Number,
        Judgment: DataType,
        tail: Number,
        ap: Boolean
    })
    ap = this.entityMemory(Boolean)
    cache = this.entityMemory({
        n0: Number,
        n1: Number,
        n2: Number,
        n3: Number,
        n4: Number,
        n5: Number,
        n6: Number,
        n7: Number,
        n8: Number,
        n9: Number,
        n10: Number,
        n11: Number,
        n12: Number,
        n13: Number,
        n14: Number,
        n15: Number,
        n16: Number,
        n17: Number,
        n18: Number,
        n19: Number,
        n20: Number,
        n21: Number,
        n22: Number,
        n23: Number,
        n24: Number,
        n25: Number,
        n26: Number,
        n27: Number,
        n28: Number,
        n29: Number,
        n30: Number,
        n31: Number
    })
    spawnTime() {
        return -999999;
    }
    despawnTime() {
        return 999999;
    }
    updateParallel() {
        if (this.useFallbackStage) {
            this.drawFallbackStage();
        }
        else {
            this.drawSekaiStage();
        }
        this.drawStageCover();
    }
    get useFallbackStage() {
        return !skin.sprites.sekaiStage.exists;
    }
    drawSekaiStage() {
        const w = ((2048 / 1420) * 12) / 2;
        const h = 1176 / 850;
        const layout = new Rect({ l: -w, r: w, t: lane.t, b: lane.t + h });
        skin.sprites.sekaiStage.draw(layout, layer.stage, 1);
    }
    drawFallbackStage() {
        skin.sprites.stageLeftBorder.draw(perspectiveLayout({ l: -6.5, r: -6, b: lane.b, t: lane.t }), layer.stage, 1);
        skin.sprites.stageRightBorder.draw(perspectiveLayout({ l: 6, r: 6.5, b: lane.b, t: lane.t }), layer.stage, 1);
        for (let i = 0; i < 6; i++) {
            skin.sprites.lane.draw(perspectiveLayout({ l: i * 2 - 6, r: i * 2 - 4, b: lane.b, t: lane.t }), layer.stage, 1);
        }
        skin.sprites.judgmentLine.draw(perspectiveLayout({ l: -6, r: 6, b: 1 + note.h, t: 1 - note.h }), layer.judgmentLine, 1);
    }
    drawStageCover() {
        if (options.stageCover <= 0)
            return;
        skin.sprites.cover.draw(new Rect({
            l: scaledScreen.l,
            r: scaledScreen.r,
            t: scaledScreen.t,
            b: Math.lerp(lane.t, 1, options.stageCover),
        }), layer.cover, 1);
    }
    preprocess() {
        let entityCount = 0
        while (entityInfos.get(entityCount).index == entityCount) {
            entityCount += 1
        }
        let next = 0, lineLength = 0
        for (let i = 0; i < entityCount; i++) {
            let ii = entityCount - 1 - i
            let archetypeIndex = entityInfos.get(ii).archetype
            if (archetypeIndex == archetypes.NormalTapNote.index
                || archetypeIndex == archetypes.CriticalTapNote.index
                || archetypeIndex == archetypes.NormalFlickNote.index
                || archetypeIndex == archetypes.CriticalFlickNote.index
                || archetypeIndex == archetypes.NormalTraceNote.index
                || archetypeIndex == archetypes.CriticalTraceNote.index
                || archetypeIndex == archetypes.NormalTraceFlickNote.index
                || archetypeIndex == archetypes.CriticalTraceFlickNote.index
                || archetypeIndex == archetypes.NormalSlideTraceNote.index
                || archetypeIndex == archetypes.CriticalSlideTraceNote.index
                || archetypeIndex == archetypes.NormalSlideStartNote.index
                || archetypeIndex == archetypes.CriticalSlideStartNote.index
                || archetypeIndex == archetypes.NormalSlideEndNote.index
                || archetypeIndex == archetypes.CriticalSlideEndNote.index
                || archetypeIndex == archetypes.NormalSlideEndTraceNote.index
                || archetypeIndex == archetypes.CriticalSlideEndTraceNote.index
                || archetypeIndex == archetypes.CriticalSlideEndFlickNote.index
                || archetypeIndex == archetypes.NormalSlideEndFlickNote.index
                || archetypeIndex == archetypes.NormalSlideTickNote.index
                || archetypeIndex == archetypes.CriticalSlideTickNote.index
                || archetypeIndex == archetypes.HiddenSlideTickNote.index
                || archetypeIndex == archetypes.NormalAttachedSlideTickNote.index
                || archetypeIndex == archetypes.CriticalAttachedSlideTickNote.index
            ) {
                lineLength += 1
                this.entityArray.get(ii).value = next
                next = ii
            }
        }
        let currentEntity = next;
        for (let i = 0; i < lineLength; i++) {
            let currentHead = currentEntity;
            currentEntity = this.entityArray.get(currentEntity).value;
            for (let j = 0; j < 32; j++) {
                if (this.getCacheValue(j) == 0) {
                    this.setCacheValue(j, currentHead);
                    break;
                }
                let A = this.getCacheValue(j);
                let B = currentHead;
                this.setCacheValue(j, 0);
                currentHead = this.merge(A, B, Math.pow(2, j), Math.pow(2, j));
            }
        }
        let head = -1;
        let currentLen = 0;
        for (let i = 0; i < 32; i++) {
            if (this.getCacheValue(i) == 0) continue;
            if (head == -1) {
                head = this.getCacheValue(i);
                currentLen = Math.pow(2, i)
                continue;
            }
            let A = head;
            let B = this.getCacheValue(i);
            let Asize = currentLen;
            let Bsize = Math.pow(2, i)
            this.setCacheValue(i, 0);
            head = this.merge(A, B, Asize, Bsize);
            currentLen = Asize + Bsize;
        }
        this.entityArray.get(0).start = head
        this.entityArray.get(0).length = lineLength
        let idx = 0;
        let ptr = head;
        let combo = 0
        while (idx < lineLength && ptr != this.entityArray.get(this.entityArray.get(0).tail).value) {
            if (replay.isReplay && (this.entityArray.get(ptr).Judgment != Judgment.Perfect || this.ap == true)) {
                this.entityArray.get(ptr).ap = true
                this.ap = true
            }
            if (replay.isReplay && (this.entityArray.get(ptr).Judgment == Judgment.Good || this.entityArray.get(ptr).Judgment == Judgment.Miss))
                combo = 0
            else
                combo += 1
            this.entityArray.get(ptr).combo = combo;
            ptr = this.entityArray.get(ptr).value;
            idx++;
        }
    }
    merge(a, b, Asize, Bsize) {
        let Alen = 0;
        let Blen = 0;
        let A = a;
        let B = b;
        let newHead = this.entityArray.get(A).time > this.entityArray.get(B).time ? B : A;
        let pointer = newHead;
        if (this.entityArray.get(A).time > this.entityArray.get(B).time) {
            Blen += 1
            B = this.entityArray.get(B).value;
        } else {
            Alen += 1
            A = this.entityArray.get(A).value;
        }
        while (Alen < Asize && Blen < Bsize) {
            if (this.entityArray.get(A).time > this.entityArray.get(B).time) {
                this.entityArray.get(pointer).value = B;
                pointer = B;
                B = this.entityArray.get(B).value;
                Blen += 1
            } else {
                this.entityArray.get(pointer).value = A;
                pointer = A;
                A = this.entityArray.get(A).value;
                Alen += 1
            }
        }
        if (Alen < Asize) {
            this.entityArray.get(pointer).value = A;
            // 마지막 노드 찾기
            while (Alen < Asize) {
                pointer = A;
                A = this.entityArray.get(A).value;
                Alen += 1;
            }
        }
        if (Blen < Bsize) {
            this.entityArray.get(pointer).value = B;
            // 마지막 노드 찾기
            while (Blen < Bsize) {
                pointer = B;
                B = this.entityArray.get(B).value;
                Blen += 1;
            }
        }
        this.entityArray.get(pointer).value = -1;
        this.entityArray.get(0).tail = pointer
        return newHead
    }
    getCacheValue(index) {
        switch (index) {
            case 0: return this.cache.n0; case 1: return this.cache.n1; case 2: return this.cache.n2; case 3: return this.cache.n3;
            case 4: return this.cache.n4; case 5: return this.cache.n5; case 6: return this.cache.n6; case 7: return this.cache.n7;
            case 8: return this.cache.n8; case 9: return this.cache.n9; case 10: return this.cache.n10; case 11: return this.cache.n11;
            case 12: return this.cache.n12; case 13: return this.cache.n13; case 14: return this.cache.n14; case 15: return this.cache.n15;
            case 16: return this.cache.n16; case 17: return this.cache.n17; case 18: return this.cache.n18; case 19: return this.cache.n19;
            case 20: return this.cache.n20; case 21: return this.cache.n21; case 22: return this.cache.n22; case 23: return this.cache.n23;
            case 24: return this.cache.n24; case 25: return this.cache.n25; case 26: return this.cache.n26; case 27: return this.cache.n27;
            case 28: return this.cache.n28; case 29: return this.cache.n29; case 30: return this.cache.n30; case 31: return this.cache.n31;
        }
    }

    setCacheValue(index, value) {
        switch (index) {
            case 0: this.cache.n0 = value; break; case 1: this.cache.n1 = value; break; case 2: this.cache.n2 = value; break; case 3: this.cache.n3 = value; break;
            case 4: this.cache.n4 = value; break; case 5: this.cache.n5 = value; break; case 6: this.cache.n6 = value; break; case 7: this.cache.n7 = value; break;
            case 8: this.cache.n8 = value; break; case 9: this.cache.n9 = value; break; case 10: this.cache.n10 = value; break; case 11: this.cache.n11 = value; break;
            case 12: this.cache.n12 = value; break; case 13: this.cache.n13 = value; break; case 14: this.cache.n14 = value; break; case 15: this.cache.n15 = value; break;
            case 16: this.cache.n16 = value; break; case 17: this.cache.n17 = value; break; case 18: this.cache.n18 = value; break; case 19: this.cache.n19 = value; break;
            case 20: this.cache.n20 = value; break; case 21: this.cache.n21 = value; break; case 22: this.cache.n22 = value; break; case 23: this.cache.n23 = value; break;
            case 24: this.cache.n24 = value; break; case 25: this.cache.n25 = value; break; case 26: this.cache.n26 = value; break; case 27: this.cache.n27 = value; break;
            case 28: this.cache.n28 = value; break; case 29: this.cache.n29 = value; break; case 30: this.cache.n30 = value; break; case 31: this.cache.n31 = value; break;
        }
    }
}
