const { dbEntities, db } = require('../utils/helpers');
const { BadRequestError, DatabaseError, NotFoundError } = require('../utils/http-errors');
// const auditDb = ''; // mongo-db | redis | kafka

module.exports = {
  create: async (
    actor, url, narration, actionType, ipAddress, requestBody, responseBody, remarks,
  ) => {
    if (!actor) throw new BadRequestError('Actor information is missing');
    if (!url) throw new BadRequestError('Url is missing');
    if (!actionType) throw new BadRequestError('Action-Type is missing');
    if (!ipAddress) throw new BadRequestError('Ip-Address is missing');

    try {
      const returnValues = 'id, actor, narration, action_type, request, response, remarks, EXTRACT(epoch FROM created_at) as created_at';
      const result = await db.query(`INSERT INTO ${dbEntities.audits} (actor, narration, action_type, ip_address, request, response, remarks) VALUES ($1, $2, $3, $4) RETURNING ${returnValues}`, [
        actor, narration, actionType, ipAddress, requestBody, responseBody, remarks,
      ]);
      return result.rows[0] || {};
    } catch (e) {
      throw new DatabaseError('Audit could not be saved');
    }
  },

  fetchAll: async (userId, startDate, endDate) => {
    if (!userId) throw new NotFoundError('Customer does not exist');

    let where = '';
    const filter = [];
    if (userId) {
      where += ' AND user_id = $1';
      filter.push(userId);
    }

    if (startDate && endDate) {
      where += ' AND (a.created_at >= $2 AND a.created_at <= $3)';
      filter.push(...[startDate, endDate]);
    }

    return (await db.query(`SELECT * FROM ${dbEntities.audits} a WHERE 1=1 ${where} ORDER BY a.created_at DESC`, filter)).rows;
  },

  find: async (id) => {
    if (!id) throw new NotFoundError('Audit does not exist');

    const result = await db.query(`SELECT * FROM ${dbEntities.audits} a WHERE a.id = $1 GROUP BY a.id`, [id]);
    if (!result.rows[0].id) throw new NotFoundError('Audit does not exist');

    return result.rows[0];
  },
};
