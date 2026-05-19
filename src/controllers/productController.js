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

    // Invalidate paginated product caches
    const keys = await redisClient.keys("products:*");

    if (keys.length > 0) {
      await redisClient.del(keys);
    }

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
    // Check Redis cache
    const cachedProducts = await redisClient.get(cacheKey);

    if (cachedProducts) {
      return res.status(200).json(JSON.parse(cachedProducts));
    }

    // Fetch from database
    const products = await productService.getProducts(limit, offset);

    // Store in Redis
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

/**
 * @swagger
 * /api/v1/products/{productId}:
 *   get:
 *     summary: Get product by ID
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       404:
 *         description: Product not found
 */
const getProductById = async (req, res, next) => {
  const productId = req.params.productId;

  const cacheKey = `product:${productId}`;

  try {
    // Check Redis cache
    const cachedProduct = await redisClient.get(cacheKey);

    if (cachedProduct) {
      return res.status(200).json(JSON.parse(cachedProduct));
    }

    // Fetch from database
    const product = await productService.getProductById(productId);

    // Store in Redis
    await redisClient.setEx(
      cacheKey,
      parseInt(process.env.CACHE_TTL_SECONDS) || 60,
      JSON.stringify(product)
    );

    res.status(200).json(product);
  } catch (err) {
    next(new AppError("Product not found", 404));
  }
};

/**
 * @swagger
 * /api/v1/products/{productId}:
 *   put:
 *     summary: Update a product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;

    const updatedProduct = await productService.updateProduct(
      productId,
      req.body
    );

    // Delete single product cache
    await redisClient.del(`product:${productId}`);

    // Delete paginated product caches
    const keys = await redisClient.keys("products:*");

    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    next(new AppError("Product not found", 404));
  }
};

/**
 * @swagger
 * /api/v1/products/{productId}:
 *   delete:
 *     summary: Delete a product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;

    await productService.deleteProduct(productId);

    // Delete single product cache
    await redisClient.del(`product:${productId}`);

    // Delete paginated product caches
    const keys = await redisClient.keys("products:*");

    if (keys.length > 0) {
      await redisClient.del(keys);
    }

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