'use strict';

const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('instaclone:photo-router');

const Photo = require('../model/photo');
const Gallery = require('../model/gallery');
const bearerAuth = require('../lib/bearer-auth-middleware');

const photoRouter = module.exports = Router();

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer( { dest: dataDir } );

function s3uploadProm(params) {
  debug('s3uploadProm');
  return new Promise((resolve) => {
    s3.upload(params, (err, s3data) => {
      resolve(s3data);
    });
  });
}

photoRouter.post('/api/gallery/:galleryId/photo', bearerAuth, upload.single('image'), function(req, res, next) {
  debug('POST: /api/gallery/galleryId/photo');

  if (!req.file) return next(createError(400, 'file not found'));
  if(!req.file.path) return next(createError(500, 'file not saved'));

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path),
  };

  Gallery.findById(req.params.galleryId)
    .then( () => s3uploadProm(params))
    .then( s3data => {
      console.log('s3 response: ', s3data);
      del([`${dataDir}/*`]);

      let photoData = {
        name: req.body.name,
        desc: req.body.desc,
        objectKey: s3data.Key,
        imageURL: s3data.Location,
        userID: req.user._id,
        galleryID: req.params.galleryId,
      };

      return new Photo(photoData).save();
    })
    .then( photo => res.json(photo))
    .catch( err => next(err));
});
