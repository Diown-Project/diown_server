const express = require('express')
const app = express()
const mongoose = require('mongoose')

var schema = mongoose.Schema({target:'string',request_by:'string'},{ timestamps:false,versionKey:false})
var followRequest = mongoose.model('followRequest',schema);

module.exports = followRequest

