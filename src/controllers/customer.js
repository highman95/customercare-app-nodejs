const model = require('../models/customer');
const modelBill = require('../models/bill');

module.exports = {
  create: async (req, res, next) => {
    const {
      body: {
        first_name, last_name, birth_date, gender, email, phone,
      }, user,
    } = req;

    try {
      const customer = await model.create(
        first_name, last_name, birth_date, gender, email, phone, user.id,
      );
      res.status(201).json({ status: true, data: { customer, message: 'Customer created successfully' } });
    } catch (e) {
      next(e);
    }
  },

  fetch: async (req, res, next) => {
    const { q } = req.query;

    try {
      const customers = await model.fetchAll(q);
      res.json({ status: true, data: customers });
    } catch (e) {
      next(e);
    }
  },

  find: async (req, res, next) => {
    const { params: { id }, query: { start_date, end_date } } = req;

    try {
      const customer = await model.find(id);
      customer.bills = await modelBill.fetchAll(customer.id, start_date, end_date, false);

      res.json({ status: true, data: customer });
    } catch (e) {
      next(e);
    }
  },
};
