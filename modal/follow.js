const express = require('express')
const app = express()
const mongoose = require('mongoose')

var schema = mongoose.Schema({target:'string',following_by:'string'},{ timestamps:false,versionKey:false})
var follow = mongoose.model('follow',schema);

module.exports = follow