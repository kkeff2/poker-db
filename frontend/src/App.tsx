import { CssBaseline } from "@mui/material";
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { TopBar } from "./components/TopBar";

type Props = {
  children?: ReactNode;
};

export function App({ children }: Props) {
  // const [allPlayerStats, setAllPlayerStats] = useState<any>();
  // const [handHistories, setHandHistories] = useState<any>();

  // useEffect(() => {
  // sendMessage({ type: "GET_ALL_PLAYER_STATS" });
  // sendMessage({ type: "GET_ALL_HAND_HISTORIES" });
  // ws.onmessage = (event: MessageEvent<Messages>) => {
  //   const message = getMessage(event);
  // switch (message.type) {
  //   case "ALL_HAND_HISTORIES":
  //     return setHandHistories(test.data);
  //   case "ALL_PLAYER_STATS":
  //     return setAllPlayerStats(test.data);
  // }
  // if (event === "hej") {
  //   console.log("JAJAJA");
  // }
  // const json = JSON.parse(event.data);
  // console.log(json);
  // };
  // console.log("IN USEEFFECT");
  // ws.send(JSON.stringify({ type: "ALL_PLAYERS" }));
  // }, []);

  return (
    <>
      <CssBaseline />
      <TopBar />
      <Outlet />
      {/* 
      <Router>
        <div>
          {handHistories &&
            handHistories.map((handHistory: any) => (
              <div key={handHistory.filename}>{handHistory.filename}</div>
            ))}
        </div>
        <div>
          {allPlayerStats &&
            allPlayerStats.map((handHistory: any) => (
              <div key={handHistory.filename}>{handHistory.filename}</div>
            ))}
        </div>
      </Router> */}
    </>
  );
}
