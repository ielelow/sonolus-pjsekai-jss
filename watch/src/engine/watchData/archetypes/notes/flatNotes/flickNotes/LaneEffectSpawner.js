import { particle } from "../../../../particle.js"
import { perspectiveLayout } from "../../../../../../../../shared/src/engine/data/utils.js"
import { SharedLaneEffectUtils } from "./SharedLaneEffectUtils.js"

export class LaneEffectSpawner extends SpawnableArchetype({
    l: Number,
    r: Number,
    t: Number,
    laneB: Number,
    laneT: Number,
    j: DataType,
})
{
    laneE = levelMemory({
        id1: ParticleEffectInstanceId,
        id2: ParticleEffectInstanceId,
        id3: ParticleEffectInstanceId,
        id4: ParticleEffectInstanceId,
        lanes1: { l: Number, r: Number },
        lanes2: { l: Number, r: Number },
        lanes3: { l: Number, r: Number },
        lanes4: { l: Number, r: Number },
        count: Number,
    })
    check = this.entityMemory(Boolean)
    spawnTime() {
        return timeScaleChanges.at(this.spawnData.t).scaledTime;
    }
    despawnTime() {
        return timeScaleChanges.at(this.spawnData.t + 1).scaledTime;
    }
    terminate() {
        this.check = false
    }
    updateSequential() {
        if (this.check) return
        this.check = true
        if (!replay.isReplay || this.spawnData.j != Judgment.Miss) {
            const id = particle.effects.criticalFlickLane.spawn(perspectiveLayout({
                l: this.spawnData.l,
                r: this.spawnData.r,
                b: this.spawnData.laneB,
                t: this.spawnData.laneT
            }), 1, false);
            SharedLaneEffectUtils.playAndHandleLaneEffect(id, this.spawnData.l, this.spawnData.r, this.laneE)
        }
    }
}