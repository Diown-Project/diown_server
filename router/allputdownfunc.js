const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const User = require('./../modal/user')
const {Storage} = require('@google-cloud/storage');
const Putdown = require('./../modal/putdown')
const follow = require('../modal/follow')
const user_marker = require('./../modal/usermarker')
const Like = require('../modal/like')

app.post('/saveDiary',async (req,res) =>{
    const {token,imageLocation,topic,detail,mood_emoji,mood_detail,activity,like,marker_id,status} = req.body
    var date = new Date(Date.now() + 7 * (60 * 60 * 1000) );
    try {
        var id = jwt.verify(token,'password');
        var user = await User.findOneAndUpdate({_id:id.id},{$inc : {'putdown_num' : 1}})
        var diary = new Putdown({user_id:id.id,imageLocation,topic,detail,mood_emoji,mood_detail,activity,date,like,marker_id,status})
        await diary.save()
        res.json({'message':'success'})
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

app.post('/findDiaryInPin',async(req,res)=>{
    const{token,pin} = req.body
    try {
        var id = jwt.verify(token,'password'); 
        var putdownDiary = await Putdown.aggregate([{$match:{marker_id:pin
            ,$or:[{status:'Public'},{status:'Follower'}],user_id:{$nin:[id.id]}}},{
            $lookup:{
                from: 'users',
                let: { pid: "$user_id" },
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
        }]).sort({date:-1})
        var putdownOwnDiary = await Putdown.aggregate([{$match:{marker_id:pin
            ,user_id:id.id}},{
            $lookup:{
                from: 'users',
                let: { pid: "$user_id" },
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
        }]).sort({date:-1})
        var followToList = []
        var distinctFollow = await follow.find({following_by:id.id})
        for(i = 0;i < distinctFollow.length;i++){
            followToList.push(distinctFollow[i]['target'])
        }
        // console.log(followToList[0]==putdownDiary[0]['user_detail'][0]['_id'])
        var resultForFollowing = []
        for(i=0;i < putdownDiary.length;i++){
            if(followToList.includes(putdownDiary[i]['user_detail'][0]['_id'].toString())){
                resultForFollowing.push(putdownDiary[i])
            }
        }
        for(i = 0;i < resultForFollowing.length;i++){
            var index = putdownDiary.indexOf(resultForFollowing[i])
            putdownDiary.splice(index,1)
        }
        var result = [[...putdownDiary],[...resultForFollowing],[...putdownOwnDiary]]
        // console.log(putdownOwnDiary)
        res.json(result)
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
   
})

app.post('/addPin',async(req,res)=>{
    const {token,pin,lag,lng} = req.body
    try {
        var id = jwt.verify(token,'password'); 
        var checkMarker = await user_marker.findOne({lag,lng})
        if(checkMarker){
            res.json({'message':'already have'})
        }else{
            var addPin = new user_marker({user_id:id.id,marker_id:pin,lag,lng})
            await addPin.save()
            res.json({'message':'success'})
        }
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

app.get('/findAllMarker',async (req,res)=>{
    var result = await user_marker.find({})
    res.json(result)
})

app.post('/findAllOwnMarker',async(req,res)=>{
    const {token} = req.body
    
    try {
        var id = jwt.verify(token,'password'); 
        var ownMarker = await user_marker.find({user_id:id.id}).lean() // ใช้ในการ convert จาก mongoose เป็น object เพื่อเอาไป add หรือทำงานต่อ
        for(i = 0;i<ownMarker.length;i++){
            var countNum = await Putdown.count({marker_id:ownMarker[i]['_id']
            ,lag:ownMarker[i]['lag'],lng:ownMarker[i]['lng']})
            ownMarker[i]['number_putdown'] = countNum
        }
        
        res.json(ownMarker)
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

app.post('/findDetail',async (req,res)=>{
    try {
        const {id} = req.body
        var result = await Putdown.findOne({_id:id})
        res.json(result)
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

app.post('/deletePutdownDiary',async (req,res)=>{
    const {token,diary} = req.body
    try {
        var id = jwt.verify(token,'password'); 
        var result = await Putdown.findOneAndDelete({_id:diary['_id']})
        var user = await User.findOneAndUpdate({_id:id.id},{$inc : {'putdown_num' : -1}})
        await Like.deleteMany({'diary_id':diary['_id']})
        const bucketName = 'noseason';
        const storage = new Storage({projectId:'images-322604', keyFilename:'./assets/credentials.json'});
        if(result['imageLocation'] != null){
            for(i =0 ;i< result['imageLocation'].length;i++){
                await storage.bucket(bucketName).file(diary['imageLocation'][i]).delete();
            }
        }
        res.json({'message':'success'}) 
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

app.post('/deletePin',async(req,res)=>{
    const {id} = req.body
    try {
        await user_marker.findOneAndDelete({_id:id})
        var putdownDiary = await Putdown.find({marker_id:id})
        const bucketName = 'noseason';
        const storage = new Storage({projectId:'images-322604', keyFilename:'./assets/credentials.json'});
        // console.log(putdownDiary[0]['imageLocation'].length)
        for(i = 0;i < putdownDiary.length;i++){
            var user = await User.findOneAndUpdate({_id:putdownDiary[i]['user_id']},{$inc : {'putdown_num' : -1}})
            await Like.deleteMany({'diary_id':putdownDiary[i]['_id']})
        }
        for(i = 0;i < putdownDiary.length;i++){
            if(putdownDiary[i]['imageLocation'] != null){
                for(j =0 ;j< putdownDiary[i]['imageLocation'].length;j++){
                    await storage.bucket(bucketName).file(putdownDiary[i]['imageLocation'][j]).delete();
                    // console.log(putdownDiary[i]['imageLocation'][j])
                }
            }
        }
        for(i = 0;i <putdownDiary.length;i++){
            var c = await Putdown.findByIdAndDelete({_id:putdownDiary[i]['_id']})
        }
        res.json({'message':'success'}) 
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
    

})

app.post('/addLike',async(req,res)=>{
    const {token,diary_id} = req.body
    try {
        var id = jwt.verify(token,'password');
        var addLike = new Like({diary_id:diary_id,like_by:id.id});
        await addLike.save()
        var diary = await Putdown.findOneAndUpdate({'_id':diary_id},{$inc:{'like':1}})
        res.json({'message':'success'})
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

app.post('/removeLike',async(req,res)=>{
    const {token,diary_id} = req.body
    try {
        var id = jwt.verify(token,'password');
        var del = await Like.findOneAndDelete({diary_id:diary_id,like_by:id.id})
        var diary = await Putdown.findOneAndUpdate({'_id':diary_id},{$inc:{'like': -1}})
        res.json({'message':'success'})
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

app.post('/checkLike',async(req,res)=>{
    const {token,diary_id} = req.body
    try {
        var id = jwt.verify(token,'password');
        var check = await Like.find({diary_id:diary_id,like_by:id.id})
        if(check.length == 0){
            res.json({'message':'false'})
        }else{
            res.json({'message':'true'})
        }
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

module.exports = app