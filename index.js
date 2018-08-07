const express = require("express");
const mongoose = require("mongoose");
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require('path');
const app = express();
// Middleware for body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// middleware for passport
app.use(passport.initialize());
app.use(passport.session());

// Passport config
require("./config/passport")(passport);

const db = require("./config/keys").mongoURI;

mongoose
  .connect(
    db,
    {
      useNewUrlParser: true
    }
  )
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("hello world");
});

//

// Use routes

app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);
// Server static assets if in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});
