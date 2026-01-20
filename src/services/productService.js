const productRepo = require("../repositories/productRepository");

const createProduct = async (data) => {
  const { name, price } = data;

  if (!name || price === undefined) {
    throw new Error("Name and price are required");
  }

  return await productRepo.createProduct(data);
};


const getProducts = async (limit, offset) => {
  return await productRepo.getAllProducts(limit, offset);
};
const getProductById = async (id) => {
  const product = await productRepo.getProductById(id);
  if (!product) {
    throw new Error("Product not found");
  }
  return product;
};
const updateProduct = async (id, data) => {
  const updatedProduct = await productRepo.updateProductById(id, data);

  if (!updatedProduct) {
    throw new Error("Product not found");
  }

  return updatedProduct;
};
const deleteProduct = async (id) => {
  const deletedProduct = await productRepo.deleteProductById(id);

  if (!deletedProduct) {
    throw new Error("Product not found");
  }

  return deletedProduct;
};


module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
