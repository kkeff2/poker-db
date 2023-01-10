import fs from "fs";
import path from "path";

import { Hand, PlayerId, PlayerStats } from "poker-db-shared/types";
import { config } from "../constants";
import { HandHistoryContext } from "../context/context";
import {
  updateHandHistoryDb,
  updatePlayerStats,
} from "../database/integration";
import { parseHand } from "../hand";
import { getStatsAggregatedOnPlayers, playerStatsUpdated } from "./playerStats";

const getHands = (fileData: string, fileName: string) => {
  const rawHands = fileData.split("\n\n\n\n");
  const rawHandsList = rawHands.filter((hand) => hand.split("\n").length != 1);
  return rawHandsList.map((rawHand) => parseHand(rawHand, fileName));
};

const getLastHand = (hands: Hand[], { lastHand }: HandHistoryContext) => {
  if (hands.length) {
    return hands[hands.length - 1];
  } else if (!lastHand) {
    // TODO: thrown on new table
    throw Error("No last hand");
  } else {
    return lastHand;
  }
};

const handleDatabaseUpdate = async ({
  history,
  hands,
}: {
  history: HandHistoryContext;
  hands: Hand[];
}) => {
  const handHistoryUpdate = {
    id: history.id,
    lastHand: getLastHand(hands, history),
    lastUpdated: history.lastUpdated,
  };
  if (!hands.length) {
    await updateHandHistoryDb(handHistoryUpdate);
  } else {
    const playerStats: Record<PlayerId, PlayerStats> =
      getStatsAggregatedOnPlayers(hands);

    const playersUpdateOpts = await playerStatsUpdated(playerStats);

    await updatePlayerStats({
      playersUpdate: playersUpdateOpts,
      handHistory: handHistoryUpdate,
    });
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

export const handleHandHistoryUpdate = async (history: HandHistoryContext) => {
  const fullPath = getFullPath(history.id);
  const fileData = await getFileData(fullPath);
  const hands = getHands(fileData, history.id);

  if (!hands.length) {
    return;
  }

  const indexOfLastAddedHand = hands.findIndex(
    (h) => h.handId === history.lastHand?.handId
  );
  const handsToUpdate = hands.filter(
    (_hand, index) => index > indexOfLastAddedHand
  );

  // We have already a check for this in context
  // If there is no hand to add we should still update DB with correct ISO time of last update
  // That way there is no unness update

  await handleDatabaseUpdate({ hands: handsToUpdate, history });
};

export const getFileLastModified = (fullPath: string): Promise<Date> => {
  return new Promise((resolve, reject) => {
    fs.stat(fullPath, (error, stats) => {
      if (error) {
        reject(error);
      }
      resolve(stats.mtime);
    });
  });
};

export const getFullPath = (fileName: string) =>
  path.join(config.pathToHandHistoryLogs, fileName);
