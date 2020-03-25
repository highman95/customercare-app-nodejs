const { dbEntities } = require('../utils/helpers');
const { BadRequestError, ConflictError, DatabaseError, NotFoundError } = require('../utils/http-errors');
const modelProduct = require('./product');

const getProduct = async (productId) => {
    const product = await modelProduct.find(productId);
    if (!product) throw new NotFoundError('The product could not be identified');

    return product;
}

const computeInput = async (billId, { product_id, quantity = 1 }, callBack) => {
    if (!!await callBack(billId, product_id)) throw new ConflictError('The bill-item already exists');

    const product = await getProduct(product_id);
    return `(${billId}, ${product_id}, ${product.price}, ${quantity})`;
}

module.exports = {
    async createBatch(client, billId, orders = []) {
        try {
            const inputs = await Promise.all(orders.map(async order => await computeInput(billId, order, async (billId, productId) => await this.find(billId, productId))));
            const returnValues = 'id, bill_id, product_id, extract(epoch FROM created_at) AS created_at';

            const results = await client.query(`INSERT INTO ${dbEntities.items} (bill_id, product_id, amount, quantity) VALUES ${inputs.join(',')} RETURNING ${returnValues}`);
            return results.rows;
        } catch (e) {
            throw new DatabaseError('The bill-items/orders could not be saved')
        }
    },

    async create(billId, productId, quantity) {
        if (!!await this.find(billId, productId)) throw new ConflictError('The bill-item already exists');
        if (parseFloat(quantity) <= 0) throw new BadRequestError('The specified quantity is invalid');

        try {
            const product = await getProduct(product_id);
            const input = [billId, productId, product.price, quantity];
            const returnValues = 'id, bill_id, product_id, extract(epoch FROM created_at) AS created_at';

            const result = await db.query(`INSERT INTO ${dbEntities.items} (bill_id, product_id, amount, quantity) VALUES ($1, $2, $3, $4) RETURNING ${returnValues}`, input);
            return result.rows[0] || null;
        } catch (e) {
            throw new DatabaseError('The bill-item/order could not be saved')
        }
    },

    find: async (billId, productId) => {
        if (!billId) throw new BadRequestError('The bill information is missing');
        if (!productId) throw new BadRequestError('The product information is missing');

        const result = await db.query(`SELECT id, bill_id, product_id, amount, quantity FROM ${dbEntities.items} WHERE bill_id = $1 AND product_id = $2`, [billId, productId]);
        return result.rows[0] || null;
    }
}
