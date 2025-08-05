import { ParticleEffectName } from '@sonolus/core'
import { options } from '../configuration/options.js'
import { scaledScreen } from './scaledScreen.js'
export const particle = defineParticle({
    effects: {
        lane: ParticleEffectName.LaneLinear,
        noteLane: 'Sekai Note Lane Linear',
        criticalLane: 'Sekai Critical Lane Linear',
        criticalFlickLane: 'Sekai Critical Flick Lane Linear',
        normalNoteCircular: ParticleEffectName.NoteCircularTapCyan,
        normalNoteLinear: ParticleEffectName.NoteLinearTapCyan,
        slideNoteCircular: ParticleEffectName.NoteCircularTapGreen,
        slideNoteLinear: ParticleEffectName.NoteLinearTapGreen,
        flickNoteCircular: ParticleEffectName.NoteCircularTapRed,
        flickNoteLinear: ParticleEffectName.NoteLinearTapRed,
        flickNoteDirectional: ParticleEffectName.NoteLinearAlternativeRed,
        criticalNoteCircular: ParticleEffectName.NoteCircularTapYellow,
        criticalNoteLinear: ParticleEffectName.NoteLinearTapYellow,
        criticalNoteDirectional: ParticleEffectName.NoteLinearAlternativeYellow,
        criticalFlickNoteCircular: 'Sekai Critical Flick Circular Yellow',
        criticalFlickNoteLinear: 'Sekai Critical Flick Linear Yellow',
        criticalSlideCircular: 'Sekai Critical Slide Circular Yellow',
        criticalSlideLinear: 'Sekai Critical Slide Linear Yellow',
        normalTraceNoteCircular: 'Sekai Trace Note Circular Green',
        normalTraceNoteLinear: 'Sekai Trace Note Linear Green',
        criticalTraceNoteCircular: 'Sekai Trace Note Circular Yellow',
        criticalTraceNoteLinear: 'Sekai Trace Note Linear Yellow',
        normalSlideTickNote: ParticleEffectName.NoteCircularAlternativeGreen,
        criticalSlideTickNote: ParticleEffectName.NoteCircularAlternativeYellow,
        normalSlideConnectorCircular: ParticleEffectName.NoteCircularHoldGreen,
        normalSlideConnectorLinear: ParticleEffectName.NoteLinearHoldGreen,
        normalSlideConnectorNoneMoveLinear: 'Sekai Normal Slide Connector Linear',
        criticalSlideConnectorCircular: ParticleEffectName.NoteCircularHoldYellow,
        criticalSlideConnectorLinear: ParticleEffectName.NoteLinearHoldYellow,
        criticalSlideConnectorNoneMoveLinear: 'Sekai Critical Slide Connector Linear',
        slotEffectCyan: 'Sekai Slot Linear Tap Cyan',
        slotEffectYellow: 'Sekai Slot Linear Tap Yellow',
        slotEffectSlideTapGreen: 'Sekai Slot Linear Slide Tap Green',
        slotEffectSlideTapYellow: 'Sekai Slot Linear Slide Tap Yellow',
        slotEffectFlickRed: 'Sekai Slot Linear Alternative Red',
        slotEffectFlickYellow: 'Sekai Slot Linear Alternative Yellow',
        slotEffectNormalSlideConnector: 'Sekai Slot Linear Slide Green',
        slotEffectCriticalSlideConnector: 'Sekai Slot Linear Slide Yellow',
    },
})
export const circularEffectLayout = ({ lane, w, h, yFromC, yToC }) => {
    // Scale w and h
    w *= options.noteEffectSize
    h *= options.noteEffectSize * scaledScreen.wToH

    // Calculate bounds
    const b = 1 + h
    const t = 1 - h

    // 3D skew logic
    const yAvg = (yFromC + yToC) / 2
    const maxSkew = 0.4
    const direction = lane < 0 ? -1 : lane > 0 ? 1 : 0
    const skew = yAvg * maxSkew * direction * Math.abs(lane)

    // Apply skew to horizontal base position
    const xOffsetB = lane * b + skew
    const xOffsetT = lane * t + skew

    return {
        x1: xOffsetB + w,
        x2: xOffsetT + w,
        x3: xOffsetT - w,
        x4: xOffsetB - w,

        y1: b,
        y2: t,
        y3: t,
        y4: b,
    }
}
    }
}
export const linearEffectLayout = ({ lane, shear }) => {
    const w = options.noteEffectSize
    const h = options.noteEffectSize * scaledScreen.wToH
    const p = 1 + 0.125 * options.noteEffectSize
    const b = 1
    const t = 1 - 2 * h
    shear *= options.noteEffectSize
    return {
        x1: lane - w,
        x2: lane * p - w + shear,
        x3: lane * p + w + shear,
        x4: lane + w,
        y1: b,
        y2: t,
        y3: t,
        y4: b,
    }
}
export const flatEffectLayout = ({ lane }) => {
    const w = 4 * options.noteEffectSize
    const h = w * scaledScreen.wToH
    return new Rect({
        l: lane - w,
        r: lane + w,
        b: 1 + h,
        t: 1 - h,
    })
}
