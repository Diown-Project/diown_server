const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const User = require("./../modal/user");
const Sup = require("./../modal/support");
app.post("/add", async (req, res) => {
  const { token, topic, detail } = req.body;
  date = new Date(Date.now() + 7 * (60 * 60 * 1000));
  try {
    var id = jwt.verify(token, "password");
    const user = await User.findOne({ _id: id.id });
    var supAdd = new Sup({ user_name: user.username, topic, detail, date });
    await supAdd.save();
    res.json({ message: "success" });
  } catch (e) {
    console.log(e);
    res.json({ message: "fail" });
  }
});

app.get("/findSup", async (req, res) => {
  const result = await Sup.find({});
  res.json(result);
});

app.post("/deleteSup", async (req, res) => {
  const { id } = req.body;
  try {
    await Sup.findOneAndDelete({ _id: id });
    res.json({ message: "success" });
  } catch (e) {
    console.log(e);
    res.json({ message: "error" });
  }
});

module.exports = app;
