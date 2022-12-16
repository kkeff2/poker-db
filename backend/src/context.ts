import { differenceInMinutes } from "date-fns";
import fs from "fs";
import { GameStats, Hand, PlayerId, Table } from "poker-db-shared/types";
import { config } from "./constants";
import { getAllHandHistories, getPlayerStats } from "./database/integration";
import {
  getFileLastModified,
  getFullPath,
} from "./pollHandHistories/handHistory";

export type HandHistoryContext = {
  id: string;
  lastHand?: Hand;
  lastHandSentId?: string;
  shouldUpdateDb: boolean;
  lastUpdated: string;
};

export class Context {
  public sendCurrentTables: boolean = false;
  public handHistories: HandHistoryContext[] = [];
  public activeTables: Table[] = [];
  public lastSentTables?: Table[];

  public async setHandHistories() {
    const files = await getHandHistoryFiles();
    const dbHandHistories = await getAllHandHistories();

    this.handHistories = files.map((f) => {
      const savedHandHistory = dbHandHistories.find(
        (h) => h.hand_history_id === f.id
      );
      return {
        id: f.id,
        lastUpdated: f.lastUpdated,
        shouldUpdateDb: savedHandHistory
          ? f.lastUpdated !== savedHandHistory.last_updated
          : true,
        lastHand: savedHandHistory?.last_hand,
      };
    });
  }

  public async updateHandHistoriesFromDb() {
    const dbHandHistories = await getAllHandHistories();
    this.handHistories = dbHandHistories.map((h) => {
      return {
        id: h.hand_history_id,
        lastHand: h.last_hand,
        lastUpdated: h.last_updated,
        shouldUpdateDb: false,
      };
    });
  }

  // public async updateHandHistory() {
  //   const dbHandHistories = await getAllHandHistories();
  //   this.handHistories = dbHandHistories.map((h) => {
  //     return {
  //       id: h.filename,
  //       lastHand: h.last_hand,
  //       lastUpdated: h.last_updated,
  //       shouldUpdateDb: false,
  //     };
  //   });
  // }

  public getHandHistoryLastHand(id: string) {
    const handHistory = this.handHistories.find((h) => h.id === id);
    if (!handHistory || !handHistory.lastHand) {
      // TODO: THORWN ON NEW TABLE
      throw Error("Hand history not found");
    }
    return handHistory.lastHand;
  }

  public setSendCurrentTables(sendCurrentTables: boolean) {
    this.sendCurrentTables = sendCurrentTables;
  }

  public async setActiveTables() {
    // WHEN changedHistories I know there has been an update. If empty return
    // if (changedHistories && !changedHistories.length) {
    //   return;
    // }
    const files = await getHandHistoryFiles();
    const activeFiles = files
      .filter((f) => isActiveTable(f.lastUpdated))
      .map((f) => f.id);

    this.activeTables = await Promise.all(
      activeFiles.map(async (f) => {
        const currentActiveTable = this.activeTables.find((t) => t.id === f);
        const lastHand = this.getHandHistoryLastHand(f);
        const playerStats = await getPlayerStatsForGame(lastHand);
        return {
          id: f,
          lastHand: lastHand,
          playerStats,
          hasBeenSent: currentActiveTable
            ? currentActiveTable.lastHand === lastHand
            : false,
        };
      })
    );
  }

  public async onActiveTablesSent() {
    this.lastSentTables = this.activeTables;
  }

  public async handleWebSocketConnection() {
    this.lastSentTables = undefined;
    this.activeTables = [];
    this.sendCurrentTables = false;
  }
}

const getPlayerStatsForGame = async (
  lastHand: Hand
): Promise<Record<PlayerId, GameStats>[]> => {
  const playerStats = await getPlayerStats(lastHand.players.map((p) => p.id));
  return playerStats.map((ps) => {
    const stats = ps.data[lastHand.gameId];
    if (!stats) {
      throw Error("Stats could not be found on user");
    }
    return {
      [ps.player_id]: stats,
    };
  });
};

const minutesUntilInactiveTable = 6;

const isActiveTable = (fileLastModified: string) => {
  const minutesDifference = differenceInMinutes(
    new Date(),
    new Date(fileLastModified)
  );
  return minutesUntilInactiveTable > minutesDifference;
};

const getHandHistoryFiles = async () => {
  const files = fs
    .readdirSync(config.pathToHandHistoryLogs)
    .filter((f) => f.endsWith(".txt"));

  return await Promise.all(
    files.map(async (fileName) => {
      const fullPath = getFullPath(fileName);
      const lastUpdated = await getFileLastModified(fullPath);
      return {
        id: fileName,
        lastUpdated: lastUpdated.toISOString(),
      };
    })
  );
};
