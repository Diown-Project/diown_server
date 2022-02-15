const express = require('express')
const app = express()
const mongoose = require('mongoose')

var schema = mongoose.Schema({user_id:'string',imageLocation:'array',topic:'string',detail:'string',
mood_emoji:'string',mood_detail:'string',activity:'string',date:'date',favorite:'bool'},{ timestamps:false,versionKey:false})
var LocalDiary = mongoose.model('LocalDiary',schema);

module.exports = LocalDiary