import { Context, HandHistoryContext } from "../context";
import { sendMessage } from "../webSocket.ts/ws";
import { handleHandHistoryUpdate } from "./handHistory";

const setPolling = async (context: Context) => {
  setTimeout(async () => {
    await context.setHandHistories();

    const handHistoriesToBeUpdated = context.handHistories.filter(
      (h) => h.shouldUpdateDb
    );

    if (handHistoriesToBeUpdated.length) {
      await pollHandHistories(handHistoriesToBeUpdated);
      await context.updateHandHistoriesFromDb();
    }

    // Create new list in Context / Active tables
    // IF Last hand id sent !== lastHandId
    // After sending to FE set lastHandIdSent to is that has been sent
    if (!context.lastSentTables || handHistoriesToBeUpdated.length) {
      await context.setActiveTables();
      sendTableMessage(context);
    }

    // if (context.lastSentTables || !handHistoriesToBeUpdated.length) {
    //   await context.setActiveTables();
    // }

    // if (
    //   context.sendCurrentTables &&
    //   context.activeTables.filter((t) => !t.hasBeenSent).length
    // ) {
    //   sendTableMessage(context);
    // }
    setPolling(context);
  }, 1000);
};

export const initHandHistoryPoll = async (context: Context) => {
  setPolling(context);
};

const sendTableMessage = async (context: Context) => {
  sendMessage({
    type: "CURRENT_TABLE_UPDATED",
    response: context.activeTables,
  });
  await context.onActiveTablesSent();
};

export const pollHandHistories = async (
  handHistoriesToBeUpdated: HandHistoryContext[]
) => {
  for (const h of handHistoriesToBeUpdated) {
    await handleHandHistoryUpdate(h);
  }
};
