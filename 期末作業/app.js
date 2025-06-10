var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var db = require('./database');
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/api', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    res.json(rows);
  });
});

app.get('/api/search', (req, res) => {
  let sql = 'SELECT * FROM users WHERE 1=1';
  const params = [];
  if (req.query.startYear) {
    sql += " AND date >= ?";
    params.push(req.query.startYear);
  }
  if (req.query.endYear) {
    sql += " AND date <= ?";
    params.push(req.query.endYear);
  }
  if (req.query.price) {
    sql += ' AND price <= ?';
    params.push(Number(req.query.price));
  }
  if (req.query.type) {
    sql += ' AND name LIKE ?';
    params.push(`%${req.query.type}%`);
  }
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// 取得特定年分與名稱的西瓜價格
app.get('/api/watermelon', (req, res) => {
  const { year, type } = req.query;
  if (!year || !type) {
    return res.status(400).json({ error: 'Missing year or type' });
  }
  db.get('SELECT price FROM users WHERE date = ? AND name = ?', [year, type], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) return res.json({ price: null });
    res.json({ price: row.price });
  });
});

app.post('/api/watermelons', (req, res) => {
  const { year, type, price } = req.body;
  if (!year || !type || !price === undefined) {
    return res.status(400).json({ error: 'Missing year, type, or price' });
  }
  db.run('UPDATE users SET price = ? WHERE date = ? AND name = ?', [price, year, type], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      // 若無此資料則新增
      db.run('INSERT INTO users (date, price, name) VALUES (?, ?, ?)', [year, price, type], function(err2) {
        if (err2) {
          console.error(err2.message);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, inserted: true });
      });
    } else {
      res.json({ success: true, updated: true });
    }
  });
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

