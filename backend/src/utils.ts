import { config } from "./constants";

export const isBestPlayer = (playerId: string, fileName?: string) => {
  return fileName
    ? removeFileName(playerId, fileName) === config.playerId
    : playerId === config.playerId;
};

export const addFileName = (playerId: string, fileName: string) => {
  return `${playerId}${encodeURI(fileName)}`;
};

export const removeFileName = (playerId: string, fileName: string) => {
  return playerId.replace(encodeURI(fileName), "");
};
