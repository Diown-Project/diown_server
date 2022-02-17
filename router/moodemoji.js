const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const User = require('./../modal/user')
const LocalDiary = require('./../modal/localdiary')

app.post('/findAll',async (req,res)=>{
    
})

module.exports = app