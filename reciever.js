import { Reply } from "./index.js";

const channel = new Reply(process);

channel.onMessage(
  (data) =>
    new Promise((res) => {
      setTimeout(() => {
        res({ sum: data.a + data.b });
      }, data.delay);
    })
);

process.send("ready");
