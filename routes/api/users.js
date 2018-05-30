const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

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
    // search for email if it match
    User.findOne({ email: req.body.email })
        .then(user => {
            if(user){
                return res.status(400).json({email: 'Email Already Exists'});
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
                        res.json({msg: 'Success'});
                    }
                    else{
                        return res.status(400).json({password: 'Password Incorrect'});
                    }
                });
        });
});

module.exports = router;