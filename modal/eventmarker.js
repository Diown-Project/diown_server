const express = require('express')
const app = express()
const mongoose = require('mongoose')

var schema = mongoose.Schema({marker_id:'string',imageLocation:'string',topic:'string'
,lag:'number',lng:'number',start_date:'date',end_date:'date',detail:'string'}
,{ timestamps:false,versionKey:false})
var event_marker = mongoose.model('event_marker',schema);

module.exports = event_marker