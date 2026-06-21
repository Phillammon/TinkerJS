import { Client } from "kol.js";
import { TinkerState } from "./state.js";

export type Task = {
  name: string;
  done: (client: Client, state: TinkerState) => Promise<boolean>;
  execute: (client: Client, state: TinkerState) => Promise<boolean>;
};
