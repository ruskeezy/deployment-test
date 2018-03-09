'use strict';

const express = require('express');
const debug = require('debug')('instaclone:server');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const galleryRouter = require('./route/gallery-router');
const photoRouter = require('./route/photo-router');
const authRouter = require('./route/auth-router');
const errors = require('./lib/error-middleware');

dotenv.load();

const app = express();
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));
app.use(galleryRouter);
app.use(authRouter);
app.use(photoRouter);
app.use(errors);

const server = module.exports = app.listen(PORT, () => {
  debug(`Server up on PORT ${PORT}`);
});

server.isRunning = true;