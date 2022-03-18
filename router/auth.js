const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('./../modal/user')
const {Storage} = require('@google-cloud/storage');

app.post('/signup',async (req,res)=>{
    const {username,email,password} = req.body
    const check_username = await User.findOne({username:username})
    if(check_username){
        res.json({msg:"This username already use pls try again"})
    }else{
        const check_email = await User.findOne({email:email})
        if(check_email){
            res.json({msg:"This email already use pls try again"})
        }else{
            const follower_num = 0
            const following_num = 0
            const putdown_num = 0
            const profile_image = 'person.png'
            const bio = null
            const passwordHash = bcrypt.hashSync(password,10)
            var user = new User({username,email,password : passwordHash,follower_num,following_num,putdown_num,profile_image,bio});
            await user.save()
            res.json({msg:"success"})
        }
    }
})

app.post('/signin',async(req,res)=>{
    const {email,password} = req.body
    const user = await User.findOne({email:email})
    if(user){
        const check_password = bcrypt.compareSync(password,user.password)
        if(check_password){
            const token = jwt.sign({id : user._id},'password',{expiresIn: '365 Days'})
            res.json({msg:'success',token:token})
        }else{
            res.json({msg:'Your email or password is wrong.'})
        }
    }else{
        res.json({msg:"Your email or password is wrong."})
    }
})

app.post('/findUser',async(req,res)=>{
    const {id} = req.body
    var user = await User.findOne({_id:id})
    res.json(user)
})

app.post('/rememberMe',async (req,res) =>{
    const {token} = req.body
    try {
        var id = jwt.verify(token,'password'); 
        const user = await User.findOne({_id : id.id});
        res.json(user)
    } catch (e) {
        console.log(e)
        res.json(null)
    }
})

app.post('/update',async(req,res)=>{
    var {token,username,bio,profile_image} = req.body
    if(profile_image != null){
        var proimg = profile_image[0]
    }
    if(bio == ''){
        bio = null
    }
    try {
        var id = jwt.verify(token,'password'); 
        const storage = new Storage({projectId:'images-322604', keyFilename:'./assets/credentials.json'});
        const bucketName = 'noseason';
        const user = await User.findOne({_id : id.id});
        const checkUser = await User.find({username:username})
        
        if(username == user.username){
            
            if(profile_image != null){
                if(user.profile_image != 'person.png'){
                    await storage.bucket(bucketName).file(user.profile_image).delete();
                }
                await User.findOneAndUpdate({_id:user.id},{'username':username,'bio':bio,'profile_image':proimg})
                res.json({'message':'success'})
            }else{
                await User.findOneAndUpdate({_id:user.id},{username,bio})
                res.json({'message':'success'})
            }
        }else{
            if(checkUser.length != 0){
                res.json({'message':'Username is already used.'})
            }else{
                
                if(profile_image != null){
                    if(user.profile_image != 'person.png'){
                        await storage.bucket(bucketName).file(user.profile_image).delete();
                    }
                    await User.findOneAndUpdate({_id:user.id},{'username':username,'bio':bio,'profile_image':proimg})
                    res.json({'message':'success'})
                }else{
                    await User.findOneAndUpdate({_id:user.id},{username,bio})
                    res.json({'message':'success'})
                }
            }  
        }   

    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
        
    }
})


app.get('/allUser',async(req,res)=>{
    var result = await User.find({})
    res.json(result)
})

module.exports = app;