var express = require("express");
var mongoose = require("mongoose");
var bodyparser = require("body-parser");
var passport = require("passport");
var app = express();

mongoose.connect(process.env.MONGO_URL || "mongodb://localhost/notes_development");

app.use(bodyparser.urlencoded({ extended: true}));
app.use(bodyparser.json());
app.set("jwtSecret", process.env.JWT_SECRET || "changethisordie");

app.use(passport.initialize());

require("./lib/passport")(passport);
var jwtauth = require("./lib/jwt_auth")(app.get("jwtSecret"));

require("./routes/users_routes")(app, passport);

var notesRouter = express.Router();
notesRouter.use(jwtauth);

require("./routes/notes_routes")(notesRouter);
app.use("/v1", notesRouter);

app.set("port", process.env.PORT || 3000);
app.listen(app.get("port"), function() {
  console.log("server running on port: %d", app.get("port"));
});
