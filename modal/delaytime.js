const express = require('express')
const app = express()
const mongoose = require('mongoose')

var schema = mongoose.Schema({user_id:'string',date:'date'},{ timestamps:false,versionKey:false})
var delay = mongoose.model('delaytime',schema);

module.exports = delay