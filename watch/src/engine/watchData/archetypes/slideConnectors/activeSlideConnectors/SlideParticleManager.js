import { particle } from '../../../particle'
import { archetypes } from '../../index'
export class SlideParticleManager extends SpawnableArchetype({
    startRef: Number,
    t: Number,
}) {
    spawnTime() {
        return timeScaleChanges.at(this.spawnData.t).scaledTime
    }
    despawnTime() {
        return timeScaleChanges.at(this.spawnData.t + 1).scaledTime
    }
    updateSequential() {
        if (
            this.startSharedMemory.circular == 0 &&
            this.startSharedMemory.linear == 0 &&
            this.startSharedMemory.slotEffects == 0 &&
            this.startSharedMemory.noneMoveLinear == 0
        )
            return
        particle.effects.destroy(this.startSharedMemory.circular)
        particle.effects.destroy(this.startSharedMemory.linear)
        this.startSharedMemory.circular = 0
        this.startSharedMemory.linear = 0
        this.startSharedMemory.slotEffects = 0
        this.startSharedMemory.noneMoveLinear = 0
    }
    get startSharedMemory() {
        return archetypes.NormalSlideStartNote.sharedMemory.get(this.spawnData.startRef)
    }
}
