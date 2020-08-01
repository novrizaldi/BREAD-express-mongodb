var express = require('express');
const {
  Router
} = require('express');
var router = express.Router();

//require mongodb
const objectId = require('mongodb').ObjectId;

/* GET home page. */
module.exports = function (db, coll) {

  router.get('/', function (req, res, next) {
    const { id, string, integer, float, bool, startDate, endDate } = req.query;
    let query = new Object();
    const reg = new RegExp(string);

    if (id) {
      query._id = id;
    }
    if (string) {
      query.string = reg;
    }
    if (integer) {
      query.integer = parseInt(integer);
    }
    if (float) {
      query.float = parseFloat(float);
    }
    if (bool) {
      query.boolean = JSON.parse(bool);
    }
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate }
    }

    const page = req.query.page || 1;
    const limit = 3;

    const offset = (page - 1) * limit;

    //New Page by Pagination
    let url = req.url.includes('page') ? req.url : `/?page=1&` + req.url.slice(2)

    //Use Promise
    db.collection(coll).count()
      .then((total) => {
        const pages = Math.ceil(total / limit)

        db.collection(coll).find(query).limit(limit).skip(offset).toArray()
          .then((result) => {

            res.status(200).render('index', {
              result,
              page,
              pages,
              url
            })
              .catch((err) => {
                res.status(500).json({
                  error: true,
                  message: err
                })
              })
          })
      })
  });

  // router.get('/', (req, res, data) => {
  //   db.collection(coll).find({}).toArray((err, data) => {
  //     res.render('index', {
  //       data
  //     })
  //   })
  // })

  router.get('/add', (req, res) => res.status(200).render('add'))

  router.post('/add', (req, res) => {
    let dat = req.body
    let add = {
      "string": dat.string,
      "integer": Number(dat.integer),
      "float": parseFloat(dat.float),
      "date": dat.date,
      "boolean": JSON.parse(dat.boolean)
    }
    db.collection(coll).insertOne(add, err => {
      if (err) res.json(err)
    })
    res.redirect('/')
  })

  router.get('/delete/:id', (req, res) => {
    let id = req.params.id
    db.collection(coll).deleteOne({
      _id: objectId(id)
    }, err => {
      if (err) res.json(err)
    })
    res.redirect('/')
  })

  router.get('/edit/:id', (req, res) => {
    let id = req.params.id
    db.collection(coll).findOne({
      _id: objectId(id)
    }, (err, result) => {
      if (err) res.json(err)
      res.status(200).render('edit', {
        row: result
      })
    })
  })

  router.post('/edit/:id', (req, res) => {
    let id = req.params.id
    let dat = req.body
    db.collection(coll).updateOne({
      _id: objectId(id)
    }, {
      $set: {
        string: dat.string,
        integer: Number(dat.integer),
        float: parseFloat(dat.float),
        date: dat.date,
        boolean: JSON.parse(dat.boolean)
      }
    }, err => {
      if (err) res.json(err)
    })
    res.redirect('/')
  })

  return router;
}