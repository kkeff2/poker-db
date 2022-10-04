import "./App.css";

type Props = {
  ws: WebSocket;
};

export function App({ ws }: Props) {
  ws.onmessage = (event) => {
    console.log("in the web", event);
    // const json = JSON.parse(event.data);
    // console.log(json);
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
