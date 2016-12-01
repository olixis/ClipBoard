var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var adfly = require("adf.ly")("653bc0a7d5a4dcd20b98e7c0c2534f0b");


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var separator = makeid();
        fs.mkdirSync(__dirname + '/uploads/' + separator);
        cb(null, 'uploads/' + separator)

    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var limits = {
    files: 1,
    fileSize: 101000000 // 100 MB
};

var upload = multer({ storage: storage, limits: limits });


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});


app.post('/', upload.single('file'), function (req, res, next) {
    var path = req.file.path;
    var newPath = path.substring(0, 14) + req.file.originalname;
    console.log(req.ip + "uploaded: " + req.file.originalname);
    fs.renameSync(path, newPath);
    deleteAfterUpload(newPath);
    var downloadPath = newPath.substring(8, 13);
    var url = 'http://whisperfiles.host/download/' + downloadPath + '/' + req.file.originalname;
    res.send('The download link for your file is: ' + url);


    //res.send('The download link for your file is: ' + link);
    //res.render('index', {title: 'Express'});

});

app.get('/download/:folder/:filename', function (req, res, next) {
    var filename = req.params.filename;
    var folder = req.params.folder;
    console.log(req.ip + "downloaded: " + folder + '\\' + filename);
    res.download(__dirname + '/uploads' + '/' + folder + '/' + filename, filename, function (err) {
        if (err) {
            console.log(err);
            res.end();
        }
    });
});

var deleteAfterUpload = function (path) {
    setTimeout(function () {
        fs.unlink(path, function (err) {
            if (err) console.log(err);
            var dir = path.substring(0,13);
            fs.rmdirSync(dir);
            console.log('file ' + path + ' successfully deleted');
        });
    }, 10 * 1000);
};

function errorHandler(err, req, res, next) {
    //console.error(err.stack)
    console.error(err.status = 500);
    res.status(500);
    res.render('error', { error: err });
}


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(errorHandler);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
app.use('/users', users);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('error', { error: err })
});
//
//// error handlers
//
//// development error handler
//// will print stacktrace
//if (app.get('env') === 'development') {
//    app.use(function (err, req, res, next) {
//        res.status(err.status || 500);
//        res.render('error', {
//            message: err.message,
//            error: err
//        });
//    });
//}
//
//// production error handler
//// no stacktraces leaked to user
//app.use(function (err, req, res, next) {
//    res.status(err.status || 500);
//    res.render('error', {
//        message: err.message,
//        error: {}
//    });
//});
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = app;
