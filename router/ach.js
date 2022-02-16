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

app.post('/checkSuccess',async(req,res)=>{
    const{token,index} = req.body
    try {
        var id = jwt.verify(token,'password'); 
        const user = await User.findOne({_id : id.id});
        const success = await Ach_success.findOne({user_id:user.id,ach_id:index})
        if(success){
            res.json({'message':'already have'})
        }else{
            var Ach = new Ach_success({user_id:user.id,ach_id:index})
            await Ach.save()
            res.json({'message':'success'})
        }
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

module.exports = app