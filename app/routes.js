const { ObjectId } = require('mongodb');

module.exports = function (app, passport, db, collectionName) {
  // Home page
  app.get('/', (req, res) => {
    res.render('index.ejs');
  });

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, async (req, res) => {
    try {
      const items = await db.collection(collectionName).find().sort({ thumbUp: -1 }).toArray();
      res.render('profile.ejs', {
        user: req.user,
        items: items,
      });
    } catch (err) {
      console.error('Error fetching items:', err);
      res.status(500).send('Error fetching items');
    }
  });

  // LOGOUT ==============================
  app.get('/logout', (req, res) => {
    req.logout(() => {
      console.log('User has logged out!');
    });
    res.redirect('/');
  });

  // Item routes ===============================================================
  app.post('/items', async (req, res) => {
    try {
      await db.collection(collectionName).insertOne({
        name: req.body.name,
        img: req.body.img,
        thumbUp: 0,
      });
      console.log(`Item saved: ${req.body.name}`);
      res.redirect('/profile');
    } catch (err) {
      console.error('Error saving item:', err);
      res.status(500).send('Error saving item');
    }
  });

  app.put('/items/:id/thumbUp', async (req, res) => {
    try {
      const itemId = req.params.id;
      const result = await db.collection(collectionName).findOneAndUpdate(
        { _id: ObjectId.createFromHexString(itemId) },
        { $inc: { thumbUp: 1 } }
      );
      console.log(`Thumb up incremented for item ID: ${itemId}`);
      res.send(result);
    } catch (err) {
      console.error('Error updating thumbs up:', err);
      res.status(500).send('Error updating thumbs up');
    }
  });

  app.put('/items/:id/thumbDown', async (req, res) => {
    try {
      const itemId = req.params.id;
      const result = await db.collection(collectionName).findOneAndUpdate(
        { _id: ObjectId.createFromHexString(itemId) },
        { $inc: { thumbUp: -1 } }
      );
      console.log(`Thumb down decremented for item ID: ${itemId}`);
      res.send(result);
    } catch (err) {
      console.error('Error updating thumbs down:', err);
      res.status(500).send('Error updating thumbs down');
    }
  });

  app.delete('/items/:id', async (req, res) => {
    try {
      const itemId = req.params.id;
      await db.collection(collectionName).deleteOne({ _id: ObjectId.createFromHexString(itemId) });
      console.log(`Item deleted with ID: ${itemId}`);
      res.send('Item deleted!');
    } catch (err) {
      console.error('Error deleting item:', err);
      res.status(500).send('Error deleting item');
    }
  });

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================

  // LOGIN ===============================
  app.get('/login', (req, res) => {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post(
    '/login',
    passport.authenticate('local-login', {
      successRedirect: '/profile',
      failureRedirect: '/login',
      failureFlash: true,
    })
  );

  // SIGNUP =================================
  app.get('/signup', (req, res) => {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post(
    '/signup',
    passport.authenticate('local-signup', {
      successRedirect: '/profile',
      failureRedirect: '/signup',
      failureFlash: true,
    })
  );

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  app.get('/unlink/local', isLoggedIn, async (req, res) => {
    try {
      const user = req.user;
      user.local.email = undefined;
      user.local.password = undefined;
      await user.save();
      console.log('Account unlinked successfully.');
      res.redirect('/profile');
    } catch (err) {
      console.error('Error unlinking local account:', err);
      res.status(500).send('Error unlinking local account');
    }
  });
};

// Route middleware to make sure user is authenticated
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  console.error('Access denied: User not authenticated');
  res.redirect('/');
}
