const { result } = require('lodash');
const nodeGeocoder = require('node-geocoder');
const user = require('./models/user.js');

let options = {
  provider: 'openstreetmap'
};
 
const geoCoder = nodeGeocoder(options);
const isPointNear = require('./utils.js').isPointNear;
module.exports = function(app, passport, db, ObjectId) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
      db.collection('locations').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('index.ejs',{
          locations: result,
          API_KEY : 'AIzaSyBudwyHSJlQgUS9RO8APtu33o_fF-VafT8',
        });
      })
        

    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('locations').find({postedBy: req.user._id}).toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            locations: result,
            API_KEY : 'AIzaSyBudwyHSJlQgUS9RO8APtu33o_fF-VafT8'
          })
        })
    });
  //   app.get('/post/:zebra', isLoggedIn, function(req, res) {
  //     let postId = ObjectId(req.params.zebra)
  //     console.log(postId)
  //     db.collection('posts').find({_id: postId}).toArray((err, result) => {
  //       if (err) return console.log(err)
  //       res.render('post.ejs', {
  //         posts: result
  //       })
  //     })
  // });
  
  app.get('/feed', function(req, res) {
  
    db.collection('locations').find().sort({'_id':-1}).toArray((err, result) => {
      if (err) return console.log(err)
      res.render('feed.ejs', {
        locations: result,
        API_KEY : 'AIzaSyBudwyHSJlQgUS9RO8APtu33o_fF-VafT8'
      })
    })
});

  app.get('/post/:id', function(req, res) {
    const postId = ObjectId(req.params.id)
    db.collection('locations').find({_id: postId}).toArray((err, result) => {
      if (err) return console.log(err)
      console.log(result)
      res.render('post.ejs', {
        locations: result,
        API_KEY : 'AIzaSyBudwyHSJlQgUS9RO8APtu33o_fF-VafT8'
      })
    })
  });
    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/locations', (req, res) => {
      geoCoder.geocode(req.body.address)
      .then((geoCodeRes)=> {
        console.log(geoCodeRes);
        let firstResult = geoCodeRes[0];
        let user = req.user._id
        db.collection('locations').insertOne({postedBy: user, name: req.body.name, address:req.body.address, details: req.body.details, thumbUp: 0, thumbDown:0, lat: firstResult.latitude, lng: firstResult.longitude, }, (err, result) => {
          if (err) return console.log(err)
          console.log('saved to database')
          res.redirect('/profile')
        })
      })
      .catch((err)=> {
        return console.log(err);
      });
    });

    app.post('/comments'),(req, res =>{
      const user = req.user._id
      db.collection('comments').insertOne({postedBy:user,comment:req.body.comment,})
    })

    app.get('/locations',(req,res) => {
      const centerLat = req.query.lat;
      const centerLng = req.query.lng;
      const distance = req.query.distance;
      let response = [];
      db.collection('locations').find().toArray((err, result) => {
        if (err) return console.log(err);
        for (let i = 0; i < result.length; i++){
          const location = result[i];
          if (isPointNear(location.lat, location.lng, centerLat, centerLng, distance)){
            response.push({
              name: location.name,
              address: location.address,
              details: location.details,
              thumbUp: location.thumbUp,
              thumbDown: location.thumbDown,
              lat: location.lat,
              lng: location.lng,
              id: location._id,
            }); 
          }
        }
        res.send( {
          locations: response
        });
      });
    });

    app.put('/locations', (req, res) => {
      db.collection('locations')
      .findOneAndUpdate({name: req.body.name, details: req.body.details}, {
        $set: {
          thumbUp:req.body.thumbUp + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    });
    app.put('/locationsDown', (req, res) => {
      db.collection('locations')
      .findOneAndUpdate({name: req.body.name, details: req.body.details}, {
        $set: {
          thumbUp:req.body.thumbUp - 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    });

    app.delete('/locations', (req, res) => {
      db.collection('locations').findOneAndDelete({name: req.body.name, details: req.body.details}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
