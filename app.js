if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}
const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
var esession = require('express-session');
const methodOveride = require('method-override');

const intiatizePassport = require('./passport-config');
const { Passport } = require('passport');
intiatizePassport(
  passport,
  email => users.find(user => user.email === email), 
  id => users.find(user => user.id === id) 
);

var app = express();

const users = [];

app.set('view-engine','ejs');
app.use(express.urlencoded({extended:false}))
app.use(flash());
app.use(esession({
  secret: process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized:false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOveride('_method'));
app.use(express.static("public"));

app.get('/', checkAuthenticated, (req,res)=>{
  res.render('index.ejs',{name: req.user.name});
});

app.get('/login', checkNotAuthenticated, (req,res)=>{
  res.render('login.ejs');
});

app.post('/login',checkNotAuthenticated, passport.authenticate('local',{
  successRedirect: '/',
  failureRedirect:'/login',
  failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req,res)=>{
  res.render('register.ejs');
});

app.post('/register',checkNotAuthenticated,  async (req,res)=>{
  try{
      const hanshedPassowrd = await bcrypt.hash(req.body.password, 10);
      users.push({
        id:Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hanshedPassowrd
      })
      res.redirect('/login');
  } catch{
      res.redirect('/register');
  }
  console.log(users);
});

function checkAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    next();
    return
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    res.redirect('/login');
    return
  }
  next();
}

app.delete('/logout',(req,res)=>{
  req.logOut()
  res.redirect('/login')
})

app.listen(3000, function(){
  console.log("Express server listening on port ",3000);
});

module.exports = app;