export class TinkerState {
  todayMap: Map<number, number>;
  bankedMap: Map<number, number>;
  bankedCraftFile: string;

  constructor(bankedCraftFile: string) {
    this.todayMap = new Map();
    this.bankedMap = new Map();
    this.bankedCraftFile = bankedCraftFile;
    this.load();
  }

  public rollover(): void {
    this.todayMap.clear();
  }

  public load(): void {
    this.bankedMap.clear();
  }

  public save(): void {}
}
