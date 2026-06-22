import { Item } from "data-of-loathing";
import { gameData } from "kol.js";

export class RelevantItems {
  public loaded: boolean;
  private _CHALK?: Item | undefined;
  public get CHALK(): Item {
    if (!this.loaded || !this._CHALK) {
      throw "Relevant items not loaded";
    }
    return this._CHALK;
  }
  private _GUMSTRING?: Item;
  public get GUMSTRING(): Item {
    if (!this.loaded || !this._GUMSTRING) {
      throw "Relevant items not loaded";
    }
    return this._GUMSTRING;
  }
  private _TRINKETS?: Item[];
  public get TRINKETS(): Item[] {
    if (!this.loaded || !this._TRINKETS) {
      throw "Relevant items not loaded";
    }
    return this._TRINKETS;
  }
  private _CLOVER?: Item;
  public get CLOVER(): Item {
    if (!this.loaded || !this._CLOVER) {
      throw "Relevant items not loaded";
    }
    return this._CLOVER;
  }
  private _PICKLEDEGG?: Item;
  public get PICKLEDEGG(): Item {
    if (!this.loaded || !this._PICKLEDEGG) {
      throw "Relevant items not loaded";
    }
    return this._PICKLEDEGG;
  }
  private _SEVENTEENBALL?: Item;
  public get SEVENTEENBALL(): Item {
    if (!this.loaded || !this._SEVENTEENBALL) {
      throw "Relevant items not loaded";
    }
    return this._SEVENTEENBALL;
  }
  private _PACKAGES?: Item[];
  public get PACKAGES(): Item[] {
    if (!this.loaded || !this._PACKAGES) {
      throw "Relevant items not loaded";
    }
    return this._PACKAGES;
  }

  constructor() {
    this.loaded = false;
  }

  public async load(): Promise<void> {
    this.loaded = true;
    this._CHALK = (await gameData.findItemById(1794)) as Item;
    this._GUMSTRING = (await gameData.findItemById(23)) as Item;
    this._TRINKETS = [
      (await gameData.findItemById(43)) as Item,
      (await gameData.findItemById(44)) as Item,
      (await gameData.findItemById(45)) as Item,
    ];
    this._CLOVER = (await gameData.findItemById(10881)) as Item;
    this._PICKLEDEGG = (await gameData.findItemById(7032)) as Item;
    this._SEVENTEENBALL = (await gameData.findItemById(2097)) as Item;
    this._PACKAGES = [
      (await gameData.findItemById(1167)) as Item,
      (await gameData.findItemById(1168)) as Item,
      (await gameData.findItemById(1169)) as Item,
      (await gameData.findItemById(1170)) as Item,
      (await gameData.findItemById(1171)) as Item,
      (await gameData.findItemById(1172)) as Item,
      (await gameData.findItemById(1173)) as Item,
      (await gameData.findItemById(1174)) as Item,
      (await gameData.findItemById(1175)) as Item,
      (await gameData.findItemById(1176)) as Item,
      (await gameData.findItemById(1177)) as Item,
      (await gameData.findItemById(1460)) as Item, // Valentines Box
      // (await gameData.findItemById(5434)) as Item, // DNOTC Box
    ];
  }
}

export const relevantItems = new RelevantItems();

export const loadRelevantItems: () => Promise<void> = async () => {
  await relevantItems.load();
};
