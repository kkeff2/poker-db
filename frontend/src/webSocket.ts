export const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => {
  ws.send("OPENED");
};

ws.onmessage = (event) => {
  console.log("in the web", event);
  const json = JSON.parse(event.data);
  console.log(json);
};
