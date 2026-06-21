import { Client } from "kol.js";

import { config } from "./lib/config.js";
import { loadRelevantItems } from "./lib/items.js";
import { TinkerTasks } from "./lib/tasks.js";
import { TinkerState } from "./lib/state.js";

const kolClient = new Client(config.KOL_USER, config.KOL_PASS);
await kolClient.login();
await kolClient.loadGameData();
await loadRelevantItems();
let state = new TinkerState(config.BANKED_CRAFT_FILE);

const runTinker = async () => {
  while (true) {
    if (kolClient.isRollover()) {
      console.log("It's rollover! Waiting for ending");
      await kolClient.waitForRolloverEnd();
      await kolClient.login();
    }
    try {
      if (config.DEBUG) {
        console.log("Refreshing data.");
      }
      await kolClient.checkLoggedIn();
      await kolClient.inventory.get.refresh();
    } catch (e) {
      console.log(`Data refresh failed: ${e}`);
      await new Promise((resolve) => {
        setTimeout(resolve, 30000);
      });
      continue;
    }

    let attemptedTask = false;
    for (let task of TinkerTasks) {
      let taskIsDone = true;
      try {
        taskIsDone = await task.done(kolClient, state);
      } catch (e) {
        console.log(`Status check for task ${task.name} failed: ${e}`);
        break;
      }
      if (!taskIsDone) {
        console.log(`Executing task: ${task.name}`);
        attemptedTask = true;
        try {
          const result = await task.execute(kolClient, state);
          if (!result) {
            console.log(`Execution of task ${task.name} failed`);
          } else if (config.DEBUG) {
            console.log(`Successfully executed task ${task.name}`);
          }
        } catch (e) {
          `Execution of task ${task.name} failed with exception: ${e}`;
        }
        break;
      }
    }

    if (!attemptedTask) {
      if (config.DEBUG) {
        console.log("No task attempted. Waiting 30 seconds.");
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 30000);
      });
    }
  }
};

await runTinker();
