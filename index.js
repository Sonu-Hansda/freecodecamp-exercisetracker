require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let userSchema = new mongoose.Schema({
  username: String,
  count: Number,
  log: [
    {
      description: String,
    },
    { durations: Number },
    { date: String },
  ],
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  let username = req.body.username;
  let user = new User({ username: username, count: 0 });

  try {
    let data = await user.save();
    res.json({ username: data.username, _id: data._id });
  } catch (err) {
    console.log(err);
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  let id = req.params._id;
  let description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;
  if (date === "") {
    date = new Date().toDateString();
  } else {
    date = new Date(date).toDateString();
  }
  try {
    let user = await User.findById(id);
    user.count = user.count + 1;
    user.log.push({
      description: description,
      duration: duration,
      date: date,
    });
    await user.save();
    res.json({
      _id: user._id,
      username: user.username,
      date: date,
      duration: duration,
      description: description,
    });
  } catch (err) {
    console.log(err);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
