import { Effect, Item } from "data-of-loathing";
import { gameData } from "kol.js";

export class RelevantItemsAndEffects {
  public loaded: boolean;
  private _CHALK?: Item | undefined;
  public get CHALK(): Item {
    return this.getIfLoaded<Item>(this._CHALK);
  }
  private _GUMSTRING?: Item;
  public get GUMSTRING(): Item {
    return this.getIfLoaded<Item>(this._GUMSTRING);
  }
  private _TRINKETS?: Item[];
  public get TRINKETS(): Item[] {
    return this.getIfLoaded<Item[]>(this._TRINKETS);
  }
  private _CLOVER?: Item;
  public get CLOVER(): Item {
    return this.getIfLoaded<Item>(this._CLOVER);
  }
  private _PICKLEDEGG?: Item;
  public get PICKLEDEGG(): Item {
    return this.getIfLoaded<Item>(this._PICKLEDEGG);
  }
  private _SEVENTEENBALL?: Item;
  public get SEVENTEENBALL(): Item {
    return this.getIfLoaded<Item>(this._SEVENTEENBALL);
  }
  private _PACKAGES?: Item[];
  public get PACKAGES(): Item[] {
    return this.getIfLoaded<Item[]>(this._PACKAGES);
  }
  private _CRAFTTEA?: Effect;
  public get CRAFTTEA(): Effect {
    return this.getIfLoaded<Effect>(this._CRAFTTEA);
  }
  private _EMPATHY?: Effect;
  public get EMPATHY(): Effect {
    return this.getIfLoaded<Effect>(this._EMPATHY);
  }
  private _POLKA?: Effect;
  public get POLKA(): Effect {
    return this.getIfLoaded<Effect>(this._POLKA);
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
    this._CRAFTTEA = (await gameData.findEffectByName("Craft Tea")) as Effect;
    this._EMPATHY = (await gameData.findEffectByName("Empathy")) as Effect;
    this._POLKA = (await gameData.findEffectByName(
      "Polka of Plenty",
    )) as Effect;
  }

  private getIfLoaded<T>(variable: T | undefined): T {
    if (!this.loaded || !variable) {
      throw "Relevant items and effects not loaded";
    }
    return variable;
  }
}

export const relevantItemsAndEffects = new RelevantItemsAndEffects();

export const loadRelevantItemsAndEffects: () => Promise<void> = async () => {
  await relevantItemsAndEffects.load();
};
