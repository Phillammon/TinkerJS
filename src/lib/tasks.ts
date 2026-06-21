import { config } from "./config.js";
import { Task } from "./types.js";
import { Tinker } from "./tinkertask.js";

const GetWorthless: Task = {
  name: "Get Worthless Trinkets",
  done: async (client, items) => {
    return (
      ((await client.inventory.get()).get(items.TRINKET) ?? 0) +
        ((await client.inventory.get()).get(items.KNICKNACK) ?? 0) +
        ((await client.inventory.get()).get(items.GEWGAW) ?? 0) >=
      3
    );
  },
  execute: async (client, items) => {
    await client.fetchText("shop.php", {
      method: "GET",
      query: {
        whichshop: "generalstore",
        action: "buyitem",
        quantity: 1,
        whichrow: 648,
      },
    });
    await client.fetchText("inv_use.php", {
      method: "GET",
      query: {
        which: 3,
        whichitem: 23,
      },
    });
    return true;
  },
};

const GetClovers: Task = {
  name: "Get 11-leaf Clovers",
  done: async (client) => {
    const hermitText = await client.fetchText("hermit.php", {
      method: "GET",
    });
    return hermitText.includes("out of stock for today");
  },
  execute: async (client) => {
    await client.fetchText("hermit.php", {
      method: "POST",
      query: {
        action: "trade",
        whichitem: "10881",
        quantity: "1",
      },
    });
    return true;
  },
};

const StockClovers: Task = {
  name: "Stock clovers in mall",
  done: async (client, items) => {
    return !(await client.inventory.get()).get(items.CLOVER);
  },
  execute: async (client) => {
    await client.fetchText("backoffice.php", {
      method: "GET",
      query: {
        itemid: "10881",
        quantity: "*",
        price: "30000",
        limit: "",
        action: "additem",
        neveragain: 0,
        priceok: 0,
      },
    });
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
  name: "Drink Nightcap and Clean Up",
  done: async (client) => {
    return client.inebriety > 14;
  },
  execute: async (client, items, state) => {
    await client.fetchText("cafe.php", {
      method: "POST",
      query: {
        cafeid: "2",
        action: "CONSUME!",
        whichitem: "-3",
      },
    });
    state.rollover();
    if (
      config.OPERATOR_ID &&
      (await client.inventory.get()).get(items.SEVENTEENBALL)
    ) {
      client.kmail.send(
        config.OPERATOR_ID,
        "Seventeen-Ball Found\nSeventeen-Ball Found\nSeventeen-Ball Found\nSeventeen-Ball Found\nSeventeen-Ball Found\nSeventeen-Ball Found",
      );
      client.closet.deposit(items.SEVENTEENBALL, 1);
    }
    await client.fetchText("inv_use.php", {
      query: {
        which: "3",
        whichitem: "10917",
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
