import { archetypes } from "."
export class ComboManager extends SpawnableArchetype({
    judgment: Number,
    flick: Boolean,
    accuracy: Number,
    fast: Number,
    late: Number,
}) {
    check = this.entityMemory(Boolean)
    combo = levelMemory(Number)
    endTime = this.entityMemory(Number)
    initialize() {
        this.endTime = 999999
    }
    updateParallel() {
        if (this.check) {
            this.despawn = true
            return
        }
    }
    updateSequential() {
        if (this.check)
            return
        if (this.customCombo.judgment != Judgment.Miss) {
            if (this.spawnData.flick == true) {
                this.customCombo.accuracy = 3
                this.customCombo.accuracyTime = time.now
            }
            else if (this.spawnData.judgment != Judgment.Perfect && this.spawnData.fast > this.spawnData.accuracy) {
                this.customCombo.accuracy = 1
                this.customCombo.accuracyTime = time.now
            }
            else if (this.spawnData.judgment != Judgment.Perfect && this.spawnData.late < this.spawnData.accuracy) {
                this.customCombo.accuracy = 2
                this.customCombo.accuracyTime = time.now
            }
        }
        this.customCombo.time = time.now
        this.customCombo.judgment = this.spawnData.judgment
        if (this.spawnData.judgment != Judgment.Perfect)
            this.customCombo.ap = true
        if (this.spawnData.judgment == Judgment.Good || this.spawnData.judgment == Judgment.Miss)
            this.combo = 0
        else
            this.combo += 1
        this.customCombo.combo = this.combo
        this.check = true
    }
    terminate() {
        this.check = false
    }
    get customCombo() {
        return archetypes.Stage.customCombo.get(0)
    }
}
