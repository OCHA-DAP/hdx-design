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


app.get('/getmapdata', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var query = new Parse.Query("wfp");
    var id = req.query.indid;
    var period = req.query.period;
    query.limit(600);
    query.ascending("period");
    if (id) {
        query.equalTo("indID", id);
        if (period) {
            query.equalTo("period", period);
            query.equalTo("admin1", 'NA');
            query.find({
                success: function(results) {
                    res.send(results);
                },
                error: function() {
                    res.send('Whoops, API is not available right now.');
                }
            });
        }
    } else {
        res.send([]);
    }
});

// Attach the Express app to Cloud Code.
app.listen();
