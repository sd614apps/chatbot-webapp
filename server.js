const express = require('express');
const sqlite3 = require('sqlite3');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const port = 3000;

// Set up SQLite database
const db = new sqlite3.Database('chatbot.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)');
        db.run('CREATE TABLE IF NOT EXISTS chats (user_id INTEGER, user_message TEXT, bot_message TEXT)');
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'my_secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // for development; set to true in production with HTTPS
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  (username, password, done) => {
    db.get('SELECT id, username, password FROM users WHERE username = ?', [username], (err, row) => {
      if (err) {
        return done(err);
      }
      if (!row) {
        return done(null, false);
      }
      bcrypt.compare(password, row.password, (err, res) => {
        if (res) {
          return done(null, { id: row.id, username: row.username });
        } else {
          return done(null, false);
        }
      });
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.get('SELECT id, username FROM users WHERE id = ?', [id], (err, row) => {
    if (!row) {
      return done(null, false);
    }
    return done(null, { id: row.id, username: row.username });
  });
});

app.use(express.urlencoded({ extended: false }));

// Signup endpoint
app.post('/signup', express.json(), (req, res) => {
    const { username, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        res.status(500).send('Error encrypting password');
      } else {
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err) => {
          if (err) {
            res.status(500).send('Error creating user');
          } else {
            res.status(200).send('User created successfully'); // Only send a response here
          }
        });
      }
    });
});

// Login endpoint
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login.html',
    failureFlash: false
}), (req, res) => {
    res.status(200).send('Logged in successfully');
});

// Logout endpoint
app.get('/logout', (req, res) => {
    req.logout();
    // res.status(200).send('Logged out successfully');
    res.redirect('/');
});

// Authentication check middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(403).send('Please log in to access this resource');
}

// Protect the chat page
app.get('/', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Store chat messages
app.post('/store-chat', ensureAuthenticated, express.json(), (req, res) => {
    const { userMessage, botMessage } = req.body;
    const userId = req.session.userId;
    if (userId) {
        db.run('INSERT INTO chats (user_id, user_message, bot_message) VALUES (?, ?, ?)', [userId, userMessage, botMessage], (err) => {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.status(200).send('Chat stored successfully');
            }
        });
    } else {
        res.status(401).send('Unauthorized');
    }
});

// Get past chats
app.get('/get-chats', ensureAuthenticated, (req, res) => {
    db.all('SELECT * FROM chats', [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(rows);
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
