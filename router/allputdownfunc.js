const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const User = require('./../modal/user')
const LocalDiary = require('./../modal/localdiary')
const {Storage} = require('@google-cloud/storage');
const Putdown = require('./../modal/putdown')

app.post('/saveDiary',async (req,res) =>{
    const {token,imageLocation,topic,detail,mood_emoji,mood_detail,activity,like,marker_id,lag,lng,status} = req.body
    var date = new Date(Date.now() + 7 * (60 * 60 * 1000) );
    try {
        var id = jwt.verify(token,'password');
        var diary = new Putdown({user_id:id.id,imageLocation,topic,detail,mood_emoji,mood_detail,activity,date,like,marker_id,lag,lng,status})
        await diary.save()
        res.json({'message':'success'})
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

module.exports = app