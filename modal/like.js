const express = require('express')
const app = express()
const mongoose = require('mongoose')

var schema = mongoose.Schema({diary_id:'string',like_by:'string'},{ timestamps:false,versionKey:false})
var like = mongoose.model('like',schema);

module.exports = like