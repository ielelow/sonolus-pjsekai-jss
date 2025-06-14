export var EaseType
;(function (EaseType) {
    EaseType[(EaseType['Out'] = -1)] = 'Out'
    EaseType[(EaseType['Linear'] = 0)] = 'Linear'
    EaseType[(EaseType['In'] = 1)] = 'In'
})(EaseType || (EaseType = {}))
export const ease = (ease, s) => {
    switch (ease) {
        case EaseType.In:
            return Math.ease('In', 'Quad', s)
        case EaseType.Out:
            return Math.ease('Out', 'Quad', s)
        default:
            return s
    }
}
