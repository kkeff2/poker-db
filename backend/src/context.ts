import { Hand } from "poker-db-shared/types";

type Table = {
  id: string;
  lastHand?: Hand;
};
export class Context {
  public sendCurrentTables: boolean = false;
  public activeTables: Table[] = [];
  public inactiveTablesIds: string[] = [];

  public setSendCurrentTables(sendCurrentTables: boolean) {
    this.sendCurrentTables = sendCurrentTables;
  }

  public setActiveTable(newActiveTable: Table) {
    const currentActiveTable = this.activeTables.find(
      (t) => t.id === newActiveTable.id
    );
    if (!currentActiveTable) {
      this.activeTables.push(newActiveTable);
    } else if (Boolean(newActiveTable.lastHand)) {
      const newActiveTables = this.activeTables.map(({ id, lastHand }) => {
        if (
          id === newActiveTable.id &&
          lastHand?.handId !== newActiveTable.lastHand?.handId
        ) {
          return { id, lastHand: newActiveTable.lastHand };
        }
        return { id, lastHand };
      });
      this.activeTables = newActiveTables;
    }
  }

  public getActiveTable(id: string) {
    const table = this.activeTables.find((t) => t.id === id);
    if (!table) {
      throw Error("getActiveTable could not find table");
    }
    return table;
  }

  public setInactiveTable(inactiveTable: string) {
    if (!this.inactiveTablesIds.includes(inactiveTable)) {
      this.inactiveTablesIds.push(inactiveTable);
    }
  }
}
