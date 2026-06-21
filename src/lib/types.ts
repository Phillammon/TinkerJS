import { Client } from "kol.js";
import { TinkerState } from "./state.js";
import { Item } from "data-of-loathing";

export type RelevantItemsUnloaded = { loaded: false };
export type RelevantItemsLoaded = {
  loaded: true;
  CHALK: Item;
  GUMSTRING: Item;
  TRINKET: Item;
  GEWGAW: Item;
  KNICKNACK: Item;
  CLOVER: Item;
  PICKLEDEGG: Item;
  SEVENTEENBALL: Item;
};
export type RelevantItems = RelevantItemsUnloaded | RelevantItemsLoaded;

export type Task = {
  name: string;
  done: (client: Client, state: TinkerState) => Promise<boolean>;
  execute: (client: Client, state: TinkerState) => Promise<boolean>;
};
