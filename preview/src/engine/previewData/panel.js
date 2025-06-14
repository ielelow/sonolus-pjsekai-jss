import { options } from '../configuration/options.js'
import { chart } from './chart.js'
export const panel = {
    w: 20,
    get h() {
        return 2 / options.previewVerticalScale
    },
    get count() {
        return Math.ceil(chart.duration / this.h)
    },
    getX(time) {
        return Math.floor(time / this.h) * this.w
    },
    getY(time) {
        return time % this.h
    },
    getPos(time) {
        return new Vec(this.getX(time), this.getY(time))
    },
}
