const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const User = require('./../modal/user')
const LocalDiary = require('./../modal/localdiary')
const {Storage} = require('@google-cloud/storage');
const Putdown = require('./../modal/putdown')
const follow = require('../modal/follow')

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

app.post('/findDiaryInPin',async(req,res)=>{
    const{token,pin,lag,lng} = req.body
    try {
        var id = jwt.verify(token,'password'); 
        var putdownDiary = await Putdown.aggregate([{$match:{marker_id:pin,lag,lng
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
        }])
        var putdownOwnDiary = await Putdown.aggregate([{$match:{marker_id:pin,lag,lng
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
        }])
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
        res.json(result)
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
   
})

module.exports = app