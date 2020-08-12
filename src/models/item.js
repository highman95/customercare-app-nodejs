const { dbEntities, db } = require('../utils/helpers');
const {
  BadRequestError, ConflictError, DatabaseError, NotFoundError,
} = require('../utils/http-errors');
const modelProduct = require('./product');

const getProduct = async (productId) => {
  const product = await modelProduct.find(productId);
  if (!product.id) throw new NotFoundError('The product could not be identified');

  return product;
};

const find = async (billId, productId) => {
  if (!billId) throw new NotFoundError('Bill does not exist');
  if (!productId) throw new NotFoundError('Product does not exist');

  const result = await db.query(`SELECT id, bill_id, product_id, amount, quantity FROM ${dbEntities.items} WHERE bill_id = $1 AND product_id = $2`, [billId, productId]);
  return result.rows[0] || {};
};

const computeInput = async (billId, productId, quantity = 1) => {
  if ((await find(billId, productId)).id) throw new ConflictError('The bill-item already exists');

  const product = await getProduct(productId);
  return `(${billId}, ${productId}, ${product.price}, ${quantity})`;
};

module.exports = {
  async createBatch(client, billId, orders = []) {
    if (!billId) throw new NotFoundError('Bill does not exist');

    try {
      const inputs = await Promise.all(orders.map(async (
        { product_id, quantity },
      ) => computeInput(billId, product_id, quantity)));
      const returnValues = 'id, bill_id, product_id, EXTRACT(epoch FROM created_at) AS created_at';

      const results = await client.query(`INSERT INTO ${dbEntities.items} (bill_id, product_id, amount, quantity) VALUES ${inputs.join(',')} RETURNING ${returnValues}`);
      return results.rows;
    } catch (e) {
      throw new DatabaseError('The bill-items/orders could not be saved');
    }
  },

  async create(billId, productId, quantity) {
    if ((await this.find(billId, productId)).id) throw new ConflictError('The bill-item already exists');
    if (parseFloat(quantity) <= 0) throw new BadRequestError('The specified quantity is invalid');

    try {
      const product = await getProduct(productId);
      const input = [billId, productId, product.price, quantity];
      const returnValues = 'id, bill_id, product_id, EXTRACT(epoch FROM created_at) AS created_at';

      const result = await db.query(`INSERT INTO ${dbEntities.items} (bill_id, product_id, amount, quantity) VALUES ($1, $2, $3, $4) RETURNING ${returnValues}`, input);
      return result.rows[0] || {};
    } catch (e) {
      throw new DatabaseError('The bill-item/order could not be saved');
    }
  },

  fetchAll: async (billId) => {
    if (!billId) throw new NotFoundError('Bill does not exist');

    const results = await db.query(`SELECT id, bill_id, product_id, amount, quantity FROM ${dbEntities.items} WHERE bill_id = $1`, [billId]);
    return results.rows;
  },

  find,
};
