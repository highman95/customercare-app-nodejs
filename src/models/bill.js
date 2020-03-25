const { dbEntities } = require('../utils/helpers');
const { BadRequestError, DatabaseError, NotFoundError } = require('../utils/http-errors');
const modelItem = require('../models/item');
const modelCustomer = require('../models/customer');

module.exports = {
    async create(customerId, phone, address, orders, userId) {
        if (!userId) throw new BadRequestError('The user identifier is missing');
        if (!phone) throw new BadRequestError('The phone number for notification is missing');
        if (!await modelCustomer.find(customerId)) throw new NotFoundError('The customer does not exist');

        if (!orders instanceof Array) throw new BadRequestError('The product(s) must be provided as an array');
        if (!orders.length) throw new BadRequestError('At least one product must be selected for this bill');

        // create a client (note: don't try/catch this)
        const client = await db.connect();

        try {
            const input = [customerId, phone, address, userId, userId];
            const returnValues = 'id, customer_id, extract(epoch FROM created_at) AS created_at';

            await client.query('BEGIN');
            const result = await client.query(`INSERT INTO ${dbEntities.bills} (customer_id, phone, address, user_id, modifier_id) VALUES ($1, $2, $3, $4, $5) RETURNING ${returnValues}`, input);
            const bill = result.rows[0] || null;

            if (!!bill) bill.items = await modelItem.createBatch(client, bill.id, orders);
            await client.query('COMMIT');

            return bill;
        } catch (e) {
            await client.query('ROLLBACK');
            throw new DatabaseError('The bill could not be generated');
        } finally {
            client.release()
        }
    },

    fetchAll: async () => {
        const results = await db.query(`SELECT id, customer_id, phone, address, user_id, extract(epoch FROM created_at) as created_at FROM ${dbEntities.bills} ORDER BY created_at DESC`);
        return results.rows;
    }
}
