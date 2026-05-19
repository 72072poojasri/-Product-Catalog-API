require("dotenv").config();

const express = require("express");
const pool = require("../config/db");
const redisClient = require("../config/redis");

const productController = require("./controllers/productController");
const rateLimiter = require("./utils/rateLimiter");
const errorHandler = require("./utils/errorHandler");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../config/swagger");

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());
app.use(rateLimiter);

/* ---------- HEALTH ---------- */
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "OK",
      db: "connected",
    });
  } catch (err) {
    res.status(500).json({
      status: "ERROR",
      db: "not connected",
    });
  }
});

/* ---------- ROUTES ---------- */
app.post("/api/v1/products", productController.createProduct);

app.get("/api/v1/products", productController.getProducts);

app.get(
  "/api/v1/products/:productId",
  productController.getProductById
);

app.put(
  "/api/v1/products/:productId",
  productController.updateProduct
);

app.delete(
  "/api/v1/products/:productId",
  productController.deleteProduct
);

/* ---------- SWAGGER ---------- */
app.use(
  "/api/v1/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

/* ---------- ERROR HANDLER ---------- */
app.use(errorHandler);

/* ---------- SERVER ---------- */
let server;

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.APP_PORT || 8080;

  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

/* ---------- GRACEFUL SHUTDOWN ---------- */
const shutdown = async () => {
  console.log("Shutting down server...");

  if (server) {
    server.close(async () => {
      try {
        await pool.end();
        await redisClient.quit();

        console.log("Database and Redis connections closed");

        process.exit(0);
      } catch (err) {
        console.error("Shutdown error:", err);

        process.exit(1);
      }
    });
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

module.exports = app;