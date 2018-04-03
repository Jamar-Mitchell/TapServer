var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var User = require(libs + 'model/user');
var Attendance = require(libs + 'model/attendance')
var log = require(libs + 'log')(module);
var Course = require(libs + 'model/course')
var db = require(libs + 'db/mongoose');
var set = false;
var courseId;
var attendanceId;


router.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

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

router.get('/info', passport.authenticate('bearer', { session: false }),
    function(req, res) {
        // req.authInfo is set using the `info` argument supplied by
        // `BearerStrategy`.  It is typically used to indicate scope of the token,
        // and used in access control checks.  For illustrative purposes, this
        // example simply returns the scope in the response.
        res.json({
            _id: req.user.userId,
            username: req.user.username,
            firstname:req.user.firstname,
            lastname: req.user.lastname,
            email:req.user.email,
            studentId:req.user.studentId,
            scope: req.authInfo.scope
        });
    }
);

router.get('/userinfo/:id', passport.authenticate('bearer', { session: false }),
    function(req, res) {
        User.findOne({ _id: req.params.id }, (err, user) => {
            if (!user) {
                res.statusCode = 404;

                return res.json({
                    error: 'Not found'
                });
            }

            if (!err) {
                return res.json({
                    status: 'OK',
                    user: user
                });
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

router.post('/enable',
    function(req, res) {
                set = true;
                courseId = req.body.courseId;
                attendanceId = req.body.attendanceId;
                return res.json({
                 message:"attendance has been set"
             
    });

});

router.post('/disable',
    function(req, res) {
                set = false;
                return res.json({
                 message:"attendance has been stopped"
             
    });

});

router.get('/test',
    function(req, res) {
                return res.json({
                    set,
                    courseId,
                    attendanceId       
    });

});
router.post('/course/:courseId/attendance/:attendanceId/user/:studentId',
    function(req, res) {
        User.findOne({ studentId: req.params.studentId }, function(err, user) {
            if (!user) {
                res.statusCode = 404;
                
                return res.json({
                    error: 'User not found'
                });
            }

            if (!err) {
                console.log(user);
                Attendance.update({ _id: req.params.attendanceId }, {
                    $push: { user: user._id },
                    $inc: { attendanceCount: 1 }
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
    }
);


router.get('/attendance/:id', passport.authenticate('bearer', { session: false }),
    function(req, res) {
        Attendance.findOne({ _id: req.params.id })
            .populate('user')
            .exec(function(err, obj) {

                if (!err) {
                    return res.json(obj);
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


router.post('/', passport.authenticate('oauth2-client-password', { session: false }),
    function(req, res) {

        var user = new User({
            username: req.body.username,
            firstname:req.body.firstname,
            lastname: req.body.lastname,
            studentId:req.body.studentId,
            email: req.body.email,
            password: req.body.password,
        });

        user.save(function(err, user) {
            if (!err) {
                res.send(200);
            } else {
                log.info(err.code);
                if (err.code === 11000) {
                    res.statusCode = 405;
                    res.statusMessage = ' Username or id already exists';
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
     Course.findOne({ _id: req.params.userId },
            function(err, user) {

                if (!err) {
                   User.update({ _id: req.params.courseId }, {
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