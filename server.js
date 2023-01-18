const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./modal/user");
const auth = require("./router/auth");
const acti = require("./router/acti");
const sup = require("./router/sup");
const localDiary = require("./router/diarylocalrouter");
const Ach = require("./router/ach");
const mood_router = require("./router/moodemoji.js");
const Putdown = require("./router/allputdownfunc");
const followRouter = require("./router/followrouter");
const delay = require("./router/delayrouter");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
async function connectDB() {
  await mongoose.connect(
    "mongodb+srv://<Username>:<Password>@cluster0.r1ldq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useUnifiedTopology: true, useNewUrlParser: true }
  );
  console.log("DB connect");
}
// var date = new Date(Date.now() + 7 * (60 * 60 * 1000));
// date.setDate(date.getDate());
// var date2 = new Date(Date.now() + 7 * (60 * 60 * 1000));
// date2.setDate(date2.getDate() - 30);
// console.log(date.getTime());
// console.log(date2.getTime());

// console.log(date)
// console.log(date2)

// console.log(date < date2)
// mongodb+srv://noseason2543:Non0814958847@cluster0.r1ldq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
//mongodb+srv://noseason:non0814958847@cluster0.4ejho.mongodb.net/SE_project?retryWrites=true&w=majority
// var c = Date(new Date().toUTCString())
// console.log(c)
// var now = new Date();
// var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
// console.log(Date().toString())

// console.log('asd')
// console.log(Date.now())
// var date = new Date(Date.now() + 7 * (60 * 60 * 1000) )
// date.setDate(date.getDate()+1)
// console.log(date.toUTCString())

// const maxSpeed = {
//     car: 300,
//     bike: 60,
//     motorbike: 200,
//     airplane: 1000,
//     helicopter: 400,
//     rocket: 8 * 60 * 60
// };

// const sortable = Object.entries(maxSpeed)
//     .sort(([,a],[,b]) => a-b)
//     .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

// console.log(sortable);

app.use("/auth", auth);
app.use("/activity", acti);
app.use("/localDiary", localDiary);
app.use("/support", sup);
app.use("/achievement", Ach);
app.use("/mood_router", mood_router);
app.use("/putdown", Putdown);
app.use("/follow", followRouter);
app.use("/delay", delay);

app.get("/test", async (req, res) => {
  const name = await User.find({ _id: "61c6eb303968929ed9fecad8" });
  res.json(name);
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

connectDB();
app.listen(process.env.PORT || 3001, () =>
  console.log("sever test port 3001 already start.")
);

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
