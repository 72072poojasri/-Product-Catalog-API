const redis = require("redis");

const client = redis.createClient({
  url: process.env.REDIS_URL,
});

if (process.env.NODE_ENV !== "test") {
  client.on("connect", () => {
    console.log("Redis connected");
  });

  client.on("error", (err) => {
    console.error("Redis error", err);
  });
}

(async () => {
  if (!client.isOpen) {
    await client.connect();
  }
})();

module.exports = client;