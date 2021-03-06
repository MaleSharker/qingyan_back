/**
 * Created by cc on 17/6/23.
 */

const passport = require('passport');
const request = require('request');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const OpenIDStrategy = require('passport-openid').Strategy;

const User = require('../api/user/models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email'}, (email,password,done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) { return done(err); }
        if  (!user){
            return done(null, false, { msg:`Email ${email} not found.` });
        }
        user.comparePassword(password, (err, isMatch) => {
            if (err) { return done(err); }
            if (isMatch){
                return done(null, user);
            }
            return done(null, false, { msg:'Invalid email or password.'});
        });
    });
}));

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *  - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['name','email','link', 'local', 'timezone'],
    passReqToCallback: true
},(req, accessToken, refreshToken, profile,done) => {
    if (req.user) {
        User.findOne({ facebook:profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            if (existingUser) {
                req.flash('errors', { msg: 'There is already a Facebook account that belongs to you.'});
                done(err);
            } else {
                User.findById(req.user.id, (err, user) => {
                    if (err) {
                        return done(err);
                    }
                    user.facebook = profile.id;
                    user.tokens.push({ kind: 'facebook', accessToken});
                    user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
                    user.profile.gender = user.profile.gender || profile._json.gender;
                    user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
                    user.save((err) => {
                        req.flash('info', { msg: 'Facebook account has been linked.' });
                        done(err,user);
                    });
                });
            }
        });
    } else {
        User.findOne({ facebook: profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            if (existingUser) {
                return done(null, existingUser);
            }
            User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
                if (err) { return done(err); }
                if (existingEmailUser) {
                    req.flash('errors', { msg: 'There is already an account using this email address.' });
                    done(err);
                }else {
                    const  user = new User();
                    user.email = profile._json.email;
                    user.facebook = profile.id;
                    user.tokens.push({ kind:'facebook',accessToken });
                    user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
                    user.profile.gender = profile._json.gender;
                    user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
                    user.profile.location = (profile._json.location) ? profile._json.location.name : '';
                    user.save((err) => {
                        done(err, user);
                    });
                }
            });
        });
    }
}));

/**
 * Sign in with GitHub.
 */
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: '/auth/github/callback',
    passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
    if (req.user) {
        User.findOne({ github: profile.id }, (err, existingUser) => {
            if (existingUser) {
                req.flash('errors', { msg: 'There is already a GitHub account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
                done(err);
            } else {
                User.findById(req.user.id, (err, user) => {
                    if (err) { return done(err); }
                    user.github = profile.id;
                    user.tokens.push({ kind: 'github', accessToken });
                    user.profile.name = user.profile.name || profile.displayName;
                    user.profile.picture = user.profile.picture || profile._json.avatar_url;
                    user.profile.location = user.profile.location || profile._json.location;
                    user.profile.website = user.profile.website || profile._json.blog;
                    user.save((err) => {
                        req.flash('info', { msg: 'GitHub account has been linked.' });
                        done(err, user);
                    });
                });
            }
        });
    } else {
        User.findOne({ github: profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            if (existingUser) {
                return done(null, existingUser);
            }
            User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
                if (err) { return done(err); }
                if (existingEmailUser) {
                    req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with GitHub manually from Account Settings.' });
                    done(err);
                } else {
                    const user = new User();
                    user.email = profile._json.email;
                    user.github = profile.id;
                    user.tokens.push({ kind: 'github', accessToken });
                    user.profile.name = profile.displayName;
                    user.profile.picture = profile._json.avatar_url;
                    user.profile.location = profile._json.location;
                    user.profile.website = profile._json.blog;
                    user.save((err) => {
                        done(err, user);
                    });
                }
            });
        });
    }
}));

/**
 * Steam API OpenID.
 */
passport.use(new OpenIDStrategy({
    apiKey: process.env.STEAM_KEY,
    providerURL: 'http://steamcommunity.com/openid',
    returnURL: 'http://localhost:3000/auth/steam/callback',
    realm: 'http://localhost:3000/',
    stateless: true
}, (identifier, done) => {
    const steamId = identifier.match(/\d+$/)[0];
    const profileURL = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_KEY}&steamids=${steamId}`;

    User.findOne({ steam: steamId }, (err, existingUser) => {
        if (err) { return done(err); }
        if (existingUser) { return done(err, existingUser); }
        request(profileURL, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const data = JSON.parse(body);
                const profile = data.response.players[0];

                const  user = new User();
                user.steam = steamId;
                user.email = `${steamId}@steam.com`; // steam does not disclose emails, prevent duplicate keys
                user.tokens.push({ kind: 'steam', accessToken: steamId});
                user.profile.name = profile.personname;
                user.profile.picture = profile.avatarmedium;
                user.save((err) => {
                    done(err, user);
                });
            } else {
                done(error, null);
            }
        });
    });

}));


/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
    const provider = req.path.split('/').slice(-1)[0];
    const token = req.user.tokens.find(token => token.kind === provider);
    if (token) {
        next();
    } else {
        res.redirect(`/auth/${provider}`);
    }
};





