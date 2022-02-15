const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const User = require('./../modal/user')
const LocalDiary = require('./../modal/localdiary')
const {Storage} = require('@google-cloud/storage');

app.post('/saveDiary',async(req,res)=>{
    const {token,imageLocation,topic,detail,mood_emoji,mood_detail,activity,favorite} = req.body
    var date = new Date(Date.now() + 7 * (60 * 60 * 1000) );
    try {
        var id = jwt.verify(token,'password');
        var diary = new LocalDiary({user_id:id.id,imageLocation,topic,detail,mood_emoji,mood_detail,activity,date,favorite})
        await diary.save()
        res.json({'message':"success"})
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
} )

app.post('/findAllDiary',async(req,res)=>{
    const {token} = req.body
    try {
        var id = jwt.verify(token,'password');
        var diary = await LocalDiary.find({'user_id':id.id})
        res.json(diary)
    } catch (e) {
        res.json({'message':'error'})
    }
})

app.post('/findAllDiaryHaveImage',async(req,res)=>{
    const {token} = req.body
    try {
        var id = jwt.verify(token,'password');
        var diary = await LocalDiary.find({'user_id':id.id,'imageLocation': {$ne:null}})       
        res.json(diary)
    } catch (e) {
        res.json({'message':'error'})
    }
})

app.post('/findPicDiaryWithSearch',async(req,res)=>{
    const{token,value} = req.body
    var diary_check_again =[]
    var diary2 = []
    
    try {
        var id = jwt.verify(token,'password');
        var diary_check = await LocalDiary.find({user_id:id.id,'imageLocation': {$ne:null}})
        if(value != ''){
            for(i = 0 ;i<diary_check.length;i++){
                if(diary_check[i]['date'].toISOString().toLowerCase().includes(value)){
                    diary_check_again.push(diary_check[i])
                }
            }
        }else if(value == ''){
            diary2 = await LocalDiary.find({'user_id':id.id,'topic':null,'imageLocation': {$ne:null}})
        }else{}
        var diary = await LocalDiary.find({$or:[{'user_id':id.id,topic:{"$regex": new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),'i')},'imageLocation': {$ne:null}}]}) 
        for(i=0;i < diary_check_again.length ;i++){
            if(diary.indexOf(diary_check_again[i]) == -1){
                diary.push(diary_check_again[i])
            }else{
                
            }
        }
        for(i=0;i < diary2.length ;i++){
            if(diary.indexOf(diary2[i]) == -1){
                diary.push(diary2[i])
            }else{
                
            }
        }
        res.json(diary)
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

app.post('/findDetail',async(req,res)=>{
    try {
        const {id} = req.body
        var result = await LocalDiary.findOne({_id:id})
        
        res.json(result)
    } catch (e) {
        console.log(e)
        res.json({'message':'This diary was deleted.'})
    }
})

app.post('/fav',async(req,res)=>{
    const {id,fav} = req.body
    await LocalDiary.findOneAndUpdate({_id:id},{favorite:fav})
    res.json({'message':'success'})
})

app.post('/favSearch',async(req,res)=>{
    const {token,value} = req.body
    var diary_check_again =[]
    try {
        var id = jwt.verify(token,'password');
        var diary_check = await LocalDiary.find({user_id:id.id,favorite:true})
        if(value != ''){
            for(i = 0 ;i<diary_check.length;i++){
                if(diary_check[i]['date'].toISOString().toLowerCase().includes(value)){
                    diary_check_again.push(diary_check[i])
                }
            }
        }else{}
        var diary = await LocalDiary.find({$or:[{'user_id':id.id,favorite:true,topic:{"$regex": new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),'i')}},
        {'user_id':id.id,favorite:true,mood_detail:{"$regex": new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),'i')}}
        ,{'user_id':id.id,favorite:true,activity:{"$regex": new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),'i')}}]})
        for(i=0;i < diary_check_again.length ;i++){
            if(diary.indexOf(diary_check_again[i]) == -1){
                diary.push(diary_check_again[i])
            }else{
                
            }
        }
    console.log(diary_check_again.length)
    console.log(diary.length)
    res.json(diary)
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})


app.post('/deleteLocalDiary',async(req,res)=>{
    try {
        const{diary} = req.body
        
        const storage = new Storage({projectId:'images-322604', keyFilename:'./assets/credentials.json'});
        var result = await LocalDiary.findOneAndDelete({_id:diary['_id']})
        const bucketName = 'noseason';
        if(diary['imageLocation'] != null){
            for(i =0 ;i< diary['imageLocation'].length;i++){
                await storage.bucket(bucketName).file(diary['imageLocation'][i]).delete();
            }
        }
        
        res.json({'message':'success'}) 
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
    
})

app.post('/update',async(req,res)=>{
    const{id, mood_emoji, mood_detail, activity, imageLocation, topic,detail,imageOld} =req.body
    // console.log(imageLocation)
    // console.log(imageLocation != '')
    try {
        const storage = new Storage({projectId:'images-322604', keyFilename:'./assets/credentials.json'});
        var bucketName = 'noseason'
        var checkOldImage = await LocalDiary.findOne({_id:id})
        if(checkOldImage['imageLocation'] != null){
            
            for(i=0;i < checkOldImage['imageLocation'].length;i++){
                if(!imageOld.includes(checkOldImage['imageLocation'][i])){
                    await storage.bucket(bucketName).file(checkOldImage['imageLocation'][i]).delete();
                }
            }
        }
        
        // await LocalDiary.findOneAndUpdate({_id:id},{imageLocation:imageOld})
        if(imageLocation != null){
            if(imageOld != null){
                var resultDiary = [...imageOld,...imageLocation]
            }else{
                var resultDiary = imageLocation
            }
            if(resultDiary.length == 0){
                await LocalDiary.findOneAndUpdate({_id:id},{imageLocation:null,topic:topic,detail:detail,
                    mood_emoji:mood_emoji,mood_detail:mood_detail,activity:activity})
                res.json({'message':'success'}) 
            }else{
                await LocalDiary.findOneAndUpdate({_id:id},{imageLocation:resultDiary,topic:topic,detail:detail,
                    mood_emoji:mood_emoji,mood_detail:mood_detail,activity:activity})
                res.json({'message':'success'})
            }          
            
        }else{
            if(imageOld == null){
                await LocalDiary.findOneAndUpdate({_id:id},{imageLocation:null,topic:topic,detail:detail,
                    mood_emoji:mood_emoji,mood_detail:mood_detail,activity:activity})
                res.json({'message':'success'})
            }
            if(imageOld.length == 0){
                await LocalDiary.findOneAndUpdate({_id:id},{imageLocation:null,topic:topic,detail:detail,
                    mood_emoji:mood_emoji,mood_detail:mood_detail,activity:activity})
                res.json({'message':'success'})  
            }else{
                await LocalDiary.findOneAndUpdate({_id:id},{imageLocation:imageOld,topic:topic,detail:detail,
                    mood_emoji:mood_emoji,mood_detail:mood_detail,activity:activity})
                res.json({'message':'success'})
            }  
            
        }
        
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})


app.post('/findAllFav',async(req,res)=>{
    const {token} = req.body
    try {
        var id = jwt.verify(token,'password');
        var diary = await LocalDiary.find({'user_id':id.id,'favorite':true})
        res.json(diary)
    } catch (e) {
        console.log(e)
        res.json([{'message':'error'}])
    }
})

module.exports = app;