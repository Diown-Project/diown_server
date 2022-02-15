const express = require('express')
const app = express()
const User = require('./../modal/user')
const jwt = require('jsonwebtoken')
const Ach = require('./../modal/ach_base')
const Ach_success = require('../modal/ach_success')
app.get('/getAll',async(req,res)=>{
    const achievement = await Ach.find()
    res.json(achievement)
})

app.post('/allSuccess',async(req,res)=>{
    const {token} = req.body
    try {
        var id = jwt.verify(token,'password'); 
        const user = await User.findOne({_id : id.id});
        const success = await Ach_success.find({user_id:user.id})
        res.json(success)
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

module.exports = app