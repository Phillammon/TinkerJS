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
  _GUMSTRING?: Item;
  public get GUMSTRING(): Item {
    if (!this.loaded || !this._GUMSTRING) {
      throw "Relevant items not loaded";
    }
    return this._GUMSTRING;
  }
  _TRINKET?: Item;
  public get TRINKET(): Item {
    if (!this.loaded || !this._TRINKET) {
      throw "Relevant items not loaded";
    }
    return this._TRINKET;
  }
  _GEWGAW?: Item;
  public get GEWGAW(): Item {
    if (!this.loaded || !this._GEWGAW) {
      throw "Relevant items not loaded";
    }
    return this._GEWGAW;
  }
  _KNICKNACK?: Item;
  public get KNICKNACK(): Item {
    if (!this.loaded || !this._KNICKNACK) {
      throw "Relevant items not loaded";
    }
    return this._KNICKNACK;
  }
  _CLOVER?: Item;
  public get CLOVER(): Item {
    if (!this.loaded || !this._CLOVER) {
      throw "Relevant items not loaded";
    }
    return this._CLOVER;
  }
  _PICKLEDEGG?: Item;
  public get PICKLEDEGG(): Item {
    if (!this.loaded || !this._PICKLEDEGG) {
      throw "Relevant items not loaded";
    }
    return this._PICKLEDEGG;
  }
  _SEVENTEENBALL?: Item;
  public get SEVENTEENBALL(): Item {
    if (!this.loaded || !this._SEVENTEENBALL) {
      throw "Relevant items not loaded";
    }
    return this._SEVENTEENBALL;
  }

  constructor() {
    this.loaded = false;
  }

  public async load(): Promise<void> {
    this.loaded = true;
    this._CHALK = (await gameData.findItemById(1794)) as Item;
    this._GUMSTRING = (await gameData.findItemById(23)) as Item;
    this._TRINKET = (await gameData.findItemById(43)) as Item;
    this._GEWGAW = (await gameData.findItemById(44)) as Item;
    this._KNICKNACK = (await gameData.findItemById(45)) as Item;
    this._CLOVER = (await gameData.findItemById(10881)) as Item;
    this._PICKLEDEGG = (await gameData.findItemById(7032)) as Item;
    this._SEVENTEENBALL = (await gameData.findItemById(2097)) as Item;
  }
}

export const relevantItems = new RelevantItems();

export const loadRelevantItems: () => Promise<void> = async () => {
  await relevantItems.load();
};
