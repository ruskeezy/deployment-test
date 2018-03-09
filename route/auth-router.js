'use strict';

const jsonParser = require('body-parser').json();
const debug = require('debug')('cfgram:auth-router');
const Router = require('express').Router;
const createError = require('http-errors');
const basicAuth = require('../lib/basic-auth-middleware');
const User = require('../model/user');

const authRouter = module.exports = Router();

authRouter.post('/api/signup', jsonParser, function(req, res, next) {
  debug('POST: /api/singup');

  if(!req.body.username || !req.body.email) {
    return next(createError(400, 'BadRequestError'));
  }

  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);
  user.generatePasswordHash(password)
    .then( user => user.save())
    .then( user => user.generateToken())
    .then( token => res.send(token))
    .catch(next);
});

authRouter.get('/api/signin', basicAuth, function(req, res, next) {
  debug('GET: /api/signin');

  User.findOne( { username: req.auth.username } )
    .then( user => user.comparePasswordHash(req.auth.password))
    .then( user => user.generateToken())
    .then( token => res.send(token))
    .catch(next);
});