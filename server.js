const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('./modal/user')
const auth = require('./router/auth')
const acti = require('./router/acti')
const sup = require('./router/sup')
const localDiary = require('./router/diarylocalrouter')
const Ach = require('./router/ach')
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
async function connectDB() {
    await mongoose.connect('mongodb+srv://noseason:non0814958847@cluster0.4ejho.mongodb.net/SE_project?retryWrites=true&w=majority',
    { useUnifiedTopology: true , useNewUrlParser: true })
    console.log('DB connect')
    
}
// var c = Date(new Date().toUTCString())
// console.log(c)
// var now = new Date();
// var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
// console.log(Date().toString())
console.log('asd')
console.log(Date.now())
console.log(new Date(Date.now() + 7 * (60 * 60 * 1000) ))

app.use('/auth',auth)
app.use('/activity',acti)
app.use('/localDiary',localDiary)
app.use('/support',sup)
app.use('/achievement',Ach)


app.get('/test',async (req,res)=>{
    const name = await User.find({_id:'61c6eb303968929ed9fecad8'})
    res.json(name)
})

app.get('/',(req,res)=>{res.send('Hello world')})

connectDB()
app.listen(process.env.PORT || 3000,()=>console.log('sever test port 3000 already start.'))

// const bucketName = 'noseason';
// const filePath = '../SE_app_project/diown/images/non.jpg'
// const destFileName = 'nonja';
// const {Storage} = require('@google-cloud/storage');
// const storage = new Storage({projectId:'images-322604', keyFilename:'./assets/credentials.json'});
// async function uploadFile() {
//   await storage.bucket(bucketName).upload(filePath, {
//     destination: destFileName,'contentType': 'image/jpeg'
//   });

//   console.log(`${filePath} uploaded to ${bucketName}`);
// }

// uploadFile().catch(console.error);