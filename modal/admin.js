const express = require('express')
const app = express()
const mongoose = require('mongoose')

var schema = mongoose.Schema({username:'string',password:'string'}
,{ timestamps:false,versionKey:false})
var admin_user = mongoose.model('admin_user',schema);

module.exports = admin_user