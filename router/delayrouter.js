const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const User = require("./../modal/user");
const delay = require("./../modal/delaytime");
const user_marker = require("./../modal/usermarker");
const event_marker = require("./../modal/eventmarker");

app.post("/addOrDeleteDelay", async (req, res) => {
  const { token } = req.body;
  try {
    var id = jwt.verify(token, "password");
    var date = new Date(Date.now() + 7 * (60 * 60 * 1000));
    date.setDate(date.getDate() + 1);
    var check = await delay.findOne({ user_id: id.id });
    if (check == null) {
      var add = new delay({ user_id: id.id, date: date });
      await add.save();
      res.json({ message: "add success" });
    } else {
      var date2 = new Date(Date.now() + 7 * (60 * 60 * 1000));
      if (check["date"] < date2) {
        var result = await delay.findOneAndUpdate(
          { user_id: id.id },
          { date: date }
        );
        res.json({ message: "success" });
      } else {
        res.json({ message: "cooldown" });
      }
    }
  } catch (e) {
    console.log(e);
    res.json({ message: "error" });
  }
});

app.post("/checkPin", async (req, res) => {
  const { lat, lng } = req.body;
  const findUserMarker = user_marker.findOne({ lag: lat, lng: lng });
  if (findUserMarker != null) {
    res.json({ message: "already have." });
  } else {
    res.json({ message: "success" });
  }
});

module.exports = app;
