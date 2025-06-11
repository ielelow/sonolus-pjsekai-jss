import { archetypes } from "../../index";
export class SlideParticleManager extends SpawnableArchetype({
  startRef: Number,
  function: Number,
}) {
  check = this.entityMemory(Boolean);
  terminate() {
    this.check = false;
  }
  updateSequential() {
    if (this.check) {
      this.despawn = true;
      return;
    }
    this.check = true;
    if (this.spawnData.function == 0) this.startSharedMemory.circular = 0;
    if (this.spawnData.function == 1) this.startSharedMemory.linear = 0;
  }
  get startSharedMemory() {
    return archetypes.NormalSlideStartNote.sharedMemory.get(
      this.spawnData.startRef,
    );
  }
}
