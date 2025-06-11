import { skin, getZ, layer } from "../skin.js";
import { NormalLayout } from "../../../../../shared/src/engine/data/utils.js";
import { options } from "../../configuration/options.js";

export class ComboLabel extends SpawnableArchetype({
  t: Number,
  i: Number,
}) {
  endTime = this.entityMemory(Number);
  z = this.entityMemory(Number);
  z2 = this.entityMemory(Number);
  entityArray = this.defineSharedMemory({
    value: Number,
    time: Number,
    length: Number,
    start: Number,
    combo: Number,
    Judgment: DataType,
    tail: Number,
    ap: Boolean,
  });
  initialize() {
    this.z = getZ(layer.judgment, -this.spawnData.t, 0);
    this.z2 = getZ(layer.judgment - 1, -this.spawnData.t, 0);
  }
  spawnTime() {
    return timeScaleChanges.at(this.spawnData.t).scaledTime;
  }
  despawnTime() {
    if (
      this.entityArray.get(this.spawnData.i).value !=
      this.entityArray.get(this.entityArray.get(0).tail).value
    )
      return this.entityArray.get(this.entityArray.get(this.spawnData.i).value)
        .time;
    else return 999999;
  }
  updateParallel() {
    const c = this.entityArray.get(this.spawnData.i).combo;
    const h = 0.0425 * ui.configuration.combo.scale;
    const w = h * 3.22 * 6.65;
    const hg = 0.06 * ui.configuration.combo.scale;
    const wg = h * 3.22 * 8;
    const centerX = 5.45;
    const centerY = 0.48;
    const s =
      c == 1
        ? Math.ease(
            "Out",
            "Cubic",
            Math.min(
              1,
              Math.unlerp(this.spawnData.t, this.spawnData.t + 0.066, time.now),
            ),
          )
        : 1;
    const a =
      c == 1
        ? ui.configuration.combo.alpha *
          Math.ease(
            "Out",
            "Cubic",
            Math.min(
              1,
              Math.unlerp(this.spawnData.t, this.spawnData.t + 0.066, time.now),
            ),
          )
        : 1;
    const a2 =
      ui.configuration.combo.alpha *
      0.8 *
      ((Math.cos(time.now * Math.PI) + 1) / 2);
    const layout = NormalLayout({
      l: centerX - (w * s) / 2,
      r: centerX + (w * s) / 2,
      t: centerY - (h * s) / 2,
      b: centerY + (h * s) / 2,
    });
    const glow = NormalLayout({
      l: centerX - (wg * s) / 2,
      r: centerX + (wg * s) / 2,
      t: centerY - (hg * s) / 2,
      b: centerY + (hg * s) / 2,
    });
    if (c == 0) {
    } else if (this.entityArray.get(this.spawnData.i).ap == true || !options.ap)
      skin.sprites.combo.draw(layout, this.z, a);
    else {
      skin.sprites.apCombo.draw(layout, this.z, a);
      skin.sprites.glowCombo.draw(glow, this.z2, a2);
    }
  }
}
