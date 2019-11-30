const passport = require('passport');
var jwt = require('jsonwebtoken');

exports.post = function(req, res, next) {
    console.log("Tentativa de login: " + JSON.stringify(req.body));
    passport.authenticate('login', function(err, user, info) {
      
      if (err) { 
          console.log("Ocorreu um erro ao logar: " + err);
          return next(err); 
        }

      if (!user) { 
          return res.status(401).send({ auth: false, message: info.message });
        }

      req.logIn(user, function(err) {
        if (err) { 
            return next(err); 
        }

        const id = user._id;
        var token = jwt.sign({ id }, process.env.SECRET, {
            expiresIn: 300 // expires in 5min
          });
          
          console.log('LOGIN REALIZADO (ID_USER: ' + user.id.toString() + ')')
          res.status(200).send({ auth: true, token: token, name: user.name, idUser: user.id });
      });
    })(req, res, next);
  }

  exports.signup = function(req, res, next) {
    return res.render('signup');
  }