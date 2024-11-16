const express = require('express');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const configDB = require('./config/database.js');
const app = express();
const port = process.env.PORT || 8080;

const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(configDB.url);
    console.log('Connected to MongoDB.');

    console.log('Loading routes...');
    require('./app/routes.js')(app, passport, mongoose.connection, configDB.collectionName);
    console.log('Routes successfully loaded.');

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit process on failure
  }
};

// Configure Passport
require('./config/passport')(passport);
console.log('Passport configured.');

// Configure Express middleware
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Configure session and Passport middleware
app.use(
  session({
    secret: 'yeehaw',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

startServer();
