const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var port = process.env.PORT || 8000;
const MongoClient = require('mongodb').MongoClient

var db, collection;

const url = "mongodb+srv://dbuser:db@cluster0.m5lff.mongodb.net/tracker?retryWrites=true&w=majority";
const dbName = "tracker";

app.listen(port, () => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  db.collection('thoughts').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {thoughts: result})
  })
})

app.get('/filter/:category?', (req, res) => {
  var category = req.params.category
  db.collection('thoughts').find().toArray((err, result) => {
    if (err) return console.log(err)
    result = result.filter(function(result) {
      if(result.category ==`${category}`){
        return result
      }
    })
    res.render('filter.ejs', {thoughts: result})
  })
})

app.post('/thoughts', (req, res) => {
  db.collection('thoughts').insertOne({title: req.body.title, category:req.body.category, msg: req.body.msg}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})
//
// app.put('/thoughts', (req, res) => {
//   if(req.body.thumbUp == "yes"){
//     db.collection('thoughts')
//     .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
//       $set: {
//         thumbUp: req.body.thumbUp,
//         thumbDown: req.body.thumbDown,
//         value:req.body.value + 1
//       }
//     }, {
//       sort: {_id: -1},
//       upsert: true
//     }, (err, result) => {
//       if (err) return res.send(err)
//       res.send(result)
//     })
//   } else if((req.body.thumbDown == "yes") && (req.body.value!=0)){
//     db.collection('thoughts')
//     .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
//     $set: {
//       thumbUp: req.body.thumbUp,
//       thumbDown: req.body.thumbDown,
//       value: req.body.value -1
//     }
//   }, {
//     sort: {_id: -1},
//     upsert: true
//   }, (err, result) => {
//     if (err) return res.send(err)
//     res.send(result)
//     })
//   }
// })

app.delete('/thoughts', (req, res) => {
  db.collection('thoughts').findOneAndDelete({title: req.body.title, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
