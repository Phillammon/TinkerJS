import { Client } from "kol.js";

import { config } from "./lib/config.js";
import { loadRelevantItems } from "./lib/items.js";
import { TinkerTasks } from "./lib/tasks.js";
import { TinkerState } from "./lib/state.js";

const kolClient = new Client(config.KOL_USER, config.KOL_PASS);
await kolClient.login();
await kolClient.loadGameData();
const items = await loadRelevantItems();
let state: TinkerState = {};

const runTinker = async () => {
  while (true) {
    if (kolClient.isRollover()) {
      console.log("It's rollover! Waiting for ending");
      await kolClient.waitForRolloverEnd();
      await kolClient.login();
    }
    console.log("Refreshing data.");
    await kolClient.checkLoggedIn();
    await kolClient.inventory.get.refresh();

    let attemptedTask = false;
    for (let task of TinkerTasks) {
      if (!(await task.done(kolClient, items, state))) {
        console.log(`Executing task: ${task.name}`);
        attemptedTask = true;
        try {
          const result = await task.execute(kolClient, items, state);
          console.log(
            result ? "Task execution succeeded" : "Task execution failed",
          );
        } catch (e) {
          `Task execution failed with exception: ${e}`;
        }
        break;
      }
    }

    if (!attemptedTask) {
      console.log("No task attempted. Waiting 30 seconds.");
      await new Promise((resolve) => {
        setTimeout(resolve, 30000);
      });
    }
  }
};

await runTinker();
