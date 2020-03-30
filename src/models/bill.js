const { dbEntities } = require('../utils/helpers');
const { BadRequestError, DatabaseError, NotFoundError } = require('../utils/http-errors');
const modelItem = require('../models/item');
const modelCustomer = require('../models/customer');

module.exports = {
    async create(customerId, phone, address, orders, userId) {
        if (!userId) throw new BadRequestError('The user identifier is missing');
        if (!phone) throw new BadRequestError('The phone number for notification is missing');
        if (!(await modelCustomer.find(customerId)).id) throw new NotFoundError('The customer does not exist');

        if (!orders instanceof Array) throw new BadRequestError('The product(s) must be provided as an array');
        if (!orders.length) throw new BadRequestError('At least one product must be selected for this bill');

        // create a client (note: don't try/catch this)
        const client = await db.connect();

        try {
            const input = [customerId, phone, address, userId, userId];
            const returnValues = 'id, customer_id, extract(epoch FROM created_at) AS created_at';

            await client.query('BEGIN');
            const result = await client.query(`INSERT INTO ${dbEntities.bills} (customer_id, phone, address, user_id, modifier_id) VALUES ($1, $2, $3, $4, $5) RETURNING ${returnValues}`, input);
            const bill = result.rows[0] || {};

            if (bill.id) bill.items = await modelItem.createBatch(client, bill.id, orders);
            await client.query('COMMIT');

            return bill;
        } catch (e) {
            await client.query('ROLLBACK');
            throw new DatabaseError('The bill could not be generated');
        } finally {
            client.release()
        }
    },

    fetchAll: async (customerId) => {
        const where = customerId ? 'AND customer_id = $1' : '';
        const filter = customerId ? [customerId] : [];

        const returnValues = 'a.id, customer_id, phone, address, status, user_id, sum(amount * quantity) as total_amount, extract(epoch FROM a.created_at) as created_at';
        const results = await db.query(`SELECT ${returnValues} FROM ${dbEntities.bills} a LEFT JOIN ${dbEntities.items} b ON a.id = b.bill_id WHERE 1=1 ${where} GROUP BY a.id ORDER BY a.created_at DESC`, filter);
        return results.rows;
    },

    find: async (id) => {
        if (!id) throw new BadRequestError('The bill identifier is missing');

        const returnValues = 'id, customer_id, phone, address, status, user_id, extract(epoch FROM created_at) as created_at';
        const result = await db.query(`SELECT ${returnValues} FROM ${dbEntities.bills} WHERE id = $1`, [id]);
        return result.rows[0] || {};
    }
}
