'use strict';

const request = require('superagent');
const Promise = require('bluebird');
const server = require('../server');
const serverToggle = require('../lib/server-toggle');

const User = require('../model/user');
const Gallery = require('../model/gallery');

require('jest');

const url = 'http://localhost:3000';

const exampleUser = {
  username: 'testuser',
  password: '1234',
  email: 'testemail@test.com',
};

const exampleGallery = {
  name: 'test gallery',
  desc: 'test gallery desc',
};

const updatedGallery = {
  name: 'updaterooni',
  desc: 'desc updaterooni',
};

describe('Gallery Routes', function() {

  beforeAll(done => {
    serverToggle.serverOn(server, done);
  });

  afterAll(done => {
    serverToggle.serverOff(server, done);
  });

  afterEach( done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({}),
    ])
      .then( () => done())
      .catch(done);
  });

  describe('POST: /api/gallery', () => {
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    it('should return a gallery', done => {
      request.post(`${url}/api/gallery`)
        .send(exampleGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.desc).toEqual(exampleGallery.desc);
          expect(res.body.name).toEqual(exampleGallery.name);
          expect(res.body.userID).toEqual(this.tempUser._id.toString());
          done();
        });
    });

    it('should return a 401 if no token was provided', done => {
      request.post(`${url}/api/gallery`)
        .send(exampleGallery)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });

    it('should return a 400 error if an invalid body was provided', done => {
      request.post(`${url}/api/gallery`)
        .send({})
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          expect(res.text).toEqual('BadRequestError');
          done();
        });
    });
  });

  describe('GET: /api/gallery/:galleryId', () => {

    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    beforeEach( done => {
      exampleGallery.userID = this.tempUser._id.toString();
      new Gallery(exampleGallery).save()
        .then( gallery => {
          this.tempGallery = gallery;
          done();
        })
        .catch(done); 
    });

    afterEach( () => {
      delete exampleGallery.userID;
    });

    it('should return a gallery', done => {
      request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.name).toEqual(exampleGallery.name);
          expect(res.body.desc).toEqual(exampleGallery.desc);
          expect(res.body.userID).toEqual(this.tempUser._id.toString());
          done();
        });
    });

    it('should return a 401 if no token was provided', done => {
      request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          expect(res.text).toEqual('UnauthorizedError');
          done();
        });
    });

    it('should return a 404 if invalid id provided', done => {
      request.get(`${url}/api/gallery/`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });
  });

  describe('PUT: /api/gallery/:galleryId', () => {
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });
    beforeEach( done => {
      exampleGallery.userID = this.tempUser._id.toString();
      new Gallery(exampleGallery).save()
        .then( gallery => {
          this.tempGallery = gallery;
          done();
        })
        .catch(done);
    });

    it('should return a 200', done => {
      request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send(updatedGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.name).toEqual(updatedGallery.name);
          expect(res.body.desc).toEqual(updatedGallery.desc);
          done();
        });
    });

    it('should return a 401 error with no token', done => {
      request.put(`{url}/api/gallery/${this.tempGallery._id}`)
        .send(exampleGallery)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });

    it('should return a 400 error without a body', done => {
      request.put(`{url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          done();
        });
    });

    it('should return a 404 error with a valid request but no id', done => {
      request.put(`{url}/api/gallery/1234`)
        .send(exampleGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });
  });
});
