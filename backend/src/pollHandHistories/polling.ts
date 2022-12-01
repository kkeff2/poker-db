import { differenceInMinutes } from "date-fns";
import fs from "fs";
import path from "path";
import { Hand } from "poker-db-shared/types";
import { config } from "../constants";
import { Context } from "../context";
import { getPlayerStats, IPlayerStats } from "../database/integration";
import { sendMessage } from "../webSocket.ts/ws";
import { handleFile } from "./handHistory";

const minutesUntilInactiveTable = 38000;

const setPolling = (context: Context) => {
  setTimeout(() => {
    pollNewFiles(context);
    setPolling(context);
  }, 5000);
};

export const initHandHistoryPoll = (context: Context) => {
  setPolling(context);
};

const isActiveTable = (fileLastModified: Date) => {
  const minutesDifference = differenceInMinutes(new Date(), fileLastModified);
  return minutesUntilInactiveTable > minutesDifference;
};

const setCurrentActiveTables = ({
  context,
  fileLastModified,
  fileName,
}: {
  context: Context;
  fileLastModified: Date;
  fileName: string;
}) => {
  if (isActiveTable(fileLastModified)) {
    context.setActiveTable({ id: fileName });
  } else {
    context.setInactiveTable(fileName);
  }
};

const createResponse = (lastHand: Hand, playerStats: IPlayerStats[]) => {
  return {
    hand: lastHand,
    playerStats: playerStats.map((ps) => {
      const stats = ps.data[lastHand.gameId];
      if (!stats) {
        throw Error("Stats could not be found on user");
      }
      return {
        playerId: ps.player_id,
        stats,
      };
    }),
  };
};

const sendTableMessage = async ({ context }: { context: Context }) => {
  const { sendCurrentTables, activeTables } = context;
  if (sendCurrentTables && activeTables.length) {
    console.log({ activeTables });
    const currentTableResponse = await Promise.all(
      activeTables.map(async ({ lastHand }) => {
        if (!lastHand) throw Error("Active table has no last hand");
        const tablePlayerIds = lastHand.players.map((p) => p.id);
        const playerStats = await getPlayerStats(tablePlayerIds);
        return createResponse(lastHand, playerStats);
      })
    );
    sendMessage({
      type: "CURRENT_TABLE_UPDATED",
      response: currentTableResponse,
    });
  }
};

const pollNewFiles = async (context: Context) => {
  const files = fs.readdirSync(config.pathToHandHistoryLogs);
  let hasUpdatesToSend = false;
  // const activeFiles = files.filter()
  for (var i = 0; i < files.length; i++) {
    const fullPath = path.join(config.pathToHandHistoryLogs, files[i]);
    const fileLastModified = await getFileLastModified(fullPath);
    const fileName = files[i];
    setCurrentActiveTables({ context, fileLastModified, fileName });
    if (context.inactiveTablesIds.includes(fileName)) {
      continue;
    }

    const fileData = await getFileData(fullPath);
    const hasBeenHandled = await handleFile({ fileData, fileName, context });
    if (hasBeenHandled) {
      hasUpdatesToSend = true;
    }
  }
  console.log({ hasUpdatesToSend, time: new Date().toISOString() });
  if (hasUpdatesToSend) {
    await sendTableMessage({ context });
  }
};

const getFileData = (fullPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(fullPath, "utf8", async (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

const getFileLastModified = (fullPath: string): Promise<Date> => {
  return new Promise((resolve, reject) => {
    fs.stat(fullPath, (error, stats) => {
      if (error) {
        reject(error);
      }
      resolve(stats.mtime);
    });
  });
};
