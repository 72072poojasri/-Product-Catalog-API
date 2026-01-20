const pool = require("../../config/db");

const createProduct = async ({ name, description, price, stock_quantity }) => {
  const query = `
    INSERT INTO products (name, description, price, stock_quantity)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [name, description, price, stock_quantity];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getAllProducts = async (limit, offset) => {
  const query = `
    SELECT * FROM products
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2;
  `;
  const { rows } = await pool.query(query, [limit, offset]);
  return rows;
};
const getProductById = async (id) => {
  const query = "SELECT * FROM products WHERE id = $1";
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};
const updateProductById = async (id, data) => {
  const { name, description, price, stock_quantity } = data;

  const query = `
    UPDATE products
    SET
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      price = COALESCE($3, price),
      stock_quantity = COALESCE($4, stock_quantity),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *;
  `;

  const values = [name, description, price, stock_quantity, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};
const deleteProductById = async (id) => {
  const query = "DELETE FROM products WHERE id = $1 RETURNING *";
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};
