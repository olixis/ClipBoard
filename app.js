var express = require('express');
var compression = require('compression')
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var needle = require('needle');
var emptyDir = require('empty-dir');
var log4node = require('log4node');
    log = new log4node.Log4Node({level: 'info', file: 'clipboard.log'});
var favicon = require('serve-favicon');
 

setInterval(clearTrashFolders, 1000 * 1);

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        var separator = makeid();
        fs.mkdirSync(__dirname + '/uploads/' + separator);
        cb(null, 'uploads/' + separator)

    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var limits = {
    files: 1,
    fileSize: 101000000 // 100 MB
};

var upload = multer({
    storage: storage,
    limits: limits
});


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
log.info(app.get('env'));
app.disable('x-powered-by');
app.use(favicon(__dirname + '/public/favicon/favicon.ico'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.engine('html', require('jade').renderFile);
//app.set("view options", {layout: false});


app.get('/', function(req, res, next) {
    res.render('index.jade');
});

app.get('/500', function(req, res, next) {
    res.render('500.jade');
});

app.get('/about', function(req, res, next) {
    res.render('about.jade');
});

app.get('/404', function(req, res, next) {
    res.render('404.jade');
});

app.get('/tos', function(req, res, next) {
    res.render('tos.jade');
});


app.post('/', upload.single('file'), function(req, res, next) {
    var path = req.file.path;
    var newPath = path.substring(0, 14) + req.file.originalname;
    log.info(req.ip + "uploaded: " + req.file.originalname);
    fs.rename(path, newPath, function(err) {
        var downloadPath = newPath.substring(8, 13);
        var url = 'http://clipboard.host/download/' + downloadPath + '/' + req.file.originalname;

        needle.secrepath = newPath;
        needle.post('https://www.google.com/recaptcha/api/siteverify', {
            secret: '6LcZtQ0UAAAAAPr5MbPk2RTk1h2yVT2e8vtJfReU',
            response: req.body['g-recaptcha-response']
        }, function(err, response, body) {
            if (err) {
                deleteAfterUpload(__dirname + '/' + newPath, __dirname + '/' + dir, next, res);
                //next(Error('Not Found'));
            } else {
                if (body.success) {
                    res.send('The download link for your file is: ' + url);
                } else {
                    var dir = needle.secrepath.split('/')[0] + '/' + needle.secrepath.split('/')[1];
                    deleteAfterUpload(__dirname + '/' + newPath, __dirname + '/' + dir, next, res);
                    //next(Error('Not Found'));
                }
            }
        });
    });
});

app.get('/download/:folder/:filename', function(req, res, next) {
    var filename = req.params.filename;
    var folder = req.params.folder;
    log.info(req.ip + "downloaded: " + folder + '\\' + filename);
    res.download(__dirname + '/uploads' + '/' + folder + '/' + filename, filename, function(err) {
        if (err) {
            log.error(err);
            res.render('404.jade');
        } else {
            var pathFile = __dirname + '/uploads' + '/' + folder + '/' + filename;
            var pathDir = __dirname + '/uploads' + '/' + folder + '/';
            deleteAfterUpload(pathFile, pathDir, next, res)
        }
    });
});

var deleteAfterUpload = function(path, pathDir, next, res) {
    fs.unlink(path, function(err) {
        if (err) log.error(err);
        fs.rmdir(pathDir, function(err) {
            next('Finish the captcha Properly.');
        });
        log.info('file ' + path + ' successfully deleted');
    });
};

function errorHandler(err, req, res, next) {
    //console.error(err.stack)
    console.error(err.status = 500);
    res.status(500);
    res.send(err);
}


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(errorHandler);
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
//app.use('/users', users);

//catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('error', {
        error: err
    })
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function clearTrashFolders() {
    fs.readdir(__dirname + '/' + 'uploads', function(err, listaDir) {
        for (var index = 0; index < listaDir.length; index++) {
            var element = listaDir[index];
            var caminhoVazios = __dirname + '/' + 'uploads' + '/' + element;
            emptyDir(caminhoVazios, function(err, result) {
                if (result) {
                    fs.rmdir(caminhoVazios, function(err) {
                        if (err) {
                        } else {
                           log.info('diretorio lixo: ' + caminhoVazios + ' foi apagado com sucesso!');
                        }
                    });
                }
            });
        }
    });

}

module.exports = app;