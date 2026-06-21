import { Item } from "data-of-loathing";
import { gameData } from "kol.js";
import { RelevantItems } from "./types.js";

export const loadRelevantItems: () => Promise<RelevantItems> = async () => ({
  CHALK: (await gameData.findItemById(1794)) as Item,
  GUMSTRING: (await gameData.findItemById(23)) as Item,
  TRINKET: (await gameData.findItemById(43)) as Item,
  GEWGAW: (await gameData.findItemById(44)) as Item,
  KNICKNACK: (await gameData.findItemById(45)) as Item,
  CLOVER: (await gameData.findItemById(10881)) as Item,
  PICKLEDEGG: (await gameData.findItemById(7032)) as Item,
  SEVENTEENBALL: (await gameData.findItemById(2097)) as Item,
});
