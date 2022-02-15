const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const User = require('./../modal/user')
const Sup = require('./../modal/support')
app.post('/add',async(req,res)=>{
    const {token,topic,detail} = req.body
    date = new Date(Date.now() + 7 * (60 * 60 * 1000) );
    try {
        var id = jwt.verify(token,'password'); 
        const user = await User.findOne({_id : id.id});
        var supAdd = new Sup({user_name:user.username,topic,detail,date})
        await supAdd.save()
        res.json({'message':'success'})
    } catch (e) {
        console.log(e)
        res.json({'message':'fail'})
    }
})


module.exports = app