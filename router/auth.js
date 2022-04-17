const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./../modal/user");
const { Storage } = require("@google-cloud/storage");
const admin = require("./../modal/admin");
const LocalDiary = require("./../modal/localdiary");
const Ach_success = require("../modal/ach_success");
const Activity = require("./../modal/activity");
const Putdown = require("./../modal/putdown");
const Like = require("../modal/like");
const delay = require("./../modal/delaytime");
const follow = require("./../modal/follow");
const followRequest = require("./../modal/followrequest");
const user_marker = require("./../modal/usermarker");

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const check_username = await User.findOne({ username: username });
  if (check_username) {
    res.json({ msg: "This username already use pls try again" });
  } else {
    const check_email = await User.findOne({ email: email });
    if (check_email) {
      res.json({ msg: "This email already use pls try again" });
    } else {
      const follower_num = 0;
      const following_num = 0;
      const putdown_num = 0;
      const profile_image = "person.png";
      const bio = null;
      const passwordHash = bcrypt.hashSync(password, 10);
      var user = new User({
        username,
        email,
        password: passwordHash,
        follower_num,
        following_num,
        putdown_num,
        profile_image,
        bio,
      });
      await user.save();
      res.json({ msg: "success" });
    }
  }
});

app.post("/signUpAdmin", async (req, res) => {
  const { username, password } = req.body;
  const check_username = await admin.findOne({ username: username });
  if (check_username) {
    res.json({ message: "This email already use pls try again" });
  } else {
    const passwordHash = bcrypt.hashSync(password, 10);
    var adminSave = new admin({ username, password: passwordHash });
    await adminSave.save();
    res.json({ message: "success" });
  }
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (user) {
    const check_password = bcrypt.compareSync(password, user.password);
    if (check_password) {
      const token = jwt.sign({ id: user._id }, "password", {
        expiresIn: "365 Days",
      });
      res.json({ msg: "success", token: token });
    } else {
      res.json({ msg: "Your email or password is wrong." });
    }
  } else {
    res.json({ msg: "Your email or password is wrong." });
  }
});

app.post("/findUser", async (req, res) => {
  const { id } = req.body;
  var user = await User.findOne({ _id: id });
  res.json(user);
});

app.post("/rememberMe", async (req, res) => {
  const { token } = req.body;
  try {
    var id = jwt.verify(token, "password");
    const user = await User.findOne({ _id: id.id });
    res.json(user);
  } catch (e) {
    console.log(e);
    res.json(null);
  }
});

app.post("/rememberMeAdmin", async (req, res) => {
  const { token } = req.body;
  try {
    var id = jwt.verify(token, "password");
    const result = await admin.findOne({ _id: id.id });
    res.json(result);
  } catch (e) {
    console.log(e);
    res.json(null);
  }
});

app.post("/update", async (req, res) => {
  var { token, username, bio, profile_image } = req.body;
  if (profile_image != null) {
    var proimg = profile_image[0];
  }
  if (bio == "") {
    bio = null;
  }
  try {
    var id = jwt.verify(token, "password");
    const storage = new Storage({
      projectId: "images-322604",
      keyFilename: "./assets/credentials.json",
    });
    const bucketName = "noseason";
    const user = await User.findOne({ _id: id.id });
    const checkUser = await User.find({ username: username });

    if (username == user.username) {
      if (profile_image != null) {
        if (user.profile_image != "person.png") {
          await storage.bucket(bucketName).file(user.profile_image).delete();
        }
        await User.findOneAndUpdate(
          { _id: user.id },
          { username: username, bio: bio, profile_image: proimg }
        );
        res.json({ message: "success" });
      } else {
        await User.findOneAndUpdate({ _id: user.id }, { username, bio });
        res.json({ message: "success" });
      }
    } else {
      if (checkUser.length != 0) {
        res.json({ message: "Username is already used." });
      } else {
        if (profile_image != null) {
          if (user.profile_image != "person.png") {
            await storage.bucket(bucketName).file(user.profile_image).delete();
          }
          await User.findOneAndUpdate(
            { _id: user.id },
            { username: username, bio: bio, profile_image: proimg }
          );
          res.json({ message: "success" });
        } else {
          await User.findOneAndUpdate({ _id: user.id }, { username, bio });
          res.json({ message: "success" });
        }
      }
    }
  } catch (e) {
    console.log(e);
    res.json({ message: "error" });
  }
});

app.post("/adminLogin", async (req, res) => {
  const { username, password } = req.body;
  const user = await admin.findOne({ username: username });
  if (user) {
    const check_password = bcrypt.compareSync(password, user.password);
    if (check_password) {
      const token = jwt.sign({ id: user._id }, "password", {
        expiresIn: "365 Days",
      });
      res.json({ message: "success", token: token });
    } else {
      res.json({ message: "Your email or password is wrong." });
    }
  } else {
    res.json({ message: "Your email or password is wrong." });
  }
});

app.get("/allUser", async (req, res) => {
  var result = await User.find({});
  res.json(result);
});

app.post("/deleteUser", async (req, res) => {
  const { id } = req.body;
  const bucketName = "noseason";
  const storage = new Storage({
    projectId: "images-322604",
    keyFilename: "./assets/credentials.json",
  });
  const user = await User.findOne({ _id: id });
  if (user.profile_image === "person.png") {
    console.log("person");
  } else {
    console.log("not person");
    await storage.bucket(bucketName).file(user.profile_image).delete();
  }
  const findLocalDiary = await LocalDiary.find({ user_id: id });
  for (i = 0; i < findLocalDiary.length; i++) {
    if (findLocalDiary[i]["imageLocation"] != null) {
      for (j = 0; j < findLocalDiary[i]["imageLocation"].length; j++) {
        await storage
          .bucket(bucketName)
          .file(findLocalDiary[i]["imageLocation"][j])
          .delete();
      }
    }
  }
  await LocalDiary.deleteMany({ user_id: id });
  await Activity.deleteMany({ user: user._id });
  await Ach_success.deleteMany({ user_id: id });

  const findAllPutdown = await Putdown.find({ user_id: id });
  for (i = 0; i < findAllPutdown.length; i++) {
    await Like.deleteMany({ diary_id: findAllPutdown[i]._id });
    const updateUser = await User.findOneAndUpdate(
      { _id: findAllPutdown[i]["user_id"] },
      { $inc: { putdown_num: -1 } }
    );
  }
  for (i = 0; i < findAllPutdown.length; i++) {
    if (findAllPutdown[i]["imageLocation"] != null) {
      for (j = 0; j < findAllPutdown[i]["imageLocation"].length; j++) {
        await storage
          .bucket(bucketName)
          .file(findAllPutdown[i]["imageLocation"][j])
          .delete();
      }
    }
  }
  await Putdown.deleteMany({ user_id: id });
  const findDelay = await delay.findOneAndDelete({ user_id: id });
  await followRequest.deleteMany({
    $or: [{ target: id }, { request_by: id }],
  });

  const findFollowing = await follow.find({ following_by: id });

  for (i = 0; i < findFollowing.length; i++) {
    const FollowingUser = await User.findOneAndUpdate(
      {
        _id: findFollowing[i].target,
      },
      { $inc: { follower_num: -1 } }
    );
  }
  await follow.deleteMany({ following_by: id });

  const findFollower = await follow.find({ target: id });
  for (i = 0; i < findFollower.length; i++) {
    const FollowerUser = await User.findOneAndUpdate(
      {
        _id: findFollower[i].following_by,
      },
      { $inc: { following_num: -1 } }
    );
  }
  await follow.deleteMany({ target: id });

  const findAllMarker = await user_marker.find({ user_id: id });
  for (i = 0; i < findAllMarker.length; i++) {
    const putdownDiary = await Putdown.find({
      marker_id: findAllMarker[i]._id,
    });
    for (i = 0; i < putdownDiary.length; i++) {
      const UpdateUser = await User.findOneAndUpdate(
        { _id: putdownDiary[i]["user_id"] },
        { $inc: { putdown_num: -1 } }
      );
      await Like.deleteMany({ diary_id: putdownDiary[i]["_id"] });
      for (i = 0; i < putdownDiary.length; i++) {
        if (putdownDiary[i]["imageLocation"] != null) {
          for (j = 0; j < putdownDiary[i]["imageLocation"].length; j++) {
            await storage
              .bucket(bucketName)
              .file(putdownDiary[i]["imageLocation"][j])
              .delete();
          }
        }
      }
      for (i = 0; i < putdownDiary.length; i++) {
        var c = await Putdown.findByIdAndDelete({
          _id: putdownDiary[i]["_id"],
        });
      }
    }
  }
  await user_marker.deleteMany({ user_id: id });
  const delUser = await User.findOneAndDelete({ _id: id });
  res.json({ message: "success" });
});

module.exports = app;
