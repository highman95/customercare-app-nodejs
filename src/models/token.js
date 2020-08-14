const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/helpers');
const { InternalServerError, NotAcceptableError } = require('../utils/http-errors');

module.exports = {
    async create(user) {
        if (!user.id) throw new NotAcceptableError('User details are missing');

        try {
            const currentTime = Date.now();
            const hashedPassKey = await bcrypt.hash(`${process.env.PASS_KEY}-${currentTime}`, 10);
            const token = generateToken({ first_name: user.first_name, email: user.email, rand: hashedPassKey });

            const millisecondsInElapseTimehours = process.env.JWT_ELAPSE * 60 * 60 * 1000;
            const expiresAt = currentTime + millisecondsInElapseTimehours + 50;// 50s for generate-token

            return { expires_at: expiresAt, token };
        } catch (e) {
            throw new InternalServerError('Token could not be generated');
        }
    },
};
