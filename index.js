import { nanoid } from "nanoid";

export class Request {
  constructor(channel, options = {}) {
    this.channel = channel;
    this.correlationCache = new Map();
    this.timeout = options.timeout || 10000;
  }

  send(message) {
    return new Promise((resolve, reject) => {
      const correlationId = nanoid();
      const timeoutId = setTimeout(() => {
        this.correlationCache.delete(correlationId);
        reject(new Error("Timeout exceeded"));
      }, this.timeout);

      this.correlationCache.set(correlationId, (message) => {
        clearTimeout(timeoutId);
        this.correlationCache.delete(correlationId);
        resolve(message);
      });

      this.channel.send({
        id: correlationId,
        data: message,
        type: "request",
      });

      this.channel.on("message", (msg) => {
        const callback = this.correlationCache.get(msg.inReplyTo);
        callback && callback(msg.data);
      });
    });
  }
}


export class Reply {
  constructor(channel) {
    this.channel = channel;
  }

  onMessage(cb) {
    this.channel.on("message", async (msg) => {
      if (msg.type !== "request") {
        return;
      }

      const response = await cb(msg.data);

      this.channel.send({
        inReplyTo: msg.id,
        data: response,
        type: "response",
      });
    });
  }
}
