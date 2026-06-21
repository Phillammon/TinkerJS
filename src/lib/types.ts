import { Client } from "kol.js";
import { TinkerState } from "./state.js";
import { Item } from "data-of-loathing";

export type RelevantItems = {
  CHALK: Item;
  GUMSTRING: Item;
  TRINKET: Item;
  GEWGAW: Item;
  KNICKNACK: Item;
  CLOVER: Item;
  PICKLEDEGG: Item;
  SEVENTEENBALL: Item;
};

export type Task = {
  name: string;
  done: (
    client: Client,
    items: RelevantItems,
    state: TinkerState,
  ) => Promise<boolean>;
  execute: (
    client: Client,
    items: RelevantItems,
    state: TinkerState,
  ) => Promise<boolean>;
};
