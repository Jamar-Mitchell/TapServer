var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var User = require(libs + 'model/user');
var Attendance = require(libs + 'model/attendance')
var log = require(libs + 'log')(module);
var Course = require(libs + 'model/course')
var db = require(libs + 'db/mongoose');

router.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header("Access-Control-Allow-Credentials", value = "true");
    log.info(req.method);
    //intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
        //respond with 200
        res.send(200);
    } else {
        //move on
        next();
    }
});

router.get('/', passport.authenticate('bearer', { session: false }),
    function(req, res) {
        Course.find({}, function(err, courses) {
        if (!err) {
            return res.json(courses);
        } else {
            res.statusCode = 500;

            log.error('Internal error(%d): %s', res.statusCode, err.message);

            return res.json({
                error: 'Server error'
            });
        }
    });
    }
);


router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var course = new Course({
        name: req.body.name
    });

    course.save(function(err, obj) {
        if (!err) {
                res.send(200);
            } else {
                log.info(err.code);
                if (err.code === 11000) {
                    res.statusCode = 405;
                    res.statusMessage = 'course already exists';
                    res.end();
                } else {
                    res.statusCode = 500;

                    log.error('Internal error(%d): %s', res.statusCode, err.message);

                    res.json({
                        error: 'Server error'
                    });
                }
            }
    });

});

router.post('/user/:userId/course/:courseId', function(req, res) {
     User.findOne({ _id: req.params.userId },
            function(err, user) {

                if (!err) {
                   Course.update({ _id: req.params.courseId }, {
                    $push: { user: user._id },
                    $inc: { numOfStudents: 1 }
                },
               function(err, obj) {
                    if (!err) {
                        return res.json({
                            status: 'OK',
                            response: obj
                        });
                    }
                });
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s', res.statusCode, err.message);

                    return res.json({
                        error: 'Server error'
                    });
                }
            });
   
});

module.exports = router;