const express = require('express');
const app = express();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

app.get('/', (req, res, next) => {
	return res.render('index.ejs');
});


app.post('/', (req, res, next) => {
	console.log(req.body);
	let personInfo = req.body;


	if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({ email: personInfo.email }, (err, data) => {
				if (!data) {
					let c;
					// let	hashed_pass;
					User.findOne({}, (err, data) => {

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						} else {
							c = 1;
						}
						bcrypt.hash(personInfo.password, saltRounds, function(err, hash) {
    				if (err){
							console.log(err);
						}
						else{
						console.log(hash);
						let newPerson = new User({
							unique_id: c,
							email: personInfo.email,
							username: personInfo.username,
							password: hash,
							passwordConf: personInfo.passwordConf
						});
						console.log(newPerson);

						newPerson.save((err, Person) => {
							if (err)
								console.log(err);
							else
								console.log('Success');
						});
						}
						});


					}).sort({ _id: -1 }).limit(1);
					res.send({ "Success": "You are regestered,You can login now." });
				} else {
					res.send({ "Success": "Email is already used." });
				}

			});
		} else {
			res.send({ "Success": "password is not matched" });
		}
	}
});

app.get('/login', (req, res, next) => {
	return res.render('login.ejs');
});

app.post('/login', (req, res, next) => {
	//console.log(req.body);
	User.findOne({ email: req.body.email }, (err, data) => {
		console.log(data);
		let if_same;
		if (data) {
			bcrypt.compare(req.body.password, data.password, function(err, result) {
    			if_same=result;
					console.log(result);
					if (result) {
						//console.log("Done Login");
						req.session.userId = data.unique_id;
						res.send({ "Success": "Success!" });

					} else {
						res.send({ "Success": "Wrong password!" });
					}
			});

		} else {
			res.send({ "Success": "This Email Is not regestered!" });
		}
	});
});

app.get('/profile', (req, res, next) => {
	console.log("profile");
	User.findOne({ unique_id: req.session.userId }, (err, data) => {
		// console.log("data");
		// console.log(data);
		if (!data) {
			res.redirect('/');
		} else {
			//console.log("found");
			return res.render('data.ejs', { "name": data.username, "email": data.email });
		}
	});
});

app.get('/logout', (req, res, next) => {
	console.log("logout")
	if (req.session) {
		// delete session object
		req.session.destroy((err) => {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
});



module.exports = app;
