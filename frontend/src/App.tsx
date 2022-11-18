import { useEffect, useState } from "react";

type Props = {
  ws: WebSocket;
};

export function App({ ws }: Props) {
  const [allPlayerStats, setAllPlayerStats] = useState<any>();

  useEffect(() => {
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "WEB_SOCKET_CONNECTED" }));
    };
    ws.onmessage = (event) => {
      console.log("ON MESSAGE", event.data);
      let test;
      try {
        test = JSON.parse(event.data.toString());
      } catch (e) {
        console.error(e);
      }

      if (test.type === "ALL_PLAYER_STATS") {
        setAllPlayerStats(test.data);
      }

      // if (event === "hej") {
      //   console.log("JAJAJA");
      // }
      // const json = JSON.parse(event.data);
      // console.log(json);
    };
    // console.log("IN USEEFFECT");
    // ws.send(JSON.stringify({ type: "ALL_PLAYERS" }));
  }, [ws]);

  console.log(allPlayerStats);

  return (
    <div className="App">
      <header className="App-header">HEJ</header>
      <div>
        {allPlayerStats &&
          allPlayerStats.map((stats: any) => (
            <div key={stats.filename}>{stats.filename}</div>
          ))}
      </div>
    </div>
  );
}
