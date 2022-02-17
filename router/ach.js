const express = require('express')
const app = express()
const User = require('./../modal/user')
const jwt = require('jsonwebtoken')
const Ach = require('./../modal/ach_base')
const Ach_success = require('../modal/ach_success')
const LocalDiary = require('./../modal/localdiary')


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

app.post('/checkSuccess4',async (req,res)=>{
    const {token,index} = req.body
    try {
        var id = jwt.verify(token,'password'); 
        const user = await User.findOne({_id : id.id});
        const success = await Ach_success.findOne({user_id:user.id,ach_id:index})
        if(success){
            res.json({'message':'already have'})
        }else{
            var allDiary = await LocalDiary.find({user_id:user.id})
            var checkDay = {}
            for(i = 0;i < allDiary.length;i++){
                var d = allDiary[i]['date'].getDate() +'-'+ (allDiary[i]['date'].getMonth()+1) + '-' + allDiary[i]['date'].getFullYear()
                if(!(d in checkDay)){
                    checkDay[d] = 1
                }else{
                    checkDay[d] += 1
                }
            }
            // console.log(checkDay)
            // console.log(Object.keys(checkDay).length)
            var len = Object.keys(checkDay).length
            if(len >= 7){
                var Ach = new Ach_success({user_id:user.id,ach_id:index})
                await Ach.save()
                res.json({'message':'success'})
            }else{
                res.json({'message':'not now'})
            }
        }
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})


app.post('/checkSuccess9',async (req,res)=>{
    const{token,index} = req.body
    try {
        var id = jwt.verify(token,'password'); 
        const user = await User.findOne({_id : id.id});
        const success = await Ach_success.findOne({user_id:user.id,ach_id:index})
        if(success){
            res.json({'message':'already have'})
        }else{
            var allDiary = await LocalDiary.find({user_id:user.id})
            var checkDay = {}
            for(i = 0;i < allDiary.length;i++){
                var d = allDiary[i]['date'].getDate() +'-'+ (allDiary[i]['date'].getMonth()+1) + '-' + allDiary[i]['date'].getFullYear()
                if(!(d in checkDay)){
                    checkDay[d] = 1
                }else{
                    checkDay[d] += 1
                }
            }
            var len = Object.keys(checkDay).length
            if(len >= 30){
                var Ach = new Ach_success({user_id:user.id,ach_id:index})
                await Ach.save()
                res.json({'message':'success'})
            }else{
                res.json({'message':'not now'})
            }
        }
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

module.exports = app