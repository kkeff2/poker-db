type Table = {
  id: string;
  lastHandId: string;
};
export class Context {
  public sendCurrentTables: boolean = false;
  public activeTables: string[] = [
    "HH20221111 Hungaria - $0,01-$0,02 - USD Pot Limit Omaha.txt",
  ];

  public setSendCurrentTables(sendCurrentTables: boolean) {
    this.sendCurrentTables = sendCurrentTables;
  }
}
