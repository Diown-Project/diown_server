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

app.post('/checkFollowing',async(req,res)=>{
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

app.post('/follower',async(req,res)=>{
    const {token} = req.body
    try {
        var id = jwt.verify(token,'password');  
        var Follower = await follow.aggregate([{$match:{target:id.id}},{
            $lookup:{
                from: 'users',
                let: { pid: "$following_by" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", { $toObjectId: "$$pid" }]
                            }
                        }
                    }
                ],
                as:'user_detail'
            }
        }])
        res.json(Follower)
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

app.post('/checkAllRequest',async(req,res)=>{
    const {token} = req.body
    try {
        var id = jwt.verify(token,'password');
        var allRequest = await followRequest.aggregate([{$match:{target:id.id}},{
            $lookup:{
                from: 'users',
                let: { pid: "$request_by" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", { $toObjectId: "$$pid" }]
                            }
                        }
                    }
                ],
                as:'user_detail'
            }
        }])
        res.json(allRequest)
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
    
})

app.post('/removeRequest',async(req,res)=>{
    const {token,request_by} = req.body
    try {
        var id = jwt.verify(token,'password'); 
        var del = await followRequest.findOneAndDelete({target:id.id,request_by:request_by})
        res.json({'message':'success'})
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
    
})

app.post('/addFollow',async(req,res)=>{
    const {target,request_by} = req.body
    try {
        var id = jwt.verify(target,'password'); 
        var del1 = await followRequest.findOneAndDelete({target:id.id,request_by:request_by})
        var addFollow = new follow({target:id.id,following_by:request_by})
        await addFollow.save()
        await User.findOneAndUpdate({_id:id.id},{$inc : {'follower_num' : 1}})
        await User.findOneAndUpdate({_id:request_by},{$inc:{'following_num': 1}})
        res.json({'message':'success'})
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

app.post('/deleteFollower',async(req,res)=>{
    const {target,following_by} = req.body
    try {
        var id = jwt.verify(target,'password'); 
        var del2 = await follow.findOneAndDelete({target:id.id,following_by:following_by})
        await User.findOneAndUpdate({_id:id.id},{$inc : {'follower_num' : -1}})
        await User.findOneAndUpdate({_id:following_by},{$inc:{'following_num': -1}})
        res.json({'message':'success'})
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

app.post('/deleteFollowing',async(req,res)=>{
    const {token,target} = req.body
    try {
        var id = jwt.verify(token,'password');
        console.log('asd')
        var del2 = await follow.findOneAndDelete({target:target,following_by:id.id})
        await User.findOneAndUpdate({_id:id.id},{$inc : {'following_num' : -1}})
        await User.findOneAndUpdate({_id:target},{$inc:{'follower_num': -1}})
        res.json({'message':'success'})
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})




module.exports = app