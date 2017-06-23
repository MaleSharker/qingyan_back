/**
 * Created by cc on 17/6/23.
 */

const passport = require('passport');
const request = require('request');
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStragegy = require('passport-twitter').Strategy;
const OpenIDStrategy = require('passport-openid').Strategy;
const OAuthStrategy = require('passport-oauth').OAuthStrategy;
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

