import { perspectiveLayout } from '../../../../../../../shared/src/engine/data/utils.js'
import { options } from '../../../../configuration/options.js'
import { effect } from '../../../effect.js'
import { note } from '../../../note.js'
import { circularEffectLayout, linearEffectLayout, particle } from '../../../particle.js'
import { scaledScreen } from '../../../scaledScreen.js'
import { getZ, layer } from '../../../skin.js'
import { archetypes } from '../../index.js'
import { SlideConnector, VisualType } from '../SlideConnector.js'
export class ActiveSlideConnector extends SlideConnector {
    sfxInstanceId = this.entityMemory(LoopedEffectClipInstanceId)
    glowZ = this.entityMemory(Number)
    slideZ = this.entityMemory(Number)
    diamondZ = this.entityMemory(Number)
    preprocess() {
        super.preprocess()
        if (this.shouldScheduleSFX) this.scheduleSFX()
    }
    initialize() {
        super.initialize()
        this.glowZ = getZ(layer.connectorSlotGlowEffect, this.head.time, this.headImport.lane)
        this.slideZ = getZ(layer.note.slide, this.head.time, this.headImport.lane)
        this.diamondZ = getZ(layer.note.tick, this.head.time, this.headImport.lane)
    }
    updateParallel() {
        if (time.now >= this.tail.time) {
            this.despawn = true
            return
        }
        if (time.scaled < this.visualTime.min) return
        this.updateVisualType()
        this.renderConnector()
        if (time.now < this.head.time) return
        if (this.visual === VisualType.Activated) {
            if (this.shouldPlaySFX && !this.sfxInstanceId) this.playSFX()
            if (this.shouldPlayCircularEffect && this.startSharedMemory.circular)
                this.updateCircularEffect()
            if (this.shouldPlayLinearEffect && this.startSharedMemory.linear)
                this.updateLinearEffect()
        } else {
            if (this.shouldPlaySFX && this.sfxInstanceId) this.stopSFX()
            if (this.shouldPlayCircularEffect && this.startSharedMemory.circular)
                this.destroyCircularEffect()
            if (this.shouldPlayLinearEffect && this.startSharedMemory.linear)
                this.destroyLinearEffect()
        }
        this.renderGlow()
        this.renderSlide()
    }
    updateSequential() {
        super.updateSequential()
        if (time.now < this.head.time) return
        if (this.visual === VisualType.Activated) {
            if (this.shouldPlayCircularEffect && !this.startSharedMemory.circular)
                this.spawnCircularEffect()
            if (this.shouldPlayLinearEffect && !this.startSharedMemory.linear)
                this.spawnLinearEffect()
            if (
                this.shouldPlayNoneMoveLinearEffect &&
                time.now >= this.startSharedMemory.noneMoveLinear
            )
                this.spawnNoneMoveLinearEffect()
            if (this.shouldPlaySlotEffects && time.now >= this.startSharedMemory.slotEffects)
                this.spawnSlotEffects()
        }
    }
    terminate() {
        if (this.shouldPlaySFX && this.sfxInstanceId) this.stopSFX()
        if (this.import.endRef == this.import.tailRef) {
            if (this.shouldPlayCircularEffect && this.startSharedMemory.circular)
                this.destroyCircularEffect()
            if (this.shouldPlayLinearEffect && this.startSharedMemory.linear)
                this.destroyLinearEffect()
        }
    }
    get shouldScheduleSFX() {
        return (
            options.sfxEnabled &&
            // @ts-ignore
            (this.useFallbackClip ? this.clips.fallback.exists : this.clips.hold.exists) &&
            options.autoSFX
        )
    }
    get shouldPlaySFX() {
        return (
            options.sfxEnabled &&
            // @ts-ignore
            (this.useFallbackClip ? this.clips.fallback.exists : this.clips.hold.exists) &&
            !options.autoSFX
        )
    }
    get shouldPlayCircularEffect() {
        // @ts-ignore
        return options.noteEffectEnabled && this.effects.circular.exists
    }
    get shouldPlayLinearEffect() {
        // @ts-ignore
        return options.noteEffectEnabled && this.effects.linear.exists
    }
    get shouldPlayNoneMoveLinearEffect() {
        // @ts-ignore
        return options.noteEffectEnabled && this.effects.noneMoveLinear.exists
    }
    get shouldPlaySlotEffects() {
        // @ts-ignore
        return options.slotEffectEnabled && this.effects.slotEffects.exists
    }
    get useFallbackSlideSprite() {
        return (
            // @ts-ignore
            !this.slideSprites.left.exists ||
            // @ts-ignore
            !this.slideSprites.middle.exists ||
            // @ts-ignore
            !this.slideSprites.right.exists
        )
    }
    get useFallbackClip() {
        // @ts-ignore
        return !this.clips.hold.exists
    }
    scheduleSFX() {
        const id = this.useFallbackClip
            ? // @ts-ignore
              this.clips.fallback.scheduleLoop(this.head.time)
            : // @ts-ignore
              this.clips.hold.scheduleLoop(this.head.time)
        effect.clips.scheduleStopLoop(id, this.tail.time)
    }
    playSFX() {
        this.sfxInstanceId = this.useFallbackClip
            ? // @ts-ignore
              this.clips.fallback.loop()
            : // @ts-ignore
              this.clips.hold.loop()
    }
    stopSFX() {
        effect.clips.stopLoop(this.sfxInstanceId)
        this.sfxInstanceId = 0
    }
    spawnCircularEffect() {
        // @ts-ignore
        this.startSharedMemory.circular = this.effects.circular.spawn(new Quad(), 1, true)
    }
    updateCircularEffect() {
        const s = this.getScale(time.scaled)
        const lane = this.getLane(s)
        particle.effects.move(
            this.startSharedMemory.circular,
            circularEffectLayout({
                lane,
                w: 3.5,
                h: 2.1,
            }),
        )
    }
    destroyCircularEffect() {
        particle.effects.destroy(this.startSharedMemory.circular)
        archetypes.SlideParticleManager.spawn({
            startRef: this.import.startRef,
            function: 0,
        })
    }
    spawnLinearEffect() {
        // @ts-ignore
        this.startSharedMemory.linear = this.effects.linear.spawn(new Quad(), 1, true)
    }
    spawnNoneMoveLinearEffect() {
        const s = this.getScale(time.scaled)
        const lane = this.getLane(s)
        // @ts-ignore
        this.effects.noneMoveLinear.spawn(
            linearEffectLayout({
                lane,
                shear: 0,
            }),
            0.5,
            false,
        )
        this.startSharedMemory.noneMoveLinear = time.now + 0.1
    }
    spawnSlotEffects() {
        const s = this.getScale(time.scaled)
        const l = this.getL(s)
        const r = this.getR(s)
        for (let i = l + 0.5; i < r - 0.5; i++) {
            // @ts-ignore
            this.effects.slotEffects.spawn(
                linearEffectLayout({
                    lane: i,
                    shear: 0,
                }),
                0.5,
                false,
            )
        }
        this.startSharedMemory.slotEffects = time.now + 0.2
    }
    updateLinearEffect() {
        const s = this.getScale(time.scaled)
        const lane = this.getLane(s)
        particle.effects.move(
            this.startSharedMemory.linear,
            // @ts-ignore
            linearEffectLayout({
                lane,
                shear: 0,
            }),
        )
    }
    destroyLinearEffect() {
        particle.effects.destroy(this.startSharedMemory.linear)
        archetypes.SlideParticleManager.spawn({
            startRef: this.import.startRef,
            function: 1,
        })
    }
    getAlpha() {
        return this.visual === VisualType.NotActivated ? 0.5 : 1
    }
    renderGlow() {
        if (!options.slotEffectEnabled) return
        if (this.visual !== VisualType.Activated) return
        const s = this.getScale(time.scaled)
        const l = this.getL(s)
        const r = this.getR(s)
        const dynamicHeight = 3 + (Math.cos((time.now - this.start.time) * 8 * Math.PI) + 1) / 2
        const h = dynamicHeight * options.slotEffectSize * scaledScreen.wToH
        const shear = 1 + 0.25 * (dynamicHeight / 4) * options.slotEffectSize
        const w = 0.15
        // @ts-ignore
        this.glowSprite.draw(
            {
                x1: l - w,
                x2: l * shear - w,
                x3: r * shear + w,
                x4: r + w,
                y1: 1,
                y2: 1 - h,
                y3: 1 - h,
                y4: 1,
            },
            this.glowZ,
            Math.min(0.25, (time.now - this.start.time) * 4) * (options.lightweight ? 0.25 : 0.4),
        )
    }
    renderSlide() {
        const s = this.getScale(time.scaled)
        const l = this.getL(s)
        const r = this.getR(s)
        const b = 1 + note.h
        const t = 1 - note.h
        if (this.useFallbackSlideSprite) {
            // @ts-ignore
            this.slideSprites.fallback.draw(perspectiveLayout({ l, r, b, t }), this.slideZ, 1)
        } else {
            const ml = l + 0.25
            const mr = r - 0.25
            const w = note.h / scaledScreen.wToH
            const lane = this.getLane(s)
            if (
                entityInfos.get(this.import.startRef).archetype ===
                archetypes.IgnoredSlideTickNote.index
            ) {
                //None
            } else if (
                entityInfos.get(this.import.startRef).archetype ===
                    archetypes.NormalSlideStartNote.index ||
                entityInfos.get(this.import.startRef).archetype ===
                    archetypes.CriticalSlideStartNote.index
            ) {
                // @ts-ignore
                this.slideSprites.left.draw(perspectiveLayout({ l, r: ml, b, t }), this.slideZ, 1)
                // @ts-ignore
                this.slideSprites.middle.draw(
                    perspectiveLayout({ l: ml, r: mr, b, t }),
                    this.slideZ,
                    1,
                )
                // @ts-ignore
                this.slideSprites.right.draw(perspectiveLayout({ l: mr, r, b, t }), this.slideZ, 1)
            } else {
                // @ts-ignore
                this.slideSprites.tleft.draw(perspectiveLayout({ l, r: ml, b, t }), this.slideZ, 1)
                // @ts-ignore
                this.slideSprites.tmiddle.draw(
                    perspectiveLayout({ l: ml, r: mr, b, t }),
                    this.slideZ,
                    1,
                )
                // @ts-ignore
                this.slideSprites.tright.draw(perspectiveLayout({ l: mr, r, b, t }), this.slideZ, 1)
                // @ts-ignore
                this.slideSprites.tdiamond.draw(
                    new Rect({
                        l: lane - w,
                        r: lane + w,
                        b: 1 + note.h,
                        t: 1 - note.h,
                    }),
                    this.diamondZ,
                    1,
                )
            }
        }
    }
}
