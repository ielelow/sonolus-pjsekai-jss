import { archetypes } from "../../index";
export class SlideParticleManager extends SpawnableArchetype({
  startRef: Number,
  function: Number,
}) {
  updateSequential() {
    if (
      this.startSharedMemory.circular == 0 &&
      this.startSharedMemory.linear == 0
    ) {
      this.despawn = true;
      return;
    }
    if (this.spawnData.function == 0) this.startSharedMemory.circular = 0;
    if (this.spawnData.function == 1) this.startSharedMemory.linear = 0;
  }
  get startSharedMemory() {
    return archetypes.NormalSlideStartNote.sharedMemory.get(
      this.spawnData.startRef,
    );
  }
}
