import { lane } from '../../../../../shared/src/engine/data/lane.js'
import { perspectiveLayout } from '../../../../../shared/src/engine/data/utils.js'
import { options } from '../../configuration/options.js'
import { effect, sfxDistance } from '../effect.js'
import { note } from '../note.js'
import { particle } from '../particle.js'
import { scaledScreen } from '../scaledScreen.js'
import { layer, skin } from '../skin.js'
import { archetypes } from './index.js'
export class Stage extends Archetype {
    preprocessOrder = 3
    entityArray = this.defineSharedMemory({
        value: Number,
        scaledTime: Number,
        length: Number,
        start: Number,
        combo: Number,
        Judgment: DataType,
        tail: Number,
        ap: Boolean,
        time: Number,
    })
    ap = this.entityMemory(Boolean)
    cache = this.entityMemory(Tuple(32, Number))
    spawnTime() {
        return -999999
    }
    despawnTime() {
        return 999999
    }
    updateParallel() {
        if (this.useFallbackStage) {
            this.drawFallbackStage()
        } else {
            this.drawSekaiStage()
        }
        this.drawStageCover()
        this.playEffects()
    }
    get useFallbackStage() {
        return !skin.sprites.sekaiStage.exists
    }
    playEffects() {
        if (!replay.isReplay) return
        for (let l = -6; l < 6; l++) {
            let key = streams.getNextKey(l, time.now - time.delta)
            if (key === time.now - time.delta) continue
            if (key < time.now) if (options.laneEffectEnabled) this.playEmptyLaneEffects(l)
        }
    }
    playEmptyLaneEffects(l) {
        particle.effects.lane.spawn(
            perspectiveLayout({ l, r: l + 1, b: lane.b, t: lane.t }),
            0.3,
            false,
        )
    }
    drawSekaiStage() {
        const w = ((2048 / 1420) * 12) / 2
        const h = 1176 / 850
        const layout = new Rect({ l: -w, r: w, t: lane.t, b: lane.t + h })
        skin.sprites.sekaiStage.draw(layout, layer.stage, !options.stage ? 0 : 1)
    }
    drawFallbackStage() {
        skin.sprites.stageLeftBorder.draw(
            perspectiveLayout({ l: -6.5, r: -6, b: lane.b, t: lane.t }),
            layer.stage,
            !options.stage ? 0 : 1,
        )
        skin.sprites.stageRightBorder.draw(
            perspectiveLayout({ l: 6, r: 6.5, b: lane.b, t: lane.t }),
            layer.stage,
            !options.stage ? 0 : 1,
        )
        for (let i = 0; i < 6; i++) {
            skin.sprites.lane.draw(
                perspectiveLayout({ l: i * 2 - 6, r: i * 2 - 4, b: lane.b, t: lane.t }),
                layer.stage,
                !options.stage ? 0 : 1,
            )
        }
        skin.sprites.judgmentLine.draw(
            perspectiveLayout({ l: -6, r: 6, b: 1 + note.h, t: 1 - note.h }),
            layer.judgmentLine,
            !options.stage ? 0 : 1,
        )
    }
    drawStageCover() {
        if (options.stageCover <= 0) return
        skin.sprites.cover.draw(
            new Rect({
                l: scaledScreen.l,
                r: scaledScreen.r,
                t: scaledScreen.t,
                b: Math.lerp(lane.t, 1, options.stageCover),
            }),
            layer.cover,
            !options.stage ? 0 : 1,
        )
    }
    preprocess() {
        if (options.sfxEnabled && replay.isReplay) {
            for (let l = -6; l < 6; l++) {
                let key = -999999
                while (true) {
                    const newKey = streams.getNextKey(l, key)
                    if (key == newKey) break
                    effect.clips.stage.schedule(newKey, sfxDistance)
                    key = newKey
                }
            }
        }
        let entityCount = 0
        while (entityInfos.get(entityCount).index == entityCount) {
            entityCount += 1
        }
        let next = 0,
            lineLength = 0
        for (let i = 0; i < entityCount; i++) {
            let ii = entityCount - 1 - i
            let archetypeIndex = entityInfos.get(ii).archetype
            if (
                archetypeIndex == archetypes.NormalTapNote.index ||
                archetypeIndex == archetypes.CriticalTapNote.index ||
                archetypeIndex == archetypes.NormalFlickNote.index ||
                archetypeIndex == archetypes.CriticalFlickNote.index ||
                archetypeIndex == archetypes.NormalTraceNote.index ||
                archetypeIndex == archetypes.CriticalTraceNote.index ||
                archetypeIndex == archetypes.NormalTraceFlickNote.index ||
                archetypeIndex == archetypes.CriticalTraceFlickNote.index ||
                archetypeIndex == archetypes.NormalSlideTraceNote.index ||
                archetypeIndex == archetypes.CriticalSlideTraceNote.index ||
                archetypeIndex == archetypes.NormalSlideStartNote.index ||
                archetypeIndex == archetypes.CriticalSlideStartNote.index ||
                archetypeIndex == archetypes.NormalSlideEndNote.index ||
                archetypeIndex == archetypes.CriticalSlideEndNote.index ||
                archetypeIndex == archetypes.NormalSlideEndTraceNote.index ||
                archetypeIndex == archetypes.CriticalSlideEndTraceNote.index ||
                archetypeIndex == archetypes.CriticalSlideEndFlickNote.index ||
                archetypeIndex == archetypes.NormalSlideEndFlickNote.index ||
                archetypeIndex == archetypes.NormalSlideTickNote.index ||
                archetypeIndex == archetypes.CriticalSlideTickNote.index ||
                archetypeIndex == archetypes.HiddenSlideTickNote.index ||
                archetypeIndex == archetypes.NormalAttachedSlideTickNote.index ||
                archetypeIndex == archetypes.CriticalAttachedSlideTickNote.index
            ) {
                lineLength += 1
                this.entityArray.get(ii).value = next
                next = ii
            }
        }
        let currentEntity = next
        for (let i = 0; i < lineLength; i++) {
            let currentHead = currentEntity
            currentEntity = this.entityArray.get(currentEntity).value
            for (let j = 0; j < 32; j++) {
                if (this.cache.get(j) == 0) {
                    this.cache.set(j, currentHead)
                    break
                }
                let A = this.cache.get(j)
                let B = currentHead
                this.cache.set(j, 0)
                currentHead = this.merge(A, B, Math.pow(2, j), Math.pow(2, j))
            }
        }
        let head = -1
        let currentLen = 0
        for (let i = 0; i < 32; i++) {
            if (this.cache.get(i) == 0) continue
            if (head == -1) {
                head = this.cache.get(i)
                currentLen = Math.pow(2, i)
                continue
            }
            let A = head
            let B = this.cache.get(i)
            let Asize = currentLen
            let Bsize = Math.pow(2, i)
            this.cache.set(i, 0)
            head = this.merge(A, B, Asize, Bsize)
            currentLen = Asize + Bsize
        }
        this.entityArray.get(0).start = head
        this.entityArray.get(0).length = lineLength
        let idx = 0
        let ptr = head
        let combo = 0
        while (
            idx < lineLength &&
            ptr != this.entityArray.get(this.entityArray.get(0).tail).value
        ) {
            if (
                replay.isReplay &&
                (this.entityArray.get(ptr).Judgment != Judgment.Perfect || this.ap == true)
            ) {
                this.entityArray.get(ptr).ap = true
                this.ap = true
            }
            if (
                replay.isReplay &&
                (this.entityArray.get(ptr).Judgment == Judgment.Good ||
                    this.entityArray.get(ptr).Judgment == Judgment.Miss)
            )
                combo = 0
            else combo += 1
            this.entityArray.get(ptr).combo = combo
            ptr = this.entityArray.get(ptr).value
            idx++
        }
    }
    merge(a, b, Asize, Bsize) {
        let Alen = 0
        let Blen = 0
        let A = a
        let B = b
        let newHead = this.entityArray.get(A).time > this.entityArray.get(B).time ? B : A
        let pointer = newHead
        if (this.entityArray.get(A).time > this.entityArray.get(B).time) {
            Blen += 1
            B = this.entityArray.get(B).value
        } else {
            Alen += 1
            A = this.entityArray.get(A).value
        }
        while (Alen < Asize && Blen < Bsize) {
            if (this.entityArray.get(A).time > this.entityArray.get(B).time) {
                this.entityArray.get(pointer).value = B
                pointer = B
                B = this.entityArray.get(B).value
                Blen += 1
            } else {
                this.entityArray.get(pointer).value = A
                pointer = A
                A = this.entityArray.get(A).value
                Alen += 1
            }
        }
        if (Alen < Asize) {
            this.entityArray.get(pointer).value = A
            // 마지막 노드 찾기
            while (Alen < Asize) {
                pointer = A
                A = this.entityArray.get(A).value
                Alen += 1
            }
        }
        if (Blen < Bsize) {
            this.entityArray.get(pointer).value = B
            // 마지막 노드 찾기
            while (Blen < Bsize) {
                pointer = B
                B = this.entityArray.get(B).value
                Blen += 1
            }
        }
        this.entityArray.get(pointer).value = -1
        this.entityArray.get(0).tail = pointer
        return newHead
    }
}
