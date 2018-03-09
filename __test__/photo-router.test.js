'use strict';

const request = require('superagent');
const server = require('../server');
const serverToggle = require('../lib/server-toggle');

require('jest');

const User = require('../model/user');
const Gallery = require('../model/gallery');
const Photo = require('../model/photo');

const url = 'http://localhost:3000';

const exampleUser = {
  username: 'testuser',
  password: '1234',
  email: 'exampleuser@test.com',
};

const exampleGallery = {
  name: 'test gallery',
  desc: 'test description',
};

const examplePhoto = {
  name: 'test photo',
  desc: 'test description',
  image: `${__dirname}/../data/tester.png`,
};

describe('Photo Routes', function() {

  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });

  afterAll( done => {
    serverToggle.serverOff(server, done);
  });

  afterEach( done => {
    Promise.all([
      Photo.remove({}),
      User.remove({}),
      Gallery.remove({}),
    ])
      .then( () => done())
      .catch(done);
  });

  describe('POST: /api/gallery/:galleryId/photo', () => {
    describe('with a valid token and valid data', () => {
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
      
      afterEach( done => {
        delete exampleGallery.userID;
        done();
      });

      it('should return an object containing our photo URL', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}/photo`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .field('name', examplePhoto.name)
          .field('desc', examplePhoto.desc)
          .attach('image', examplePhoto.image)
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual(examplePhoto.name);
            expect(res.body.desc).toEqual(examplePhoto.desc);
            expect(res.body.galleryID).toEqual(this.tempGallery._id.toString());
            done();
          });
      });
    });
  });
});
