import { archetypes } from "../../index";
export class SlideParticleManager extends SpawnableArchetype({
  startRef: Number,
  t: Number,
}) {
  check = this.entityMemory(Boolean);
  spawnTime() {
    return timeScaleChanges.at(this.spawnData.t).scaledTime;
  }
  despawnTime() {
    return timeScaleChanges.at(this.spawnData.t + 1).scaledTime;
  }
  terminate() {
    this.check = false;
  }
  updateSequential() {
    if (this.check) return;
    this.check = true;
    this.startSharedMemory.circular = 0;
    this.startSharedMemory.linear = 0;
  }
  get startSharedMemory() {
    return archetypes.NormalSlideStartNote.sharedMemory.get(
      this.spawnData.startRef,
    );
  }
}
