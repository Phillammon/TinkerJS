import * as fs from "fs";

export class TinkerState {
  todayMap: Map<number, number>;
  bankedMap: Map<number, number>;
  craftsFile: string;

  constructor(craftsFile: string) {
    this.todayMap = new Map();
    this.bankedMap = new Map();
    this.craftsFile = craftsFile;
    this.load();
  }

  public rollover(): void {
    this.todayMap.clear();
    this.save();
  }

  public load(): void {
    this.bankedMap.clear();
    if (fs.existsSync(this.craftsFile)) {
      const crafts = JSON.parse(fs.readFileSync(this.craftsFile, "utf8"));
      this.bankedMap = new Map(
        Object.entries(crafts.banked).map((entry) => [
          parseInt(entry[0]),
          entry[1] as number,
        ]),
      );
      this.todayMap = new Map(
        Object.entries(crafts.daily).map((entry) => [
          parseInt(entry[0]),
          entry[1] as number,
        ]),
      );
    }
  }

  public save(): void {
    fs.writeFileSync(
      this.craftsFile,
      JSON.stringify(
        {
          daily: Object.fromEntries(this.todayMap.entries()),
          banked: Object.fromEntries(this.bankedMap.entries()),
        },
        null,
        2,
      ),
      "utf8",
    );
  }
}
