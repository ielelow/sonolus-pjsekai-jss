import { ClaimManager } from './ClaimManager.js';
const disallowedEmpties = levelMemory({
    old: Collection(16, TouchId),
    now: Collection(16, TouchId),
});
export const canEmpty = (touch) => !disallowedEmpties.now.has(touch.id);
export const disallowEmpty = (touch) => {
    disallowedEmpties.now.add(touch.id);
};
const claimStartManager = new ClaimManager();
export const claimStart = (index, time, hitbox, fullHitbox) => {
    claimStartManager.claim(index, time, hitbox, fullHitbox, (touch) => touch.started);
};
export const getClaimedStart = (index) => claimStartManager.getClaimedTouchIndex(index);
export const claimEndManager = new ClaimManager();
export const claimEnd = (index, time, hitbox, fullHitbox, targetTime) => {
    claimEndManager.claim(index, time, hitbox, fullHitbox, (touch) => touch.ended && canEnd(touch, targetTime));
};
export const getClaimedEnd = (index) => claimEndManager.getClaimedTouchIndex(index);
const disallowedEnds = levelMemory({
    old: Dictionary(16, TouchId, Number),
    now: Dictionary(16, TouchId, Number),
});
const canEnd = (touch, targetTime) => {
    const index = disallowedEnds.now.indexOf(touch.id);
    if (index === -1)
        return true;
    return disallowedEnds.now.getValue(index) < targetTime;
};
export const disallowEnd = (touch, untilTime) => {
    disallowedEnds.now.set(touch.id, untilTime);
};
export class InputManager extends SpawnableArchetype({}) {
    updateSequential() {
        claimStartManager.clear();
        claimEndManager.clear();
        disallowedEmpties.now.copyTo(disallowedEmpties.old);
        disallowedEmpties.now.clear();
        disallowedEnds.now.copyTo(disallowedEnds.old);
        disallowedEnds.now.clear();
        for (const touch of touches) {
            if (disallowedEmpties.old.has(touch.id))
                disallowedEmpties.now.add(touch.id);
            const index = disallowedEnds.old.indexOf(touch.id);
            if (index !== -1)
                disallowedEnds.now.set(touch.id, disallowedEnds.old.getValue(index));
        }
    }
}
