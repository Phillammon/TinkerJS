import { Client } from "kol.js";
import { TinkerState } from "./state.js";
import { RelevantItems } from "./items.js";

type Task = {
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

const Tinker: Task = {
  name: "Tinker",
  done: async () => {
    return true;
  },
  execute: async () => {
    return true;
  },
};

const GetWorthless: Task = {
  name: "Get Worthless Trinkets",
  done: async () => {
    return true;
  },
  execute: async () => {
    return true;
  },
};

const GetClovers: Task = {
  name: "Get 11-leaf Clovers",
  done: async () => {
    return true;
  },
  execute: async () => {
    return true;
  },
};

const StockClovers: Task = {
  name: "Stock clovers in mall",
  done: async () => {
    return true;
  },
  execute: async () => {
    return true;
  },
};

const EatEggs: Task = {
  name: "Buy and eat pickled eggs",
  done: async (client) => {
    return client.fullness > 14;
  },
  execute: async (client, items) => {
    await client.fetchText("shop.php", {
      method: "GET",
      query: {
        whichshop: "generalstore",
        action: "buyitem",
        quantity: 1,
        whichrow: 646,
      },
    });
    return (await client.consumption.eat(items.PICKLEDEGG)).success;
  },
};

const DrinkIPA: Task = {
  name: "Drink IPA at Gnomish Microbrewery",
  done: async (client) => {
    return client.inebriety > 13;
  },
  execute: async (client) => {
    await client.fetchText("cafe.php", {
      method: "POST",
      query: {
        cafeid: "2",
        action: "CONSUME!",
        whichitem: "-3",
      },
    });
    return true;
  },
};

const FarmChalk: Task = {
  name: "Farm Chalk in Billiards Room",
  done: async (client) => {
    return client.adventures < 11 || client.inebriety > 14;
  },
  execute: async (client) => {
    const adventureResult = await client.adventure.adventure(391);
    if (!adventureResult.success) return false;
    if (adventureResult?.type === "combat") {
      // run macro
    } else {
      await client.adventure.choice(900, 2);
      await client.adventure.choice(942, 1);
    }
    return true;
  },
};

const Nightcap: Task = {
  name: "Drink Nightcap",
  done: async (client) => {
    return client.inebriety > 14;
  },
  execute: async (client) => {
    await client.fetchText("cafe.php", {
      method: "POST",
      query: {
        cafeid: "2",
        action: "CONSUME!",
        whichitem: "-3",
      },
    });
    return true;
  },
};

export const TinkerTasks = [
  Tinker,
  GetWorthless,
  GetClovers,
  StockClovers,
  EatEggs,
  DrinkIPA,
  FarmChalk,
  Nightcap,
];
