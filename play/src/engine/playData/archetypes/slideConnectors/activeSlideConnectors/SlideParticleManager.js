import { archetypes } from "../../index";
import { particle } from "../../../particle";
export class SlideParticleManager extends SpawnableArchetype({
  startRef: Number,
  function: Number,
}) {
  updateSequential() {
    if (
      (this.startSharedMemory.circular == 0 && this.spawnData.function == 0) ||
      (this.startSharedMemory.linear == 0 && this.spawnData.function == 1)
    ) {
      this.despawn = true;
      return;
    }
    if (this.spawnData.function == 0) {
      particle.effects.destroy(this.startSharedMemory.circular);
      this.startSharedMemory.circular = 0;
    }
    if (this.spawnData.function == 1) {
      particle.effects.destroy(this.startSharedMemory.linear);
      this.startSharedMemory.linear = 0;
    }
  }
  get startSharedMemory() {
    return archetypes.NormalSlideStartNote.sharedMemory.get(
      this.spawnData.startRef,
    );
  }
}
