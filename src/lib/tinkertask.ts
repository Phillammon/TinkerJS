import { Item } from "data-of-loathing";
import { gameData } from "kol.js";

import { Task } from "./types.js";

const methods = ["cook", "smith", "cocktail"];

export const Tinker: Task = {
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
    } else {
      const quantity = Math.min(...receivedItems.map((item) => item[1]));
      let creationResult = null;

      for (let method of methods) {
        const result = await client.fetchText("craft.php", {
          method: "POST",
          query: {
            mode: method,
            action: "craft",
            qty: quantity,
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
          console.log(`Sending created item(s) to ${firstMail?.who?.name}`);
          await client.kmail.send(
            firstMail?.who.id as number,
            `Tinkering yielded: ${quantity} ${quantity === 1 ? createdItem.name : (createdItem.plural ?? createdItem.name)}\n\nThis used ${quantity} of your daily free crafts.\n\nThank you for tinkering!`,
            {
              items: new Map([[createdItem, quantity]]),
            },
          );
          await client.kmail.delete([firstMail?.id || 0]);
          return true;
        }
      }
    }
    console.log(`Tinkering failed`);
    console.log(`Returning items to ${firstMail?.who?.name}`);
    await client.kmail.send(
      firstMail?.who.id as number,
      `I'm sorry, I couldn't figure out what to do with those items.\n\nThis has not consumed any of your daily free crafts.\n\nThank you for tinkering!`,
      {
        items: new Map(receivedItems),
      },
    );

    await client.kmail.delete([firstMail?.id || 0]);
    return false;
  },
};
