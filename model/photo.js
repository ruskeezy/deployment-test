'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const photoSchema = Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  userID: { type: Schema.Types.ObjectId, required: true },
  galleryID: { type: Schema.Types.ObjectId, required: true },
  imageURL: { type: String, required: true, unique: true },
  objectKey: { type: String, required: true, unique: true },
  createdOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model('photo', photoSchema);