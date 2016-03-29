var express          = require('express')
    app              = express(),
    passport         = require('passport'),
    Strategy         = require('passport-facebook').Strategy,
    mongoose         = require('mongoose'),
    cookieParser     = require('cookie-parser');
