const express = require('express')
const app = express()
const mongoose = require('mongoose')

var schema = mongoose.Schema({username:'string',email:'string'
,password:'string',following_num: "number",follower_num:"number",putdown_num:"number",profile_image:"string",bio:"string"},{ timestamps:false,versionKey:false})
var User = mongoose.model('User',schema);

module.exports = User