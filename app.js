/**
 * Module dependencies.
 */
var express = require('express')
  , mongoose = require('mongoose')
  , mongodb = require('mongodb')
  , fs = require('fs')
  , pdf = require('html-pdf')

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Model

var ObjectId = mongodb.BSONPure.ObjectID;
var Schema = mongoose.Schema;

var Question = new Schema({
  content : String,
  optionA : String,
  optionB : String,
  optionC : String,
  optionD : String,
  correctOption : String,
  difficultyLevel : String
});

Question.pre('save', function(next) {
  this.date = new Date();
  next();
});

mongoose.model('question', Question);

var db = mongoose.createConnection('mongodb://localhost/question');
var Question = db.model('question');

app.configure(function() {
  app.set('db', db);
});

// Routes

app.get('/question', function(req, res) {
  console.log("index");
  Question.find({}, function(err, data) {
    if(err) return next(err);
    res.render('index', { questions: data });
  });
});

app.get('/generate', function(req, res, next) {
  console.log("generate");

  Question.find({}, function(err, data) {
    var response = '';
    response += "<script>";
    response += "//script stuff here";
    response += "</script>";
    response += "<style>";
    response += "//style stuff here";
    response += "</style>";
    response += "<p><center>Question  Paper</center></p>";

    if(err) return next(err);
    else {      
      for (var index=0; index<data.length; index++) {
        var qindex = index + 1;
        response += "<p>Question " + qindex + " : "+ data[index].content + "</p>";
        response += "<p>A: " + data[index].optionA + "</p>";
        response += "<p>B: " + data[index].optionB + "</p>";
        response += "<p>C: " + data[index].optionC + "</p>";
        response += "<p>D: " + data[index].optionD + "</p>";
        response += "<p></p>";
      }
    }

    fs.writeFile("./public/paper.html", response, function(err) {
    if(err) {
        return console.log(err);
    }
      console.log("The file was saved!");
    }); 
  });

  var html = fs.readFileSync('./public/paper.html', 'utf8')
  var options = { filename: './paper.pdf', format: 'Letter' };
 
  pdf.create(html, options).toFile(function(err, resp) {
  if (err) return console.log(err);
    console.log(resp);
  });
  res.redirect(req.get('/'));
});


app.get('/question/list', function(req, res, next) {
  console.log("get questions");
  Question.find({}, function(err, data) {
    if(err) return next(err);
    res.json(data);
  });
});

app.get('/question/:id', function(req, res, next) {
  console.log("get question : " + req.params.id);
  Question.findById({ _id : ObjectId(req.params.id)}, function(err, data) {
    if(err) return next(err);
    res.json(data);
  });
});

app.post('/question', function(req, res, next) {
  console.log("post question : " + req.body.content);
  var question = new Question();
  question.content = req.body.content;
  question.optionA = req.body.optionA;
  question.optionB = req.body.optionB;
  question.optionC = req.body.optionC;
  question.optionD = req.body.optionD;
  question.correctOption = req.body.correctOption;
  question.difficultyLevel = req.body.difficultyLevel;

  question.save(function(err) {
    if(err) return next(err);
    res.json({ message : 'Success!'});
  });
});

app.put('/question/:id', function(req, res, next) {
  console.log("put question : " + req.params.id);
  Question.update(
    { _id : ObjectId(req.params.id) }
    , { content : req.body.content,
        optionA : req.body.optionA,
        optionB : req.body.optionB,
        optionC : req.body.optionC,
        optionD : req.body.optionD,
        correctOption : req.body.correctOption,
        difficultyLevel : req.body.difficultyLevel
      }
    , { upsert : false, multi : false }
    , function(err) {
      if(err) return next(err);
      res.json({ message : 'Success!'});
  });
});

app.del('/question/:id', function(req, res, next) {
  console.log("delete question : " + req.params.id);
  Question.findById({ _id : ObjectId(req.params.id)}, function(err, data) {
    if(err) return next(err);
    data.remove(function(err) {
      console.log("question remove!");
      res.json({ message : 'Success!'});
    });
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
