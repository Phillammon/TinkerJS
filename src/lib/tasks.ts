import { config } from "./config.js";
import { Task } from "./types.js";
import { Tinker } from "./tinkertask.js";
import { relevantItemsAndEffects } from "./gameconstants.js";
import { Item } from "data-of-loathing";

const DetectRollover: Task = {
  name: "Detect Rollover",
  done: async (client) => {
    return client.inebriety > 0;
  },
  execute: async (client, state) => {
    await client.fetchText("cafe.php", {
      method: "POST",
      query: {
        cafeid: "2",
        action: "CONSUME!",
        whichitem: "-3",
      },
    });
    state.rollover();
    await client.fetchText("inv_use.php", {
      query: {
        method: "GET",
        which: "3",
        whichitem: "10917",
      },
    });
    return true;
  },
};

const ChatBeacon: Task = {
  name: "Announce In Chat",
  done: async (client, state) =>
    state.lastBeacon ===
    Math.floor(Date.now() / (1000 * config.TRADE_BEACON_DELAY)),
  execute: async (client, state) => {
    for (let i = 0; i < 100; i++) {
      await client.chat.macro(`/talkie Spam out chat effects`);
    }
    await client.chat.macro(
      `/trade Let me craft for you! ${config.DAILY_FREE_CRAFTS} turn-taking crafts per day free per player, just send me your crafting components! (I am a bot, contact >>2393910 if I break)`,
    );
    state.lastBeacon = Math.floor(
      Date.now() / (1000 * config.TRADE_BEACON_DELAY),
    );
    return true;
  },
};

const UseChalk: Task = {
  name: "Use Handfuls of Hand Chalk",
  done: async (client) => {
    return (
      (await client.effects.remainingEffectTurns(
        relevantItemsAndEffects.CRAFTTEA,
      )) >= config.CRAFT_TEA_TO_MAINTAIN ||
      ((await client.inventory.get()).get(relevantItemsAndEffects.CHALK) ??
        0) === 0
    );
  },
  execute: async (client) => {
    const chalkToUse = Math.min(
      (await client.inventory.get()).get(relevantItemsAndEffects.CHALK) ?? 0,
      Math.ceil(
        (config.CRAFT_TEA_TO_MAINTAIN -
          (await client.effects.remainingEffectTurns(
            relevantItemsAndEffects.CRAFTTEA,
          ))) /
          69,
      ),
    );
    await client.fetchText("multiuse.php", {
      query: {
        method: "GET",
        quantity: `${chalkToUse}`,
        whichitem: "1794",
        action: "useitem",
      },
    });
    return true;
  },
};

const UpkeepEmpathy: Task = {
  name: "Upkeep Empathy of the Newt",
  done: async (client) => {
    return (
      (await client.effects.remainingEffectTurns(
        relevantItemsAndEffects.EMPATHY,
      )) > 0
    );
  },
  execute: async (client) => {
    await client.fetchText("runskillz.php", {
      method: "GET",
      query: {
        action: "Skillz",
        targetplayer: 0,
        quantity: 10,
        whichskill: 2009,
      },
    });
    return true;
  },
};

const UpkeepPolka: Task = {
  name: "Upkeep Polka of Plenty",
  done: async (client) => {
    return (
      (await client.effects.remainingEffectTurns(
        relevantItemsAndEffects.POLKA,
      )) > 0
    );
  },
  execute: async (client) => {
    await client.chat.macro(`/w Buffy 500 Polka of Plenty`);
    await new Promise((resolve) => {
      setTimeout(resolve, 1000 * config.LOOP_DELAY);
    });
    return true;
  },
};

const OpenGiftPackages: Task = {
  name: "Open Gift Packages",
  done: async (client) => {
    return (
      await Promise.all(
        relevantItemsAndEffects.PACKAGES.map(async (trinket) => {
          return (await client.inventory.get()).get(trinket) ?? 0;
        }),
      )
    ).every((val) => val === 0);
  },
  execute: async (client) => {
    const packages = (
      await Promise.all(
        relevantItemsAndEffects.PACKAGES.map(async (giftpackage) => {
          return [
            giftpackage,
            (await client.inventory.get()).get(giftpackage) ?? 0,
          ];
        }),
      )
    )
      .filter(([giftpackage, quantity]) => (quantity as number) > 0)
      .map(([giftpackage]) => giftpackage);

    for (const giftpackage of packages) {
      await client.fetchText("inv_use.php", {
        method: "GET",
        query: {
          which: 3,
          whichitem: (giftpackage as Item).id,
        },
      });
    }
    return true;
  },
};

const GetWorthless: Task = {
  name: "Get Worthless Trinkets",
  done: async (client) => {
    return (
      await Promise.all(
        relevantItemsAndEffects.TRINKETS.map(async (trinket) => {
          return (await client.inventory.get()).get(trinket) ?? 0;
        }),
      )
    ).every((val) => val > 0);
  },
  execute: async (client) => {
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
  done: async (client) => {
    return !(await client.inventory.get()).get(relevantItemsAndEffects.CLOVER);
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
  execute: async (client) => {
    await client.fetchText("shop.php", {
      method: "GET",
      query: {
        whichshop: "generalstore",
        action: "buyitem",
        quantity: 1,
        whichrow: 646,
      },
    });
    return (await client.consumption.eat(relevantItemsAndEffects.PICKLEDEGG))
      .success;
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

const AlertSeventeen: Task = {
  name: "Alert 17-Ball",
  done: async (client) => {
    return !(await client.inventory.get()).get(
      relevantItemsAndEffects.SEVENTEENBALL,
    );
  },
  execute: async (client) => {
    console.log("FOUND AND CLOSETED 17-BALL");
    if (config.OPERATOR_ID) {
      client.kmail.send(
        config.OPERATOR_ID,
        "Seventeen-Ball Found\nSeventeen-Ball Found\nSeventeen-Ball Found\nSeventeen-Ball Found\nSeventeen-Ball Found\nSeventeen-Ball Found",
      );
    }
    client.closet.deposit(relevantItemsAndEffects.SEVENTEENBALL, 1);
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
  execute: async (client, state) => {
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
  DetectRollover,
  UseChalk,
  OpenGiftPackages,
  Tinker,
  ChatBeacon,
  GetWorthless,
  GetClovers,
  StockClovers,
  EatEggs,
  DrinkIPA,
  AlertSeventeen,
  UpkeepEmpathy,
  UpkeepPolka,
  FarmChalk,
  Nightcap,
];
