require("./utils.js");

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const fs = require('fs');
const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();

const Joi = require("joi");

app.use(express.static(__dirname + "/public"));

const expireTime = 60 * 60 * 1000; //expires after 1 hour (minutes * seconds * millis)

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;

var {database} = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');

app.use(express.urlencoded({extended: false}));

app.set('view engine', 'ejs');

var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
  crypto: {
    secret: mongodb_session_secret
  }
})

app.use(session({ 
    secret: node_session_secret,
  store: mongoStore, //default is memory store 
  saveUninitialized: false, 
  resave: true
}
));

app.get("/", (req,res) => {
  let buttons
  if(req.session.authenticated) {
     buttons = ['main', 'signout'];
  } else { 
    buttons = ['login', 'signup']
  }
 res.render('index', {buttons: buttons});
})

app.get('/login', (req,res) => {
  if(req.session.authenticated) {
    res.redirect('/')
    return;
  }
  res.render('form', {input: ['email'], action: 'login'})
})

app.post('/login', async (req,res) => {
  const password = req.body.password;
  const email = req.body.email;

  const schema = Joi.object( {
    email: Joi.string().max(30).required(),
    password: Joi.string().max(20).required()
  });

  const validationResult = schema.validate({email, password});
  if(validationResult.error != null) {
    res.send(`${validationResult.error.details[0].message} <a href='/login'>Try Again</a>` );
    return;
  }

  const result = await userCollection.find({email: email}).project({email: 1, name: 1, password: 1, _id: 1}).toArray();


  if (result.length != 1) {
    res.send(`Email does not exist <a href='/login'>Try Again</a>`);
		return;
	}
  if (await bcrypt.compare(password, result[0].password)) {
    req.session.authenticated = true;
    req.session.name = result[0].name;
    req.session.email = result[0].email;
    req.session.cookie.maxAge = expireTime;
    res.redirect('/');
    return
  }
  else {
    res.send(`Incorrect password <a href='login'> Try Again</a>`)
		return;
	}
})

app.get('/signup', (req,res) => {
    if(req.session.authenticated) {
    res.redirect('/')
    return;
  }
  res.render('form', {input: ['name', 'email'], action: 'signup'})
})

app.post('/signup', async (req,res) => { 
  const name = req.body.name;
  const password = req.body.password;
  const email = req.body.email;

  const schema = Joi.object( {
    email: Joi.string().max(30).required(),
    name: Joi.string().alphanum().max(20).required(),
    password: Joi.string().max(20).required()
  });

  const validationResult = schema.validate({email, name, password});
  if (validationResult.error != null) {
    res.send(`${validationResult.error.details[0].message} <a href='/signup'>Try Again</a>` );
    return;
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await userCollection.insertOne({email: email, name: name, password: hashedPassword});

  req.session.authenticated = true;
  req.session.name = name;
  req.session.email = email;
  req.session.cookie.maxAge = expireTime;
  res.redirect('/');
});

app.get('/main', (req,res) => {
  if (!req.session.authenticated) {
    res.redirect('/');
    return
  }
  const file = fs.readFileSync('public/html/main.html', 'utf-8');
  res.send(file);
})


app.get('/signout', (req,res) => {
  req.session.destroy();
  res.redirect('/');
})


app.get('/userInfo', (req,res) => {
  res.send(req.session.name);
})

app.get("*", (req,res) => {
  res.status(404);
  res.render('404');
});



app.listen(port, () => {
	console.log("Node application listening on port "+port);
}); 