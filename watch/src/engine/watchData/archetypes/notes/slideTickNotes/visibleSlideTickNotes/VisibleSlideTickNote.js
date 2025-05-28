import { approach } from '../../../../../../../../shared/src/engine/data/note.js';
import { perspectiveLayout } from '../../../../../../../../shared/src/engine/data/utils.js';
import { options } from '../../../../../configuration/options.js';
import { sfxDistance } from '../../../../effect.js';
import { note } from '../../../../note.js';
import { flatEffectLayout } from '../../../../particle.js';
import { scaledScreen } from '../../../../scaledScreen.js';
import { getZ, layer } from '../../../../skin.js';
import { SlideTickNote } from '../SlideTickNote.js';
import { archetypes } from '../../../index.js';
export class VisibleSlideTickNote extends SlideTickNote {
    visualTime = this.entityMemory(Range);
    hiddenTime = this.entityMemory(Number);
    initialized = this.entityMemory(Boolean);
    spriteLayout = this.entityMemory(Quad);
    z = this.entityMemory(Number);
    preprocessOrder = 0.2;
    preprocess() {
        if (options.mirror)
            this.import.lane *= -1;
        this.targetTime = bpmChanges.at(this.import.beat).time;
        if (this.hasInput)
            this.result.time = this.targetTime;
        if (options.customJudgment) {
            archetypes.Judg.spawn({ t: this.targetTime, j: this.import.judgment });
        }
        if (options.customCombo) {
            this.entityArray.get(this.info.index).time = timeScaleChanges.at(this.targetTime).scaledTime
            this.entityArray.get(this.info.index).Judgment = this.import.judgment
            archetypes.ComboN.spawn({ t: this.targetTime, i: this.info.index })
            archetypes.ComboT.spawn({ t: this.targetTime, i: this.info.index })
        }
        this.visualTime.copyFrom(Range.l.mul(note.duration).add(timeScaleChanges.at(this.targetTime).scaledTime));
        if (options.sfxEnabled) {
            if (replay.isReplay && !options.autoSFX) {
                this.scheduleReplaySFX();
            }
            else {
                this.scheduleSFX();
            }
        }
    }
    spawnTime() {
        return this.visualTime.min;
    }
    despawnTime() {
        return this.visualTime.max;
    }
    initialize() {
        if (this.initialized)
            return;
        this.initialized = true;
        this.globalInitialize();
    }
    updateParallel() {
        if (options.hidden > 0 && time.scaled > this.hiddenTime)
            return;
        this.render();
    }
    terminate() {
        if (time.skip)
            return;
        this.despawnTerminate();
    }
    get useFallbackSprite() {
        return !this.sprites.tick.exists;
    }
    get useFallbackClip() {
        return !this.clips.tick.exists;
    }
    globalInitialize() {
        if (options.hidden > 0)
            this.hiddenTime = this.visualTime.max - note.duration * options.hidden;
        const b = 1 + note.h;
        const t = 1 - note.h;
        if (this.useFallbackSprite) {
            const l = this.import.lane - this.import.size;
            const r = this.import.lane + this.import.size;
            perspectiveLayout({ l, r, b, t }).copyTo(this.spriteLayout);
        }
        else {
            const w = note.h / scaledScreen.wToH;
            new Rect({
                l: this.import.lane - w,
                r: this.import.lane + w,
                b,
                t,
            })
                .toQuad()
                .copyTo(this.spriteLayout);
        }
        this.z = getZ(layer.note.tick, this.targetTime, this.import.lane);
    }
    scheduleSFX() {
        if (this.useFallbackClip) {
            this.clips.fallback.schedule(this.targetTime, sfxDistance);
        }
        else {
            this.clips.tick.schedule(this.targetTime, sfxDistance);
        }
    }
    scheduleReplaySFX() {
        if (!this.import.judgment)
            return;
        this.scheduleSFX();
    }
    render() {
        const y = approach(this.visualTime.min, this.visualTime.max, time.scaled);
        if (this.useFallbackSprite) {
            this.sprites.fallback.draw(this.spriteLayout.mul(y), this.z, 1);
        }
        else {
            this.sprites.tick.draw(this.spriteLayout.mul(y), this.z, 1);
        }
    }
    despawnTerminate() {
        if (replay.isReplay && !this.import.judgment)
            return;
        if (options.noteEffectEnabled)
            this.playNoteEffect();
    }
    playNoteEffect() {
        this.effect.spawn(flatEffectLayout({ lane: this.import.lane }), 0.6, false);
    }
}
