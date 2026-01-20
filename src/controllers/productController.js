const productService = require("../services/productService");
const AppError = require("../utils/AppError");
const redisClient = require("../../config/redis");

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stock_quantity:
 *           type: integer
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock_quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input
 */
const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);

    // OPTIONAL: cache invalidation (safe way)
    // await redisClient.flushAll();

    res.status(201).json(product);
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of products
 */
const getProducts = async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  const cacheKey = `products:${limit}:${offset}`;

  try {
    // 1️⃣ Check Redis cache
    const cachedProducts = await redisClient.get(cacheKey);
    if (cachedProducts) {
      return res.status(200).json(JSON.parse(cachedProducts));
    }

    // 2️⃣ Fetch from DB
    const products = await productService.getProducts(limit, offset);

    // 3️⃣ Store in Redis
    await redisClient.setEx(
      cacheKey,
      parseInt(process.env.CACHE_TTL_SECONDS) || 60,
      JSON.stringify(products)
    );

    res.status(200).json(products);
  } catch (err) {
    next(new AppError("Failed to fetch products", 500));
  }
};
const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.productId);
    res.status(200).json(product);
  } catch (err) {
    next(new AppError("Product not found", 404));
  }
};
const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await productService.updateProduct(
      req.params.productId,
      req.body
    );

    // 🔥 CACHE INVALIDATION (IMPORTANT)
    await redisClient.flushAll();

    res.status(200).json(updatedProduct);
  } catch (err) {
    next(new AppError("Product not found", 404));
  }
};
const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.productId);

    // 🔥 CACHE INVALIDATION (IMPORTANT)
    await redisClient.flushAll();

    res.status(204).send();
  } catch (err) {
    next(new AppError("Product not found", 404));
  }
};


module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
