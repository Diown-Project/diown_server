const express = require('express')
const app = express()
const mongoose = require('mongoose')
var schema = mongoose.Schema({user_id : 'string',topic: 'string',detail:'string',date:'date'}
,{timestamps:false,versionKey:false})

var support = mongoose.model('Support',schema)

module.exports = support;