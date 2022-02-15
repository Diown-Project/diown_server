const express = require('express')
const app = express()
const Activity = require('./../modal/activity')
const User = require('./../modal/user')
const jwt = require('jsonwebtoken')

app.post('/add',async (req,res)=>{
    const {token,activity_emoji,activity_detail} = req.body
    try {
        var id = jwt.verify(token,'password');
        console.log(id)
        var act = new Activity({user:id.id,activity_emoji,activity_detail})
        await act.save()
        res.json({'message':"success"})
    } catch (error) {
        res.json({'message':'error'})
    }
    
})

app.post('/remove',async(req,res)=>{
    const {token,act_emo,act_detail} = req.body
    try {
        var id = jwt.verify(token,'password'); 
        await Activity.findOneAndRemove({id:id,activity_emoji:act_emo,activity_detail:act_detail})
        res.json({'message':'success'})
    } catch (e) {
        res.json({'message':'error'})
    }
})

app.post('/allActivity',async(req,res)=>{
    const {token} = req.body
    const actInit = await Activity.find({user:'0'})
    try {
        var id = jwt.verify(token,'password'); 
        const user = await User.findOne({_id : id.id});
        const yourAct = await Activity.find({user:user._id})
        if(yourAct == ''){
            res.json(actInit)
        }else{
            const result = [...actInit,...yourAct]
            res.json(result)
        }    
    } catch (e) {
        res.json([{'message':'error'}])
    }
    
})

app.post('/onlyYourActivity',async (req,res)=>{
    const {token} = req.body
    try {
        var id = jwt.verify(token,'password'); 
        const user = await User.findOne({_id : id.id});
        const yourAct = await Activity.find({user:user._id})
        if(yourAct == '' || yourAct == null){
            console.log(yourAct)
            res.json(null)
        }else{
            res.json(yourAct)
        }     
    } catch (e) {
        console.log(e)
        res.json([{'message':'error'}])
    }
})

module.exports = app;
