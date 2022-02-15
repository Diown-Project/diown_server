const express = require('express')
const app = express()
const mongoose = require('mongoose')


var schema = mongoose.Schema({user:'string',activity_emoji:'string',
activity_detail:'string'},{ timestamps:false,versionKey:false})
var Activity = mongoose.model('Activity',schema);

module.exports =  Activity;