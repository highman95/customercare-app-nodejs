const model = require('../models/audit');

module.exports = {
    fetch: async (req, res, next) => {
        const { user_id, start_date, end_date } = req.query;

        // const isPdf = (req.params.format && (req.params.format.toLowerCase() === 'pdf'));
        // const isExcel = (req.params.format && (req.params.format.toLowerCase() === 'xls'));

        try {
            const audits = await model.fetchAll(user_id, start_date, end_date);
            res.type('json').send({ status: true, data: audits });
        } catch (e) {
            next(e);
        }
    },
};
