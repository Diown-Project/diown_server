const express = require('express')
const app = express()
const mongoose = require('mongoose')

var schema = mongoose.Schema({user_id:'string',imageLocation:'array',topic:'string',detail:'string',mood_emoji:'string'
,mood_detail:'string',activity:'string',date:'date',like:'number',marker_id:'string',status:'string',deal:'string'},{ timestamps:false,versionKey:false})
var Putdown = mongoose.model('Putdown',schema);

module.exports = Putdown