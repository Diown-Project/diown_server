const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const User = require('./../modal/user')
const LocalDiary = require('./../modal/localdiary')
const {Storage} = require('@google-cloud/storage');
const follow = require('./../modal/follow')
const followRequest = require('./../modal/followrequest')

app.post('/test',async(req,res)=>{
    const {target,following_by} = req.body
    var followCollection = new follow({target,following_by})
    await followCollection.save()
    res.json({'message':'success'})
})

app.post('/checkFollow',async(req,res)=>{
    const {token,target_id} = req.body
    try { 
        var id = jwt.verify(token,'password'); 
        var checkFollow = await follow.find({target:target_id,following_by:id.id})
        if(checkFollow.length != 0){
            res.json({'message':'true'})
        }else{
            res.json({'message':'false'})
        }
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})


app.post('/checkRequest',async(req,res)=>{
    const {token,target_id} = req.body
    try {
        var id = jwt.verify(token,'password'); 
        var check = await followRequest.findOne({target:target_id,request_by:id.id})
        if(check == null){
            res.json({'message':'false'})
        }else{
            res.json({'message':'true'})
        }
        
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

app.post('/addRequest',async(req,res)=>{
    const {token,target_id} = req.body
    try {
        var id = jwt.verify(token,'password'); 
        var check = await followRequest.findOne({target:target_id,request_by:id.id})
        if(check == null){
            var newRequest = new followRequest({target:target_id,request_by:id.id})
            await newRequest.save()
            res.json({'message':'success'})
        }else{
            res.json({'message':'success'})
        }
        
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

app.post('/deleteRequest',async(req,res)=>{
    const {token,target_id} = req.body
    try {
        var id = jwt.verify(token,'password'); 
        var check = await followRequest.findOne({target:target_id,request_by:id.id})
        if(check == null){
            res.json({'message':'success'})
        }else{
            var findDel = await followRequest.findOneAndDelete({target:target_id,request_by:id.id})
            res.json({'message':'success'})
        }
        
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})





module.exports = app