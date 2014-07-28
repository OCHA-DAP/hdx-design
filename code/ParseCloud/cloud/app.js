var express = require('express');
var app = express();

app.get('/getindicators', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var query = new Parse.Query("indicator");
    query.limit(200);
    query.ascending("name");
    query.find({
        success: function(results) {
            res.send(results);
        },
        error: function() {
            res.send('Whoops, API is not available right now.');
        }
    });
});

app.get('/getperiods', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var query = new Parse.Query("value");
    var id = req.query.indid;
    query.limit(1000);
    if (id) {
        query.equalTo("indID", id);
        query.find({
            success: function(results) {
                var new_res = [];
                for (var i = 0; i < results.length; ++i) {
                    var year = results[i].get('period');
                    if (new_res.indexOf(year) == -1) {
                        new_res.push(year);
                    }
                }
                new_res.sort(function(a, b) {
                    return a - b
                });
                res.send(new_res);
            },
            error: function() {
                res.send('Whoops, API is not available right now.');
            }
        });
    } else {
        res.send([]);
    }
});

app.get('/getdataset', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var query = new Parse.Query("value");
    var id = req.query.indid;
    var period = req.query.period;
    query.limit(1000);
    query.ascending("period");
    if (id) {
        query.equalTo("indID", id);
        if (period) {
            query.equalTo("period", period);
        }
        query.find({
            success: function(results) {
                res.send(results);
            },
            error: function() {
                res.send('Whoops, API is not available right now.');
            }
        });
    } else {
        res.send([]);
    }
});


app.get('/getwfpdata', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var id_str = req.query.indid;
    var ids = []
    if(id_str.indexOf(',') != -1){
      ids = id_str.split(',');
    }
    else if (id_str.length) {
      ids.push(id_str);
    }
    else{
      res.send([]);
      return;
    }
    var period_str = req.query.period;
    var periods = [];
    if(period_str.indexOf(',') != -1){
      periods = period_str.split(',');
    }
    else if (period_str.length) {
      periods.push(period_str);
    }
    else{
      res.send([]);
      return;
    }
    var query = new Parse.Query("wfp");
    query.containedIn('indID', ids);
    query.containedIn('period', periods);
    query.limit(1000);
    query.find({
      success: function(results) {
          res.send(results);
      },
      error: function() {
          res.send('Whoops, API is not available right now.');
      }
    });
});

app.get('/getwfpperiods', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var id_str = req.query.indid;
    var ids = []
    if(id_str.indexOf(',') != -1){
      ids = id_str.split(',');
    }
    else if (id_str.length) {
      ids.push(id_str);
    }
    else{
      res.send([]);
      return;
    }
    var query = new Parse.Query("wfp");
    query.containedIn('indID', ids);
    query.limit(1000);
    query.find({
      success: function(results) {
          var new_res = [];
          for (var i = 0; i < results.length; ++i) {
              var year = results[i].get('period');
              if (new_res.indexOf(year) == -1) {
                  new_res.push(year);
              }
          }
          new_res.sort();
          res.send(new_res);
      },
      error: function() {
          res.send('Whoops, API is not available right now.');
      }
    });
});

// Attach the Express app to Cloud Code.
app.listen();
