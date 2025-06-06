import { slideConnectorReplayKeys } from '../../../../../../../shared/src/engine/data/slideConnector.js';
import { perspectiveLayout } from '../../../../../../../shared/src/engine/data/utils.js';
import { options } from '../../../../configuration/options.js';
import { effect } from '../../../effect.js';
import { note } from '../../../note.js';
import { circularEffectLayout, linearEffectLayout, particle } from '../../../particle.js';
import { scaledScreen } from '../../../scaledScreen.js';
import { getZ, layer } from '../../../skin.js';
import { SlideConnector, VisualType } from '../SlideConnector.js';
import { archetypes } from '../../index.js';
export class ActiveSlideConnector extends SlideConnector {
    effectInstanceIds = this.entityMemory({
        circular: ParticleEffectInstanceId,
        linear: ParticleEffectInstanceId,
    });
    glowZ = this.entityMemory(Number);
    slideZ = this.entityMemory(Number);
    diamondZ = this.entityMemory(Number);
    preprocess() {
        super.preprocess();
        if (options.sfxEnabled) {
            if (replay.isReplay && !options.autoSFX) {
                for (const [, start, end] of slideConnectorReplayKeys) {
                    const startTime = this.import[start];
                    const endTime = this.import[end];
                    if (startTime >= endTime)
                        continue;
                    this.scheduleSFX(startTime, endTime);
                }
            }
            else {
                this.scheduleSFX(this.head.time, this.tail.time);
            }
        }
    }
    updateParallel() {
        super.updateParallel();
        if (time.skip) {
            if (this.shouldScheduleCircularEffect)
                this.effectInstanceIds.circular = 0;
            if (this.shouldScheduleLinearEffect)
                this.effectInstanceIds.linear = 0;
        }
        if (time.now < this.head.time)
            return;
        if (this.visual === VisualType.Activated) {
            if (this.shouldScheduleCircularEffect && !this.effectInstanceIds.circular)
                this.spawnCircularEffect();
            if (this.shouldScheduleLinearEffect && !this.effectInstanceIds.linear)
                this.spawnLinearEffect();
            if (this.effectInstanceIds.circular)
                this.updateCircularEffect();
            if (this.effectInstanceIds.linear)
                this.updateLinearEffect();
        }
        this.renderGlow();
        this.renderSlide();
    }
    terminate() {
        if (this.shouldScheduleCircularEffect && this.effectInstanceIds.circular)
            this.destroyCircularEffect();
        if (this.shouldScheduleLinearEffect && this.effectInstanceIds.linear)
            this.destroyLinearEffect();
    }
    get useFallbackSlideSprite() {
        return (!this.slideSprites.left.exists ||
            !this.slideSprites.middle.exists ||
            !this.slideSprites.right.exists);
    }
    get useFallbackClip() {
        return !this.clips.hold.exists;
    }
    get shouldScheduleCircularEffect() {
        return options.noteEffectEnabled && this.effects.circular.exists;
    }
    get shouldScheduleLinearEffect() {
        return options.noteEffectEnabled && this.effects.linear.exists;
    }
    globalInitialize() {
        super.globalInitialize();
        this.glowZ = getZ(layer.connectorSlotGlowEffect, this.head.time, this.headImport.lane);
        this.slideZ = getZ(layer.note.slide, this.head.time, this.headImport.lane);
        this.diamondZ = getZ(layer.note.tick, this.head.time, this.headImport.lane);
    }
    getAlpha() {
        return this.visual === VisualType.NotActivated ? 0.5 : 1;
    }
    renderGlow() {
        if (!options.slotEffectEnabled)
            return;
        if (this.visual !== VisualType.Activated)
            return;
        const s = this.getScale(time.scaled);
        const l = this.getL(s);
        const r = this.getR(s);
        const shear = 1 + 0.25 * options.slotEffectSize;
        const h = 4 * options.slotEffectSize * scaledScreen.wToH;
        const w = 0.15;
        this.glowSprite.draw({
            x1: l - w,
            x2: l * shear - w,
            x3: r * shear + w,
            x4: r + w,
            y1: 1,
            y2: 1 - h,
            y3: 1 - h,
            y4: 1,
        }, this.glowZ,
            (options.lightweight
                ? Math.min(1, Math.max(0, (time.now - this.start.time) / 0.25)) * 0.25
                : Math.min(1, Math.max(0, (time.now - this.start.time) / 0.25))
            ) *
            ((Math.cos(((time.now - this.start.time) * 8 * Math.PI) / 2) + 1) / 20 + 0.2)
        );
    }
    renderSlide() {
        const s = this.getScale(time.scaled);
        const l = this.getL(s);
        const r = this.getR(s);
        const b = 1 + note.h;
        const t = 1 - note.h;
        if (this.useFallbackSlideSprite) {
            this.slideSprites.fallback.draw(perspectiveLayout({ l, r, b, t }), this.slideZ, 1);
        }
        else {
            const ml = l + 0.25;
            const mr = r - 0.25;
            const w = note.h / scaledScreen.wToH;
            const center = (l + r) / 2; // 중심 계산
            if (entityInfos.get(this.import.startRef).archetype === archetypes.IgnoredSlideTickNote.index) {
                //None
            }
            else if (entityInfos.get(this.import.startRef).archetype === archetypes.NormalSlideStartNote.index || entityInfos.get(this.import.startRef).archetype === archetypes.CriticalSlideStartNote.index) {
                this.slideSprites.left.draw(perspectiveLayout({ l, r: ml, b, t }), this.slideZ, 1);
                this.slideSprites.middle.draw(perspectiveLayout({ l: ml, r: mr, b, t }), this.slideZ, 1);
                this.slideSprites.right.draw(perspectiveLayout({ l: mr, r, b, t }), this.slideZ, 1);
            }
            else {
                this.slideSprites.tleft.draw(perspectiveLayout({ l, r: ml, b, t }), this.slideZ, 1);
                this.slideSprites.tmiddle.draw(perspectiveLayout({ l: ml, r: mr, b, t }), this.slideZ, 1);
                this.slideSprites.tdiamond.draw(perspectiveLayout({ l: center - w, r: center + w, b: 1 + note.h, t: 1 - note.h }), this.diamondZ, 1);
                this.slideSprites.tright.draw(perspectiveLayout({ l: mr, r, b, t }), this.slideZ, 1);
            }
        }
    }
    scheduleSFX(startTime, endTime) {
        const id = 'fallback' in this.clips && this.useFallbackClip
            ? this.clips.fallback.scheduleLoop(startTime)
            : this.clips.hold.scheduleLoop(startTime);
        effect.clips.scheduleStopLoop(id, endTime);
    }
    spawnCircularEffect() {
        this.effectInstanceIds.circular = this.effects.circular.spawn(new Quad(), 1, true);
    }
    updateCircularEffect() {
        const s = this.getScale(time.scaled);
        const lane = this.getLane(s);
        particle.effects.move(this.effectInstanceIds.circular, circularEffectLayout({
            lane,
            w: 3.5,
            h: 2.1,
        }));
    }
    destroyCircularEffect() {
        particle.effects.destroy(this.effectInstanceIds.circular);
        this.effectInstanceIds.circular = 0;
    }
    spawnLinearEffect() {
        this.effectInstanceIds.linear = this.effects.linear.spawn(new Quad(), 1, true);
    }
    updateLinearEffect() {
        const s = this.getScale(time.scaled);
        const lane = this.getLane(s);
        particle.effects.move(this.effectInstanceIds.linear, linearEffectLayout({
            lane,
            shear: 0,
        }));
    }
    destroyLinearEffect() {
        particle.effects.destroy(this.effectInstanceIds.linear);
        this.effectInstanceIds.linear = 0;
    }
}
