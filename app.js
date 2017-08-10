// require Express and Socket.io

var express = require('express');
var app = express();
app.use('/scriptsjs', express.static(__dirname));
var bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({// to support URL-encoded bodies
    extended: true
}));
app.set('view engine', 'ejs');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var config = require('./config.js');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/track";
MongoClient.connect(url, function(err, db) {
    if (err)
        throw err;
    console.log("DataBase Initialized!");
    db.close();
});

MongoClient.connect(url, function(err, db) {
    if (err)
        throw err;
    db.createCollection("data", function(err, res) {
        if (err)
            throw err;
        console.log("Data Table Initialized!");
        db.close();
    });
});
MongoClient.connect(url, function(err, db) {
    if (err)
        throw err;
    db.createCollection("heatmap", function(err, res) {
        if (err)
            throw err;
        console.log("HeatMap Table Initialized!");
        db.close();
    });
});
MongoClient.connect(url, function(err, db) {
    if (err)
        throw err;
    db.createCollection("pageview", function(err, res) {
        if (err)
            throw err;
        console.log("pageview Table Initialized!");
        db.close();
    });
});
var visitorsData = {};
var mousedata = {};
app.set('port', (process.env.PORT || 5000));
app.use(express.static(path.join(__dirname, 'public/')));

app.get(/\/(about|contact)?$/, function(req, res) {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/dashboard', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/dashboard.html'));
});
app.get('/clickmap', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/clickmap.html'));
});
app.get('/dmode', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/dmode.html'));
});
app.get('/alldata', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/alldata.html'));
});
app.get('/heatmap', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/heatmap.html'));
});
app.get('/delete', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/deleteDb.html'));
});

app.post('/deletedb', function(req, res) {
    
    MongoClient.connect(url, function(err, db) {
        
        if (err)
            throw err;
        if (req.body.d_dbdel === "DELETE PAGEVIEW") {
            db.collection('pageview', function(err, collection) {
                if (err)
                    throw err;
                collection.remove({}, function(err, removed) {
                    if (err)
                        throw err;
                   
                });
            });

        }
        if (req.body.d_dbdel === "DELETE HEATMAP") {
            db.collection('heatmap', function(err, collection) {
                if (err)
                    throw err;
                collection.remove({}, function(err, removed) {
                    if (err)
                        throw err;
                   
                });
            });
        }
        if (req.body.d_dbdel === "DELETE DATA") {
            db.collection('data', function(err, collection) {
                if (err)
                    throw err;
                collection.remove({}, function(err, removed) {
                    if (err)
                        throw err;
                  
                });
            });
        }
        if (req.body.d_dbdel === "DELETE All") {
           
        }
        db.close();
    });
    
    res.writeHead(302, {
        'Location': '/delete'
    });
    res.end();
});
var tableData = {
    totalVisitor: 0,
    browserType: {Safari: 0,
        Chrom: 0,
        Firefox: 0,
        IE: 0,
        Other: 0},
    devicesType: {
        Mobile: 0,
        Desktop: 0
    },
    fold: {
        firstFold: 0,
        secondFold: 0,
        thirdFold: 0,
        fourthFold: 0,
        fifthFold: 0
    },
    vtype: {
        retuningVisitor: 0,
        uniqVisitor: 0
    },
    searchEng: {
        google: 0,
        yahoo: 0,
        bing: 0,
        facebook: 0,
        twitter: 0,
        linkedin: 0
    },
    pview: 0
};
app.post('/endpoint', function(req, res) {

    if (req.body.frm === '') {
        var query = {browser_app: /^S/};
        var query2 = {browser_app: /^C/};
        var query3 = {browser_app: /^F/};
        var query4 = {browser_app: /^M/};
        var query5 = {devices: "desktop"};
        var query6 = {devices: "mobile"};
        var query7 = {user_state: "Uniq visitor"};
        var query8 = {user_state: "Returning Visitor"};
        var query9 = {reffer: {$regex: /google/}};
        var query10 = {reffer: {$regex: /search.yahoo/}};
        var query11 = {reffer: {$regex: /bing/}};
        var queryfirstfold = {scrollPos: {$lt: 601}};
        var querysecondfold = {$and: [{scrollPos: {$gt: 601}}, {scrollPos: {$lt: 1201}}]};
        var querythirdfold = {$and: [{scrollPos: {$gt: 1201}}, {scrollPos: {$lt: 1801}}]};
        var queryfourthfold = {$and: [{scrollPos: {$gt: 1801}}, {scrollPos: {$lt: 2401}}]};
        var queryfifthfold = {scrollPos: {$gt: 2401}};
        var querypageview = {$group: {_id: null, total: {$sum: "$page_view"}}};
    } else {
        var filterdate = new Date(req.body.frm);
        var query = {$and: [{browser_app: /^S/}, {user_date: filterdate}]};
        var query2 = {$and: [{browser_app: /^C/}, {user_date: filterdate}]};
        var query3 = {$and: [{browser_app: /^F/}, {user_date: filterdate}]};
        var query4 = {$and: [{browser_app: /^M/}, {user_date: filterdate}]};
        var query5 = {$and: [{devices: "desktop"}, {user_date: filterdate}]};
        var query6 = {$and: [{devices: "mobile"}, {user_date: filterdate}]};
        var query7 = {$and: [{user_state: "Uniq visitor"}, {user_date: filterdate}]};
        var query8 = {$and: [{user_state: "Returning Visitor"}, {user_date: filterdate}]};
        var query9 = {$and: [{reffer: {$regex: /google/}}, {user_date: filterdate}]};
        var query10 = {$and: [{reffer: {$regex: /search.yahoo/}}, {user_date: filterdate}]};
        var query11 = {$and: [{reffer: {$regex: /bing/}}, {user_date: filterdate}]};
        var queryfirstfold = {$and: [{scrollPos: {$lt: 601}}, {user_date: filterdate}]};
        var querysecondfold = {$and: [{scrollPos: {$gt: 601}}, {scrollPos: {$lt: 1201}}, {user_date: filterdate}]};
        var querythirdfold = {$and: [{scrollPos: {$gt: 1201}}, {scrollPos: {$lt: 1801}}, {user_date: filterdate}]};
        var queryfourthfold = {$and: [{scrollPos: {$gt: 1801}}, {scrollPos: {$lt: 2401}}, {user_date: filterdate}]};
        var queryfifthfold = {$and: [{scrollPos: {$gt: 2401}}, {user_date: filterdate}]};
        var querypageview = {$group: {_id: null, total: {$sum: "$page_view"}}};
    }

    MongoClient.connect(url, function(err, db) {
        if (err)
            throw err;

        db.collection("data").find(query).toArray(function(err, result) {
            if (err)
                throw err;
            tableData.browserType.Safari = result.length;

            db.close();
        });
        db.collection("data").find(query2).toArray(function(err, result) {
            if (err)
                throw err;
            tableData.browserType.Chrom = result.length;
            db.close();
        });
        db.collection("data").find(query3).toArray(function(err, result) {
            if (err)
                throw err;
            tableData.browserType.Firefox = result.length;
            db.close();
        });
        db.collection("data").find(query4).toArray(function(err, result) {
            if (err)
                throw err;
            tableData.browserType.IE = result.length;
            db.close();
        });
        db.collection("data").find(query5).toArray(function(err, result) {
            if (err)
                throw err;
            tableData.devicesType.Desktop = result.length;
            db.close();
        });
        db.collection("data").find(query6).toArray(function(err, result) {
            if (err)
                throw err;
            tableData.devicesType.Mobile = result.length;
            db.close();
        });
        if (req.body.frm === '') {
            db.collection("data").find({}).toArray(function(err, result) {
                if (err)
                    throw err;
                tableData.totalVisitor = result.length;
                db.close();
            });
        } else {
            db.collection("data").find({user_date: new Date(req.body.frm)}).toArray(function(err, result) {
                if (err)
                    throw err;
                tableData.totalVisitor = result.length;
                db.close();
            });
        }
        db.collection("data").find(queryfirstfold).toArray(function(err, result) {
            if (err)
                throw err;
            tableData.fold.firstFold = result.length;

            db.close();
        });
        db.collection("data").find(querysecondfold).toArray(function(err, result) {
            if (err)
                throw err;
            tableData.fold.secondFold = result.length;

            db.close();
        });
        db.collection("data").find(querythirdfold).toArray(function(err, result) {
            if (err)
                throw err;
            tableData.fold.thirdFold = result.length;

            db.close();
        });
        db.collection("data").find(queryfourthfold).toArray(function(err, result) {
            if (err)
                throw err;
            tableData.fold.fourthFold = result.length;

            db.close();
        });
        db.collection("data").find(queryfifthfold).toArray(function(err, result) {
            if (err)
                throw err;
            tableData.fold.fifthFold = result.length;

            db.close();
        });
        db.collection("data").find(query8).toArray(function(err, result) {
            if (err)
                throw err;
            tableData.vtype.retuningVisitor = result.length;
            db.close();
        });
        db.collection("data").find(query7).toArray(function(err, result) {
            if (err)
                throw err;
            tableData.vtype.uniqVisitor = result.length;
            db.close();
        });
        db.collection("data").find(query9).toArray(function(err, result) {
            if (err)
                throw err;
            tableData.searchEng.google = result.length;
            db.close();
        });
        db.collection("data").find(query10).toArray(function(err, result) {
            if (err)
                throw err;
            tableData.searchEng.yahoo = result.length;
            db.close();
        });
        db.collection("data").find(query11).toArray(function(err, result) {
            if (err)
                throw err;
            tableData.searchEng.bing = result.length;
            db.close();
        });
        if (req.body.frm === '') {
            db.collection("pageview").aggregate(querypageview, function(err, result) {
                if (err)
                    throw err;
                 if (result.length === 0) {
                    tableData.pview = 0
                } else {
                    tableData.pview = result[0].total;
                }
                db.close();
            });
        } else {
            var filterdate = new Date(req.body.frm);
            db.collection("pageview").aggregate({
                $match: {user_date: filterdate}
            },
            {
                $group: {
                    _id: null, total: {$sum: "$page_view"}
                }
            }, function(err, result) {
                if (err)
                    throw err;

                if (result.length === 0) {
                    tableData.pview = 0
                } else {
                    tableData.pview = result[0].total;
                }
//                tableData.pview = result[0].total;
                db.close();
            });
        }

    });

    setTimeout(function() {
        res.send(tableData);
    }, 1000);
});
var country_list = [];
var clist = [];
var cclist = [];
var countclist = [];
app.post('/wldmap', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err)
            throw err;
        db.collection("data").aggregate({$group: {_id: '$country_name', count: {$sum: 1}}}, function(err, result) {
            if (err)
                throw err;
            country_list = result;

            for (var i = 0; i < country_list.length; i++) {

            }
            db.close();
        });
    });
    setTimeout(function() {
        res.send(country_list);
    }, 1000);
});
var alldata = [];
app.post('/aldata', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err)
            throw err;
        db.collection("data").find().toArray(function(err, result) {
            if (err)
                throw err;
            alldata = result;

            db.close();
        });
    });
    setTimeout(function() {
        res.send(alldata);
    }, 1000);
});
app.get('/report', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/report.html'));

});
app.get('/worldmap', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/worldmap.html'));

});
var hmapdata = [];
app.post('/hmap', function(req, res) {

    MongoClient.connect(url, function(err, db) {
        if (err)
            throw err;
        db.collection("heatmap").find({page_url: req.body.hurl}).toArray(function(err, result) {
            if (err)
                throw err;
            hmapdata = result;

            db.close();
        });
    });
    setTimeout(function() {
        res.send(hmapdata);
    }, 1000);
});
app.get('/test', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err)
            throw err;
        db.collection("data").find().toArray(function(err, result) {
            if (err)
                throw err;
            res.send(result);
            db.close();
        });


    });
});
io.on('connection', function(socket) {
//    if (socket.handshake.headers.host === config.host
//            && socket.handshake.headers.referer.indexOf(config.host + config.dashboardEndpoint) > -1) {

    // if someone visits '/dashboard' send them the computed visitor data

    io.emit('updated-stats', computeStats());

    //}
    socket.on('dataupdate', function(data) {

        io.emit('showdata', computeStats());

    });

    socket.on('visitor-data', function(data) {
        visitorsData[socket.id] = data;
        mousedata = data;
        io.emit('updated-stats', computeStats());

    });
    socket.on('visitor-data-click', function(data) {
        visitorsData[socket.id] = data;
        mousedata = data;
        insertIntoDB(data.page, socket.id);
        heatMapTableInsert(data.page);

        io.emit('desct-clk', computeStats());
        io.emit('updated-stats', computeStats());
    });
    socket.on('visitor-data-scroll', function(data) {

        visitorsData[socket.id] = data;
        mousedata = data;
        insertIntoDB(data.page, socket.id);

        io.emit('desct-scroll', computeStats1());
        io.emit('updated-stats', computeStats1());
    });
    socket.on('disconnect', function() {

        delete visitorsData[socket.id];
        io.emit('desct-scroll', computeStats1());
        io.emit('updated-stats', computeStats1());
        io.emit('desct-ii', computeStats());
        io.emit('updated-stats', computeStats());

    });
});
function computeStats1() {
    return {
        pages: computePageCounts(),
        referrers: computeRefererCounts(),
        activeUsers: getActiveUsers(),
        mouseX: mousedata.mouseX,
        mouseY: mousedata.mouseY
    };
}

function computeStats() {

    return {
        pages: computePageCounts(),
        referrers: computeRefererCounts(),
        activeUsers: getActiveUsers(),
        mouseX: mousedata.mouseX,
        mouseY: mousedata.mouseY
    };
}

function computePageCounts() {
    var pageCounts = {};
    for (var key in visitorsData) {
        var page = visitorsData[key].page;
        if (page in pageCounts) {
            pageCounts[page]++;
        } else {
            pageCounts[page] = 1;
        }
    }
    return pageCounts;
}


function computeRefererCounts() {

    var referrerCounts = {};
    for (var key in visitorsData) {
        var referringSite = visitorsData[key].referringSite || '(direct)';
        if (referringSite in referrerCounts) {
            referrerCounts[referringSite]++;
        } else {
            referrerCounts[referringSite] = 1;
        }
    }
    return referrerCounts;
}

// get the total active users on our site
function getActiveUsers() {
    return Object.keys(visitorsData).length;
}

http.listen(app.get('port'), function() {
    console.log('listening on *:' + app.get('port'));
});

function insertIntoDB(data, id) {

    MongoClient.connect(url, function(err, db) {
        if (err)
            throw err;
        var page_url = data.split("&")[1];
        var browser_app = data.split("&")[5];
        var devices = data.split("&")[6];
        var clickonpage = parseInt(data.split("&")[12]);
        var scrollPos = parseInt(data.split("&")[14]);
        var page_title = data.split("&")[15];
        var reffer = data.split("&")[16];
        var ip = data.split("&")[9];
        var country_name = data.split("&")[10];
        var user_state = data.split("&")[17];
        var user_date = data.split("&")[18];
        var user_time = data.split("&")[19];
        var uniqpageViewid = data.split("&")[21];
        var lang = data.split("&")[2];
        var map = data.split("&")[22];
        var isp = data.split("&")[23];
        var resolution = data.split("&")[3]+"X"+data.split("&")[4];
        var trackData = {
            visitor_id: uniqpageViewid,
            page_url: page_url,
            browser_app: browser_app,
            devices: devices,
            clickonpage: clickonpage,
            scrollPos: scrollPos,
            page_title: page_title,
            reffer: reffer,
            ip: ip,
            country_name: country_name,
            user_state: user_state,
            user_date: new Date(user_date),
            user_time: user_time,
            lang:lang,
            map:map,
            isp:isp,
            resolution:resolution
        };
        var query = {page_url: page_url, visitor_id: uniqpageViewid};
        db.collection("data").find(query).toArray(function(err, result) {
            if (err)
                throw err;

            if (result.length === 0) {
                db.collection("data").insertOne(trackData, function(err, res) {
                    if (err)
                        throw err;

                    db.close();
                });
            } else {
                var myquery = {page_url: page_url};
                var newvalues = trackData;
                db.collection("data").updateOne(myquery, newvalues, function(err, res) {
                    if (err)
                        throw err;

                    db.close();
                });

            }
            db.close();
        });
        /* enter data in pageview table */

    });
    MongoClient.connect(url, function(err, db) {
        var page_view = parseInt(data.split("&")[20]);
        var uniqpageViewid = data.split("&")[21];
        var user_date = data.split("&")[18];
        var user_time = data.split("&")[19];
        var pageView = {
            page_view: page_view,
            uniqpageViewid: uniqpageViewid,
            user_date: new Date(user_date),
            user_time: user_time
        };
        db.collection("pageview").find({uniqpageViewid: uniqpageViewid}).toArray(function(err, result) {
            if (err)
                throw err;

            if (result.length === 0) {
                db.collection("pageview").insertOne(pageView, function(err, res) {
                    if (err)
                        throw err;

                    db.close();
                });
            } else {
                var myquery = {uniqpageViewid: uniqpageViewid};
                var newvalues = pageView;
                db.collection("pageview").updateOne(myquery, newvalues, function(err, res) {
                    if (err)
                        throw err;

                    db.close();
                });

            }
            db.close();
        });
    });
}

function getMongoData(query) {

    MongoClient.connect(url, function(err, db) {
        if (err)
            throw err;

        db.collection("data").find(query).toArray(function(err, result) {
            if (err)
                throw err;
            return result.length;
            db.close();
        });
    });


}

function heatMapTableInsert(data) {
    var trackDataheatmap = {
        page_url: data.split('&')[1],
        x: parseInt(data.split('&')[7]),
        y: parseInt(data.split('&')[8]),
        page_height: parseInt(data.split('&')[3]),
        page_width: parseInt(data.split('&')[4])
    };
    MongoClient.connect(url, function(err, db) {
        if (err)
            throw err;
        db.collection("heatmap").insertOne(trackDataheatmap, function(err, res) {
            if (err)
                throw err;

            db.close();
        });
    });
}

