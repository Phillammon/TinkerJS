import { Client, gameData } from "kol.js";
import { Item } from "data-of-loathing";
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

const methods = ["cook", "smith", "cocktail"];

const Tinker: Task = {
  name: "Tinker",
  done: async (client) => {
    return !(await client.kmail.fetch()).length;
  },
  execute: async (client) => {
    const firstMail = (await client.kmail.fetch())[0];
    console.log(`Processing Kmail from ${firstMail?.who.name}`);
    const receivedItems = Array.from(firstMail?.items.entries() || []);
    if (receivedItems.length) {
      console.log(`Detected items:`);
      for (let item of receivedItems) {
        console.log(`- ${item[1]}x ${item[0].name}`);
      }
    }
    if (receivedItems.length !== 2) {
      console.log("I don't know what to do with that many items");
      return false;
    }

    const quantity = Math.min(...receivedItems.map((item) => item[1]));
    let creationResult = null;

    for (let method of methods) {
      const result = await client.fetchText("craft.php", {
        method: "POST",
        query: {
          mode: method,
          action: "craft",
          quantity: quantity,
          a: (receivedItems[0] as [Item, number])[0].id,
          b: (receivedItems[1] as [Item, number])[0].id,
        },
      });
      creationResult = result.match(/descitem\([0-9]+\)/);
      if (creationResult) break;
    }
    if (creationResult) {
      const createdItem = await gameData.findItemByDescId(
        parseInt(creationResult[0].replace(/\D/g, "")),
      );
      if (createdItem) {
        console.log(`Created ${quantity}x ${createdItem.name}`);
        console.log(`Sending back to ${firstMail?.who?.name}`);
        await client.kmail.send(
          firstMail?.who.id as number,
          `Tinkering yielded: ${quantity}x ${createdItem.name}\n\nThis used ${quantity} of your daily free crafts.\n\nThank you for tinkering!`,
          {
            items: new Map([[createdItem, quantity]]),
          },
        );
        await client.kmail.delete([firstMail?.id || 0]);
        return true;
      }
    }

    console.log(`Tinkering failed`);
    console.log(`Sending items to ${firstMail?.who?.name}`);
    await client.kmail.send(
      firstMail?.who.id as number,
      `I'm sorry, I couldn't figure out what to do with those items.\n\nThis has not consumed any of your daily free crafts.\n\nThank you for tinkering!`,
      {
        items: new Map(receivedItems),
      },
    );
    return false;
  },
};

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
