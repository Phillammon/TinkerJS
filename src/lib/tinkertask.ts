import { Item } from "data-of-loathing";
import { Client, gameData, Player } from "kol.js";

import { Task } from "./types.js";
import { KmailMessage } from "kol.js/domains/KmailMailbox";
import { relevantItems } from "./items.js";
import { TinkerState } from "./state.js";
import { config } from "./config.js";

const methods = ["cook", "smith", "cocktail"];

export const Tinker: Task = {
  name: "Tinker",
  done: async (client) => {
    return !(await client.kmail.fetch()).length;
  },
  execute: async (client, state) => {
    const mailToProcess = (await client.kmail.fetch())[0] as KmailMessage;
    const player = (await mailToProcess?.who.fetch()) as Player.Profiled;
    console.log(`Processing Kmail from ${player.name}`);
    const { chalk, otherItems } = extractItemsFromKmail(mailToProcess);
    const chalkResult = await processChalk(player.id, chalk, client, state);

    const craftResult = await attemptCrafting(
      player.id,
      otherItems,
      client,
      state,
    );

    const chalkMessage = chalkResult.chalkUsed
      ? `Detected ${chalkResult.chalkUsed} handful${chalkResult.chalkUsed === 1 ? "" : "s"} of hand chalk. ${chalkResult.craftsAdded} crafts were added to your banked crafts pool.`
      : null;
    const craftMessage = `${craftResult.result}\n\n${craftResult.craftsSuccessful ? `This cost ${craftResult.dailyCraftsSpent} of your daily crafts${craftResult.craftsSuccessful > craftResult.dailyCraftsSpent ? ` and ${craftResult.craftsSuccessful - craftResult.dailyCraftsSpent} of your banked crafts` : ""}.` : "This did not cost any of your daily or banked crafts."}`;
    const remainingMessage = `You currently have ${craftResult.remainingDaily} daily craft${craftResult.remainingDaily === 1 ? "" : "s"} and ${craftResult.remainingBanked} banked craft${craftResult.remainingBanked === 1 ? "" : "s"} available.`;

    await client.kmail.delete([mailToProcess.id]);

    if (player.inHardcore || player.inRonin) {
      const yieldMessage = craftResult.yieldedItems.reduce(
        (acc, curr) => `${acc}\n- ${curr[1]}x ${(curr[0] as Item).name}`,
        "As you are in Ronin or Hardcore, you will recieve the following back in gift packages:",
      );
      await client.kmail.send(
        player.id,
        `${chalkMessage ? `${chalkMessage}\n\n` : ""}${craftMessage}\n\n${craftResult.yieldedItems.length ? `${yieldMessage}\n\n` : ""}${remainingMessage}\n\nThank you for tinkering. Have a nice day!`,
      );
      for (let [item, quantity] of craftResult.yieldedItems) {
        await client.fetchText("town_sendgift.php", {
          method: "POST",
          query: {
            towho: player.id,
            note: `This package contains: ${quantity}x ${item.name}`,
            insidenote: "Thank you for tinkering!",
            whichpackage: 1,
            fromwhere: 0,
            howmany1: quantity,
            whichitem1: item.id,
            action: "Yep.",
          },
        });
      }
    } else {
      await client.kmail.send(
        player.id,
        `${chalkMessage ? `${chalkMessage}\n\n` : ""}${craftMessage}\n\n${remainingMessage}\n\nThank you for tinkering. Have a nice day!`,
        {
          items: new Map(craftResult.yieldedItems),
        },
      );
    }

    return true;
  },
};

const extractItemsFromKmail: (kmail: KmailMessage) => {
  chalk: number;
  otherItems: [Item, number][];
} = (kmail: KmailMessage) => {
  const chalkCount = kmail.items.get(relevantItems.CHALK);
  const items = Array.from(kmail.items.entries() || []).filter(
    ([item]) =>
      ![relevantItems.CHALK, ...relevantItems.PACKAGES].includes(item),
  );
  return { chalk: chalkCount ?? 0, otherItems: items };
};

const processChalk: (
  id: number,
  chalk: number,
  client: Client,
  state: TinkerState,
) => Promise<{
  chalkUsed: number;
  craftsAdded: number;
  bankedCrafts: number;
}> = async (id, chalk, client, state) => {
  await client.fetchText("multiuse.php", {
    query: {
      method: "GET",
      action: "useitem",
      whichitem: relevantItems.CHALK.id,
      quantity: chalk,
    },
  });
  const newCrafts =
    (state.bankedMap.get(id) ?? 0) + config.CRAFTS_PER_CHALK * chalk;
  state.bankedMap.set(id, newCrafts);
  state.save();
  return {
    chalkUsed: chalk,
    craftsAdded: chalk * config.CRAFTS_PER_CHALK,
    bankedCrafts: newCrafts,
  };
};

const attemptCrafting: (
  id: number,
  items: [Item, number][],
  client: Client,
  state: TinkerState,
) => Promise<{
  result: string;
  craftsAttempted: number;
  craftsSuccessful: number;
  yieldedItems: [Item, number][];
  remainingDaily: number;
  remainingBanked: number;
  dailyCraftsSpent: number;
}> = async (id, items, client, state) => {
  if (items.length) {
    console.log(`Detected items:`);
    for (let item of items) {
      console.log(`- ${item[1]}x ${item[0].name}`);
    }
  }
  if (items.length > 2 || items.length === 0) {
    return {
      result:
        "I don't know what to do with that many crafting components, sorry.",
      craftsAttempted: 0,
      craftsSuccessful: 0,
      yieldedItems: items,
      remainingBanked: state.bankedMap.get(id) ?? 0,
      remainingDaily: state.todayMap.get(id) ?? 100,
      dailyCraftsSpent: 0,
    };
  } else {
    let components = items.map(([item]) => item);
    let componentQuantity = Math.min(...items.map(([_item, count]) => count));
    let availableCrafts =
      (state.todayMap.get(id) ?? config.DAILY_FREE_CRAFTS) +
      (state.bankedMap.get(id) ?? 0);
    if (components.length === 1) {
      components = [components[0] as Item, components[0] as Item];
      componentQuantity = Math.floor(componentQuantity / 2);
    }
    if (availableCrafts === 0) {
      return {
        result: `I detected crafting components, but you've used all your daily free crafts, and don't have any banked crafts left. You are granted ${config.CRAFTS_PER_CHALK} banked crafts for every handful of hand chalk you send me- you would need to send ${Math.ceil(componentQuantity / config.CRAFTS_PER_CHALK)} handful${componentQuantity > config.CRAFTS_PER_CHALK ? "s" : ""} of hand chalk to complete this crafting operation, or wait until tomorrow.`,
        craftsAttempted: 0,
        craftsSuccessful: 0,
        yieldedItems: items,
        remainingBanked: state.bankedMap.get(id) ?? 0,
        remainingDaily: state.todayMap.get(id) ?? config.DAILY_FREE_CRAFTS,
        dailyCraftsSpent: 0,
      };
    }
    const craftsToAttempt = Math.min(componentQuantity, availableCrafts);
    let creationResult = null;

    for (let method of methods) {
      const result = await client.fetchText("craft.php", {
        method: "POST",
        query: {
          mode: method,
          action: "craft",
          qty: craftsToAttempt,
          a: (components[0] as Item).id,
          b: (components[1] as Item).id,
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
        const attemptedCrafts = componentQuantity;
        const successfulCrafts = craftsToAttempt;
        const dailyCraftsSpent = Math.min(
          state.todayMap.get(id) ?? config.DAILY_FREE_CRAFTS,
          successfulCrafts,
        );
        const bankedCraftsSpent = successfulCrafts - dailyCraftsSpent;
        state.todayMap.set(
          id,
          (state.todayMap.get(id) ?? config.DAILY_FREE_CRAFTS) -
            dailyCraftsSpent,
        );
        state.bankedMap.set(
          id,
          (state.bankedMap.get(id) ?? 0) - bankedCraftsSpent,
        );
        state.save();
        const itemsToReturn = items
          .map(([item, count]) => [
            item,
            count -
              (items.length === 1 ? successfulCrafts * 2 : successfulCrafts),
          ])
          .filter(([_item, count]) => (count as number) > 0);
        let message = "";
        if (createdItem.tradeable) {
          itemsToReturn.push([createdItem, successfulCrafts]);
          if (successfulCrafts === attemptedCrafts) {
            message = `Successfully crafted ${successfulCrafts}x ${successfulCrafts > 1 ? (createdItem.plural ?? createdItem.name) : createdItem.name}`;
          } else {
            const neededChalk = Math.ceil(
              (attemptedCrafts - successfulCrafts) / config.CRAFTS_PER_CHALK,
            );
            message = `I tried to craft ${attemptedCrafts}x ${attemptedCrafts > 1 ? (createdItem.plural ?? createdItem.name) : createdItem.name}, but you only have ${successfulCrafts} craft${successfulCrafts > 1 ? "s" : ""} left for today. To craft the rest, either send ${neededChalk} handful${neededChalk > 1 ? "s" : ""} of hand chalk along with the rest of the components, or wait for tomorrow.`;
          }
        } else {
          message = `I successfully crafted ${successfulCrafts}x ${createdItem.name}, but those aren't tradeable, so I can't send them back. Sorry.`;
        }
        return {
          result: message,
          craftsAttempted: attemptedCrafts,
          craftsSuccessful: successfulCrafts,
          yieldedItems: itemsToReturn as [Item, number][],
          remainingBanked: state.bankedMap.get(id) ?? 0,
          remainingDaily: state.todayMap.get(id) ?? config.DAILY_FREE_CRAFTS,
          dailyCraftsSpent: dailyCraftsSpent,
        };
      }
    } else {
      return {
        result:
          items.length === 1
            ? `I tried crafting your ${components[0]?.name} with itself, but it didn't craft into anything.`
            : `I tried crafting your ${components[0]?.name} and ${components[1]?.name} together, but they didn't craft into anything.`,
        craftsAttempted: 0,
        craftsSuccessful: 0,
        yieldedItems: items,
        remainingBanked: state.bankedMap.get(id) ?? 0,
        remainingDaily: state.todayMap.get(id) ?? config.DAILY_FREE_CRAFTS,
        dailyCraftsSpent: 0,
      };
    }
  }

  return {
    result:
      "Tinker made no attempt to determine what you were trying to craft because this is a test",
    craftsAttempted: 0,
    craftsSuccessful: 0,
    yieldedItems: items,
    remainingBanked: state.bankedMap.get(id) ?? 0,
    remainingDaily: state.todayMap.get(id) ?? 100,
    dailyCraftsSpent: 0,
  };
};
