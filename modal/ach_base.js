const express = require('express')
const app = express()
const mongoose = require('mongoose')


var schema = mongoose.Schema({ach_id:'number',ach_name:'string',
ach_detail:'string',ach_color_image:'string',ach_grey_image:'string'},{ timestamps:false,versionKey:false})
var Achievement = mongoose.model('achievements',schema);

module.exports =  Achievement;