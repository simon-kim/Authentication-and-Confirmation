var bodyparser = require("body-parser");
var User = require("../models/user");

module.exports = function (app, passport) {
  app.use(bodyparser.json());

  app.get("/api/users", passport.authenticate("basic", {session: false}), function (req,res) {
    res.json({"jwt": req.user.generateToken(app.get("jwtSecret"))});
  });

  app.post("/api/users", function (req, res) {
    User.findOne({"basic.email": req.body.email}, function (err, user) {
      if(err) return res.status(500).send("server error");
      if(user) return res.send("can not create that user");

      //password confirmation check
      if(req.body.password !== req.body.passwordConfirm) return res.send("Passwords do not match");
      //password length check
      if(req.body.password.length < 5) return res.status(500).send("Password too short");
      var newUser = new User();
      newUser.basic.email = req.body.email;
      newUser.basic.password = newUser.generateHash(req.body.password);
      newUser.save (function (err, data) {
        if (err) return res.status(500).send("server error");
        res.send({"jwt": newUser.generateToken(app.get("jwtSecret"))});
      });
    });
  });
};
