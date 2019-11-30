const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../store/user');

module.exports = function(passport){

    function findUser(userEmail, callback){
        User.findOne({email : userEmail})
        .then((user, error) => 
            callback(user, error)
        );
    }

    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });
     
    passport.use('login', new LocalStrategy({ 
        usernameField: 'email',
        passwordField: 'password'
    },
    (email, password, done) => {
        findUser(email, (user, err) => {
            if (err) { 
                console.log('Erro ao buscar usuário!');
                return done(err, false, { message: 'Erro ao buscar usuário' }) 
            }

            // usuário inexistente
            if (!user) { 
                let msg = 'E-mail inexistente!'
                console.log(msg);
                return done(null, false, { message: msg }) 
            }

            // comparando as senhas
            bcrypt.compare(password, user.password, (err, isValid) => {
                
                if (err) { 
                    console.log('Erro ao buscar usuário!');
                    return done(err, false, { message: 'Erro ao buscar usuário' }) 
                }

                if (!isValid) { 
                    let msg = 'Senha inválida!'
                    console.log(msg);
                    return done(null, false, { message: msg }) 
                }
                
                return done(null, user)
            })
        })
    }
    ));

 }