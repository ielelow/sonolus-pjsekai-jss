export var EaseType
;(function (EaseType) {
    EaseType[(EaseType['OutIn'] = -2)] = 'OutIn'
    EaseType[(EaseType['Out'] = -1)] = 'Out'
    EaseType[(EaseType['Linear'] = 0)] = 'Linear'
    EaseType[(EaseType['In'] = 1)] = 'In'
    EaseType[(EaseType['InOut'] = 2)] = 'InOut'
})(EaseType || (EaseType = {}))
export const ease = (ease, s) => {
    switch (ease) {
        case EaseType.In:
            return Math.ease('In', 'Quad', s)
        case EaseType.Out:
            return Math.ease('Out', 'Quad', s)
        case EaseType.InOut:
            return Math.ease('InOut', 'Quad', s)
        case EaseType.OutIn:
            return Math.ease('OutIn', 'Quad', s)
        default:
            return s
    }
}
