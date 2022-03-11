const express = require('express')
const app = express()
const mongoose = require('mongoose')

var schema = mongoose.Schema({user_id:'string',marker_id:'string',lag:'number',lng:'number'}
,{ timestamps:false,versionKey:false})
var user_marker = mongoose.model('user_marker',schema);

module.exports = user_marker