const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const User = require('./../modal/user')
const LocalDiary = require('./../modal/localdiary')
const {Storage} = require('@google-cloud/storage');
const follow = require('./../modal/follow')
app.post('/test',async(req,res)=>{
    const {target,following_by} = req.body
    var followCollection = new follow({target,following_by})
    await followCollection.save()
    res.json({'message':'success'})
})
module.exports = app