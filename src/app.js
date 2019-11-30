const express = require('express');
const app = express();
const router = express.Router();

// Set passport configs
const passport = require('passport');
//app.use(require('express-session')({ secret: authConfig.secret, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
//app.use(passport.session());

// Initialize Passport
var initPassport = require('./auth/passportLocal');
initPassport(passport);

// Add headers
const cors = require('cors');
app.use(cors());
app.options('*', cors());
//const allowCrossDomain = require('./middleware/cors');
//app.use(allowCrossDomain);

//Rotas
const index = require('./routes/index');
const usersRoute = require('./routes/usersRoute');
const transferRoute = require('./routes/transferRoute');
const coinsRoute = require('./routes/coinsRoute');
const authRoute = require('./routes/authRoute');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/', index);
app.use('/api/coins/users', usersRoute);
app.use('/api/coins/transfers', transferRoute);
app.use('/api/coins/', coinsRoute);
app.use('/api/coins/auth', authRoute);

// view engine setup
var path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

module.exports = app;
