const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load Input Validation
const validateRegisterInput = require('../../validation/register');

// Load User Model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Users Work"}));

// @route   GET api/users/register
// @desc    Register users
// @access  Public
router.post('/register', (req, res) => {
    const {errors, isValid} = validateRegisterInput(req.body);
    
    // Check Validation
    if(!isValid){
        return res.status(400).json(errors);
    }
    
    // search for email if it match
    User.findOne({ email: req.body.email })
        .then(user => {
            if(user){
                errors.email = 'Email Already Exists';
                return res.status(400).json(errors);
            }
            else{
                const avatar = gravatar.url(req.body.email, {
                    s: '200', // Size
                    r: 'pg', // Rating
                    d: 'mm' // Defalt
                });
                
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                });
                
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        // hash the password
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    });
                });
            }
        });
});

// @route   GET api/users/login
// @desc    Login Users / Returning JWT Token
// @access  Public
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    
    // Find user by email
    User.findOne({email})
        .then(user => {
            // Check for user
            if(!user){
                return res.status(404).json({email: 'User email not found'});
            }
            // Check Password
            // bcrypt.compare unhash the password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch){
                        // User Matched
                        
                        // Create JWT Payload
                        const payload = {id: user.id, name: user.name, avatar: user.avatar};
                        
                        // Sign Token
                        jwt.sign(
                            payload,
                            keys.secretOrKey,
                            {expiresIn: 3600},
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                });
                        });
                    }
                    else{
                        return res.status(400).json({password: 'Password Incorrect'});
                    }
                });
        });
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

module.exports = router;