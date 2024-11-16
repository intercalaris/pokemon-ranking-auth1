const LocalStrategy = require('passport-local').Strategy;
const User = require('../app/models/user');

module.exports = function (passport) {
  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Local Signup
  passport.use(
    'local-signup',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true, // allows us to pass back the entire request to the callback
      },
      async (req, email, password, done) => {
        try {
          // Check if a user with the same email already exists
          const existingUser = await User.findOne({ 'local.email': email });

          if (existingUser) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          }

          // Create a new user
          const newUser = new User();
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password); // Use the generateHash method in the User model

          // Save the user to the database
          await newUser.save();
          return done(null, newUser);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Local Login
  passport.use(
    'local-login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true, // allows us to pass back the entire request to the callback
      },
      async (req, email, password, done) => {
        try {
          // Find the user by email
          const user = await User.findOne({ 'local.email': email });

          if (!user) {
            return done(null, false, req.flash('loginMessage', 'No user found.'));
          }

          // Check if the password is correct
          if (!user.validPassword(password)) {
            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
          }

          // Return the user if everything is valid
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};
