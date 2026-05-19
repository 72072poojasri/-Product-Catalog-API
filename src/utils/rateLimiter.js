const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redisClient = require("../../config/redis");

const limiter = rateLimit({
  windowMs:
    (parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS) || 60) * 1000,

  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    error: "Too many requests. Please try again later.",
  },

  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
});

module.exports = limiter;