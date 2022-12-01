# poker-db

A Poker DB with info about who you are currently playing using local saved logs

## Wipe DB

mysql -h localhost -u root -p poker_db
DELETE FROM table_name;

## Next 22-12-01

All done from previous next

- Fix bug where all player stats overwrites previous stats
- Whole poll should be an async???
- Set timeout could get messy since the whole first poll seems to take some time
- Then the polling timeout can be a lot less

## Next 22-11-30

Sending everything to FE!

- Handle which table to listen to via Context
- Do that during the first poll
- Always check all files???
- Add completed bool to hand_histories table to quickly discard file
- Check last updated time vs HandHistory file object last updated time

### Next 22-10-26

HAND HISTORY filename / last_updated / last_hand_id_added /

Check each HH file in the beginning. If last_updated > file.last_updated

Use last_hand_id_added - to limit the amount of new hands counted

### Next 22-11-01

- F:R JOBBIGT MED { NLH: { TOURNAMENT: { ... STATS ... }}}
  Kor export type GameId = "NLHE_TOURNAMENT" | "PLO_CASH";
  Istallet. Borde gora det lite enklare?

### Next 2022-11-24

- Show a table "currently playing"
  - Send last hand played from a hand history file
  -

### Next 22-10-20

- Save to database
  - Table Player
    - Per player save json object
  - Table HandHistories
    - Save first 2 Values below
    - HH20221002 T3480263564 No Limit Hold'em $0,44 + $0,06.txt
    - HH20221006 Hercules - $0,01-$0,02 - USD No Limit Hold'em
- Calculate if a table is Active
  - Poll at beginning save current files
  -
  -
-

- Per HandHistory file create players
- When there are players there send in the player list and create new for new players
-
- How to know that a tournament is finished
  - Check the tournament summary if the tournament is finished
  - Check if there are more hands than the latest hand saved in DB
- Loop all hands in all files
  - When some are already saved
- For each player played save the hand
- What?

## TODO

- Use typescript types that are shared when sending/receiving messages
- Scan log folder for new tournaments
- Important stats (PER PLAYER!)
  - Amount of hands together
  - Raise before flop
  - Limps?
  - % of hands at which table type (6 hand 9 hand)
  - % of hands at type of game (NLH/PLO etc)
  - After flop aggression?
  - Seen flops/turns/rivers
- Add notes on player
- Add type to players
-
