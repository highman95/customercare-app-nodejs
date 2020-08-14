/* eslint-disable no-undef */
require('dotenv').config();

const request = require('request');
const jwt = require('jsonwebtoken');
const server = require('../../src/index');

describe('UserController Test Suite', () => {
  let baseUrl;
  let testStub = {};
  let testData = {};

  beforeAll(() => {
    const { address, port } = server.address();
    const hostName = address === '::' ? `http://localhost:${port}` : '';
    baseUrl = `${hostName}/api/v1/users`;

    testStub = {
      first_name: 'Mark',
      email: `mark.spencer-${Date.now()}@oc.com`,
      password: 'markspencer',
    };
  });

  afterAll((done) => server.close(done));

  describe('POST /users/register', () => {
    const options = {};

    beforeEach(() => {
      const data = {
        last_name: 'Spencer',
        ...testStub,
        gender: 'male',
        address: '10 Borough Ave.',
      };

      testData = { ...data };
    });

    beforeAll(() => {
      endPoint = `${baseUrl}/register`;
    });

    describe('address is not specified', () => {
      let responseBox = {};

      beforeAll((done) => {
        testData.address = '';

        request.post({
          url: endPoint, ...options, form: testData, json: true,
        }, (error, response, body) => {
          responseBox = { error, response, body };
          done();
        });
      });

      it('should return statusCode 400', () => expect(responseBox.response.statusCode).toBe(400));
      it('should return error status', () => expect(responseBox.body.status).toBeFalse());
      it('should return a relevant error message', () => expect(responseBox.body.error).toBeDefined());
    });

    describe('all required parameters are sent', () => {
      let responseBox = {};

      beforeAll((done) => {
        request.post({
          url: endPoint, ...options, form: testData, json: true,
        }, (error, response, body) => {
          responseBox = { error, response, body };
          done();
        });
      });

      it('should return statusCode 201', () => expect(responseBox.response.statusCode).toBe(201));
      it('should return success status', () => expect(responseBox.body.status).toBeTrue());
      it('should return success message', () => expect(responseBox.body.message).toBeDefined());
      it('should return unique-identifier', () => {
        expect(responseBox.body.data.id).toBeDefined();
        testStub.id = responseBox.body.data.id;
      });
      it('should return email in data-body', () => expect(responseBox.body.data.email).toBe(testData.email));
      // it('should return an authentication token', () => expect(responseBox.body.data.token).toBeDefined());
    });
  });

  describe('POST /users/activate', () => {
    let options = {};

    beforeAll(() => {
      endPoint = `${baseUrl}/activate`;

      const token = jwt.sign(
        { email: testStub.email, first_name: testStub.first_name }, process.env.JWT_SECRET,
      );
      options = { headers: { authorization: `bearer ${token}` } };
    });

    describe('token is not specified', () => {
      let responseBox = {};

      beforeAll((done) => {
        request.put({
          url: endPoint, headers: {}, form: {}, json: true,
        }, (error, response, body) => {
          responseBox = { error, response, body };
          done();
        });
      });

      it('should return statusCode 401', () => expect(responseBox.response.statusCode).toBe(401));
      it('should return error status', () => expect(responseBox.body.status).toBeFalse());
      it('should return a relevant error message', () => expect(responseBox.body.error).toBeDefined());
    });

    describe('invalid token is specified', () => {
      let responseBox = {};

      beforeAll((done) => {
        request.put({
          url: endPoint, headers: { authorization: 'bearer a.b.c' }, form: {}, json: true,
        }, (error, response, body) => {
          responseBox = { error, response, body };
          done();
        });
      });

      it('should return statusCode 401', () => expect(responseBox.response.statusCode).toBe(401));
      it('should return error status', () => expect(responseBox.body.status).toBeFalse());
      it('should return a relevant error message', () => expect(responseBox.body.error).toBeDefined());
    });

    describe('valid token is provided', () => {
      let responseBox = {};

      beforeAll((done) => {
        request.put({
          url: endPoint, ...options, form: { user_id: testStub.id }, json: true,
        }, (error, response, body) => {
          responseBox = { error, response, body };
          done();
        });
      });

      it('should return statusCode 200', () => expect(responseBox.response.statusCode).toBe(200));
      it('should return success status', () => expect(responseBox.body.status).toBeTrue());
      it('should return success message', () => expect(responseBox.body.message).toBeDefined());
    });
  });

  describe('POST /users/signin', () => {
    let testCredentials = {};

    beforeAll(() => {
      endPoint = `${baseUrl}/signin`;
    });

    beforeEach(() => {
      testCredentials = { ...testStub };
    });

    describe('email input is blank', () => {
      let responseBox;

      beforeAll((done) => {
        testCredentials.email = '';

        request.post(endPoint, { form: testCredentials, json: true }, (error, response, body) => {
          responseBox = { error, response, body };
          done();
        });
      });

      it('should return statusCode 400', () => expect(responseBox.response.statusCode).toBe(400));
      it('should return error status', () => expect(responseBox.body.status).toBeFalse());
      it('should return a relevant error message', () => expect(responseBox.body.error).toBeDefined());
    });

    describe('an invalid email is supplied', () => {
      let responseBox;

      beforeAll((done) => {
        testCredentials.email = 'i-do-code@me';

        request.post(endPoint, { form: testCredentials, json: true }, (error, response, body) => {
          responseBox = { error, response, body };
          done();
        });
      });

      it('should return statusCode 400', () => expect(responseBox.response.statusCode).toBe(400));
      it('should return error status', () => expect(responseBox.body.status).toBeFalse());
      it('should return a relevant error message', () => expect(responseBox.body.error).toBeDefined());
    });

    describe('blank(invalid) password is supplied', () => {
      let responseBox;

      beforeAll((done) => {
        testCredentials.password = '';

        request.post(endPoint, { form: testCredentials, json: true }, (error, response, body) => {
          responseBox = { error, response, body };
          done();
        });
      });

      it('should return statusCode 400', () => expect(responseBox.response.statusCode).toBe(400));
      it('should return error status', () => expect(responseBox.body.status).toBeFalse());
      it('should return a relevant error message', () => expect(responseBox.body.error).toBeDefined());
    });

    describe('an non-existing email is supplied', () => {
      let responseBox;

      beforeAll((done) => {
        testCredentials.email = `i-do-code-${Date.now()}@me.com`;

        request.post(endPoint, { form: testCredentials, json: true }, (error, response, body) => {
          responseBox = { error, response, body };
          done();
        });
      });

      it('should return statusCode 404', () => expect(responseBox.response.statusCode).toBe(404));
      it('should return error status', () => expect(responseBox.body.status).toBeFalse());
      it('should return a relevant error message', () => expect(responseBox.body.error).toBeDefined());
    });

    describe('valid sign-in credentials are supplied', () => {
      let responseBox;

      beforeAll((done) => {
        request.post(endPoint, { form: testCredentials, json: true }, (error, response, body) => {
          responseBox = { error, response, body };
          done();
        });
      });

      it('should return statusCode 200', () => expect(responseBox.response.statusCode).toBe(200));
      it('should return status', () => expect(responseBox.body.status).toBeTrue());
      it('should return an authentication-token', () => expect(responseBox.body.auth.token).toBeDefined());
      it('should return a valid user-id', () => { // verify token with expected value
        let isValidUser;
        try {
          const decodedToken = jwt.verify(responseBox.body.auth.token, process.env.JWT_SECRET);
          isValidUser = (decodedToken.email === responseBox.body.data.email);
        } catch (e) {
          isValidUser = false;
        }

        expect(isValidUser).toBeTruthy();
      });
    });
  });
});
