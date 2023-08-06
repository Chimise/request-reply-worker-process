import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { fork } from "node:child_process";
import { once } from "node:events";
import { Request } from "./index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const worker = fork(join(__dirname, "reciever.js"));
  const channel = new Request(worker);

  try {
    const [message] = await once(worker, "message");
    console.log(`Child process initialized: ${message}`);

    const p1 = channel.send({ a: 1, b: 2, delay: 500 }).then((res) => {
      console.log(`Reply: 1 + 2 = ${res.sum}`);
    });

    const p2 = channel.send({ a: 6, b: 1, delay: 100 }).then((res) => {
      console.log(`Reply: 6 + 1 = ${res.sum}`);
    });

    await Promise.all([p1, p2]);
  } finally {
    worker.disconnect();
  }
}

main().catch((err) => console.log(err));