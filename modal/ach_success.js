const express = require('express')
const app = express()
const mongoose = require('mongoose')

var schema = mongoose.Schema({user_id:'string',ach_id:'number'},{ timestamps:false,versionKey:false})
var Ach_success = mongoose.model('achievement_success',schema)

module.exports = Ach_success