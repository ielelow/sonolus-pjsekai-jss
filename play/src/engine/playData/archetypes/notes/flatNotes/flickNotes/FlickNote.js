import { FlickDirection } from '../../../../../../../../shared/src/engine/data/FlickDirection.js'
import { getArrowSpriteId } from '../../../../../../../../shared/src/engine/data/arrowSprites.js'
import { options } from '../../../../../configuration/options.js'
import { linearEffectLayout } from '../../../../particle.js'
import { scaledScreen } from '../../../../scaledScreen.js'
import { getZ, layer, skin } from '../../../../skin.js'
import { FlatNote } from '../FlatNote.js'
export class FlickNote extends FlatNote {
    leniency = 1
    flickImport = this.defineImport({
        direction: { name: 'direction', type: DataType },
    })
    flickExport = this.defineExport({
        accuracyDiff: { name: 'accuracyDiff', type: Number },
        flick: { name: 'flick', type: Boolean },
    })
    judExport = this.defineExport({
        jud: { name: 'jud', type: Number },
    })
    arrow = this.entityMemory({
        sprite: SkinSpriteId,
        layout: Quad,
        animation: Vec,
        z: Number,
    })
    check = this.entityMemory(Boolean)
    laneEffectId = levelMemory(Tuple(12, ParticleEffectInstanceId))
    laneEffectLane = levelMemory({ l: Tuple(12, Number), r: Tuple(12, Number) })
    preprocess() {
        super.preprocess()
        // @ts-ignore
        if (options.mirror) this.flickImport.direction *= -1
    }
    initialize() {
        super.initialize()
        this.arrow.sprite = getArrowSpriteId(
            // @ts-ignore
            this.arrowSprites,
            this.import.size,
            this.flickImport.direction,
        )
        if (skin.sprites.exists(this.arrow.sprite)) {
            const w = (Math.clamp(this.import.size, 0, 3) * (-this.flickImport.direction || 1)) / 2
            new Rect({
                l: this.import.lane - w,
                r: this.import.lane + w,
                b: 1,
                t: 1 - 2 * Math.abs(w) * scaledScreen.wToH,
            })
                .toQuad()
                .copyTo(this.arrow.layout)
        } else {
            // @ts-ignore
            this.arrow.sprite = this.arrowSprites.fallback.id
            const w = Math.clamp(this.import.size / 2, 1, 2)
            new Rect({ l: -1, r: 1, b: 1, t: -1 })
                .toQuad()
                // @ts-ignore
                .rotate((Math.PI / 6) * this.flickImport.direction)
                .scale(w, w * scaledScreen.wToH)
                .translate(this.import.lane, 1 - w * scaledScreen.wToH)
                .copyTo(this.arrow.layout)
        }
        if (options.markerAnimation)
            // @ts-ignore
            new Vec(this.flickImport.direction, -2 * scaledScreen.wToH).copyTo(this.arrow.animation)
        this.arrow.z = getZ(layer.note.arrow, this.targetTime, this.import.lane)
    }
    complete(touch) {
        // @ts-ignore
        this.result.judgment = input.judge(touch.time, this.targetTime, this.windows)
        this.result.accuracy = touch.time - this.targetTime
        if (!this.isCorrectDirection(touch)) {
            if (this.result.judgment === Judgment.Perfect) this.result.judgment = Judgment.Great
            // @ts-ignore
            if (this.result.accuracy < this.windows.perfect.max) {
                // @ts-ignore
                this.flickExport('accuracyDiff', this.result.accuracy - this.windows.perfect.max)
                // @ts-ignore
                this.result.accuracy = this.windows.perfect.max
            }
            this.flickExport('flick', true)
            // @ts-ignore
            if (this.windows.perfect.min > this.result.accuracy) this.judExport('jud', 1)
            // @ts-ignore
            else if (this.windows.perfect.max < this.result.accuracy) this.judExport('jud', 2)
            this.sharedMemory.get(this.info.index).flick = true
        }
        // @ts-ignore
        this.result.bucket.index = this.bucket.index
        this.result.bucket.value = this.result.accuracy * 1000
        this.playHitEffects(touch.time)
        this.despawn = true
    }
    render() {
        super.render()
        if (options.markerAnimation) {
            const s = Math.mod(time.now, 0.5) / 0.5
            skin.sprites.draw(
                this.arrow.sprite,
                this.arrow.layout.add(this.arrow.animation.mul(s)).mul(this.y),
                this.arrow.z,
                1 - Math.ease('In', 'Cubic', s),
            )
        } else {
            skin.sprites.draw(this.arrow.sprite, this.arrow.layout.mul(this.y), this.arrow.z, 1)
        }
    }
    playNoteEffects() {
        super.playNoteEffects()
        this.playDirectionalNoteEffect()
    }
    playDirectionalNoteEffect() {
        // @ts-ignore
        this.directionalEffect.spawn(
            linearEffectLayout({
                lane: this.import.lane,
                shear: this.flickImport.direction,
            }),
            0.32,
            false,
        )
    }
    isCorrectDirection(touch) {
        if (this.flickImport.direction === FlickDirection.Up) return true
        // @ts-ignore
        const a = Math.PI / 2 - this.flickImport.direction
        return touch.dx * Math.cos(a) + touch.dy * Math.sin(a) > 0
    }
}
