import { approach, note } from '../../../../../shared/src/engine/data/note.js'
import { perspectiveLayout } from '../../../../../shared/src/engine/data/utils.js'
import { scaledScreen } from '../scaledScreen.js'
import { segment } from '../segment.js'
import { layer, skin } from '../skin.js'
const sprites = {
    normal: skin.sprites.normalTraceNoteDiamond,
    flick: skin.sprites.traceFlickNoteDiamond,
}
var Mode
;(function (Mode) {
    Mode[(Mode['None'] = 0)] = 'None'
    Mode[(Mode['Overlay'] = 1)] = 'Overlay'
    Mode[(Mode['Fall'] = 2)] = 'Fall'
    Mode[(Mode['Frozen'] = 3)] = 'Frozen'
})(Mode || (Mode = {}))
let mode = tutorialMemory(DataType)
let id = tutorialMemory(DataType)
export const traceDiamond = {
    update() {
        if (!mode) return
        if (!id) return
        if (mode === Mode.Overlay) {
            const a = Math.unlerpClamped(1, 0.75, segment.time)
            const l = (-note.h * 3) / scaledScreen.wToH
            const r = (note.h * 3) / scaledScreen.wToH
            const t = 0.5 - note.h * 3
            const b = 0.5 + note.h * 3
            skin.sprites.draw(id, new Rect({ l, r, t, b }), layer.note.tick, a)
        } else {
            const y = mode === Mode.Fall ? approach(0, 2, segment.time) : 1
            const l = -note.h / scaledScreen.wToH
            const r = note.h / scaledScreen.wToH
            const t = 1 - note.h
            const b = 1 + note.h
            skin.sprites.draw(id, perspectiveLayout({ l, r, t, b }).mul(y), layer.note.tick, 1)
        }
    },
    showOverlay(type) {
        mode = Mode.Overlay
        this.setType(type)
    },
    showFall(type) {
        mode = Mode.Fall
        this.setType(type)
    },
    showFrozen(type) {
        mode = Mode.Frozen
        this.setType(type)
    },
    clear() {
        mode = Mode.None
    },
    setType(type) {
        for (const [key, sprite] of Object.entries(sprites)) {
            if (key !== type) continue
            if (sprite.exists) {
                id = sprite.id
            } else {
                id = 0
            }
        }
    },
}
