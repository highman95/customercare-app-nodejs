const { dbEntities, db } = require('../utils/helpers');
const {
    BadRequestError, DatabaseError, NotAcceptableError, NotFoundError,
} = require('../utils/http-errors');
const modelItem = require('../models/item');
const modelCustomer = require('../models/customer');

module.exports = {
    async create(customerId, phone, address, orders, userId) {
        if (!userId) throw new BadRequestError('Operator is not known');
        if (!phone) throw new BadRequestError('The phone number for notification is missing');
        if (!(await modelCustomer.find(customerId)).id) throw new NotFoundError('Customer does not exist');

        if (!(orders instanceof Array)) throw new BadRequestError('The product(s) must be provided as an array');
        if (!orders.length) throw new BadRequestError('At least one product must be selected for this bill');

        // create a client (note: don't try/catch this)
        const client = await db.connect();

        try {
            const input = [customerId, phone, address, userId, userId];
            const returnValues = 'id, customer_id, extract(epoch FROM created_at) AS created_at';

            await client.query('BEGIN');
            const result = await client.query(`INSERT INTO ${dbEntities.bills} (customer_id, phone, address, user_id, modifier_id) VALUES ($1, $2, $3, $4, $5) RETURNING ${returnValues}`, input);
            const bill = result.rows[0] || {};

            bill.items = await modelItem.createBatch(client, bill.id, orders);
            await client.query('COMMIT');

            return bill;
        } catch (e) {
            await client.query('ROLLBACK');
            throw new DatabaseError('The bill could not be generated');
        } finally {
            client.release();
        }
    },

    async updateStatus(id, amount = 0.00, status, reason = '', userId) {
        if (!userId) throw new BadRequestError('Operator is not known');
        if (!status) throw new BadRequestError('Bill status cannot be empty');
        if (!['paid', 'failed'].includes(status.toLowerCase())) throw new BadRequestError('Bill status can be either PAID or FAILED');

        const bill = await this.find(id);
        if (parseFloat(bill.total_amount) !== parseFloat(amount)) throw new NotAcceptableError(`Amount paid is not the correct Bill amount (N${bill.total_amount})`);

        try {
            const input = [status.toLowerCase(), reason, userId, id];
            const returnValues = 'id, status, updated_at';

            const result = await db.query(`UPDATE ${dbEntities.bills} SET status = $1, reason = $2, modifier_id = $3 WHERE id = $4 RETURNING ${returnValues}`, input);
            return result.rows[0] || {};
        } catch (e) {
            throw new DatabaseError('Bill status could not be updated');
        }
    },

    fetchAll: async (customerId, startDate, endDate, isSearchMode = true) => {
        if (!isSearchMode && !customerId) throw new NotFoundError('Customer does not exist');

        let where = '';
        const filter = [];
        if (customerId) {
            where += ' AND customer_id = $1';
            filter.push(customerId);
        }

        if (startDate && endDate) {
            where += ' AND (a.created_at >= $2 AND a.created_at <= $3)';
            filter.push(...[startDate, endDate]);
        }

        const returnValues = 'a.id, customer_id, phone, address, status, reason, user_id, sum(amount * quantity) as total_amount, extract(epoch FROM a.created_at) as created_at';
        const results = await db.query(`SELECT ${returnValues} FROM ${dbEntities.bills} a LEFT JOIN ${dbEntities.items} b ON a.id = b.bill_id WHERE 1=1 ${where} GROUP BY a.id ORDER BY a.created_at DESC`, filter);
        return results.rows;
    },

    find: async (id) => {
        if (!id) throw new NotFoundError('Bill does not exist');

        const returnValues = 'a.id, customer_id, phone, address, status, reason, user_id, sum(amount * quantity) as total_amount, extract(epoch FROM a.created_at) as created_at';
        const result = await db.query(`SELECT ${returnValues} FROM ${dbEntities.bills} a LEFT JOIN ${dbEntities.items} b ON a.id = b.bill_id WHERE a.id = $1 GROUP BY a.id`, [id]);
        const bill = result.rows[0] || {};
        if (!bill.id) throw new NotFoundError('Bill does not exist');

        return bill;
    },
};
