'use strict';

const request = require('superagent');
const User = require('../model/user');
const serverToggle = require('../lib/server-toggle');
const server = require('../server');

require('jest');

const url = 'http://localhost:3000';

const exampleUser = {
  username: 'testuser',
  password: '1234',
  email: 'testuser@test.com',
};

describe('Auth Routes', function() {
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });
  afterAll( done => {
    serverToggle.serverOff(server, done);
  });

  describe('POST: /api/signup', function() {
    describe('with a valid body', function() {
      afterEach( done => {
        User.remove({})
          .then( () => done())
          .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
          .send(exampleUser)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(typeof res.text).toEqual('string');
            done();
          });
      });
    });
    
    describe('without a valid request', () => {
      it('should return a 400 error', () => {
        request.post(`${url}/api/signup`)
          .send({})
          .end((err, res) =>{
            expect(res.status).toEqual(400);
            expect(res.text).toEqual('BadRequestError');
          });
      });
    });
  });

  describe('GET: /api/signin', function() {
    describe('with a valid body', function() {
      beforeEach( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
          .then( user => user.save())
          .then( user => {
            this.tempUser = user;
            done();
          })
          .catch(done);
      });
      afterEach( done => {
        User.remove({})
          .then( () => done())
          .catch(done);
      });

      it('should return a token', done => {
        request.get(`${url}/api/signin`)
          .auth('testuser', '1234')
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(typeof res.text).toEqual('string');
            done();
          });
      });
    });

    describe('without a valid body', () => {
      it('should return a 401 error', done => {
        request.get(`${url}/api/signin`)
          .send({})
          // .auth('fake username', 'fake password')
          .end((err, res) => {
            expect(res.status).toEqual(401);
            expect(res.text).toEqual('UnauthorizedError');
            done();
          });
      });
    });
  });
});