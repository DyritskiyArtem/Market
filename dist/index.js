"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var pug = require('pug');
var fs = require('fs');
var compiledFunction = pug.compileFile("pug/userList.pug");
var compiledFunctionRegister = pug.compileFile("pug/register.pug");
var compiledFunctionLogin = pug.compileFile("pug/login.pug");
var compiledFunctionMyAds = pug.compileFile("pug/myAds.pug");
var compiledFunctionAddItem = pug.compileFile("pug/addItem.pug");
var app = express();
var port = 1000;
var usersList = require("../usersList.json");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get('/myAds', function (req, res) {
    res.send(compiledFunctionMyAds({
        title: "My ads | DAMarket"
    }));
});
app.get('/addItem', function (req, res) {
    var error = req.query.error;
    res.send(compiledFunctionAddItem({
        error: error,
        title: "Add item | DAMarket"
    }));
});
app.post('/addItem', function (req, res) {
    var _a = req.body, description = _a.description, price = _a.price;
    if (description.length < 10 || description.length > 150) {
        res.redirect('/addItem?error=Description must be between 10 and 150 characters');
        return;
    }
    if (price.length < 0 || price.length > 6) {
        res.redirect('/addItem?error=The price of the product must be from 0 to 100,000$');
        return;
    }
});
app.get('/register', function (req, res) {
    var error = req.query.error;
    res.send(compiledFunctionRegister({
        error: error,
        title: "Register | DAMarket"
    }));
});
app.get('/login', function (req, res) {
    var error = req.query.error;
    res.send(compiledFunctionLogin({
        error: error,
        title: "Login | DAMarket"
    }));
});
app.post('/register', function (req, res) {
    var _a = req.body, name = _a.name, login = _a.login, password = _a.password;
    if (name.length < 3 || name.length > 25) {
        res.redirect('/register?error=Name must be between 3 and 25 characters');
        return;
    }
    if (password.length < 8 || password.length > 25) {
        res.redirect('/register?error=Password must be between 8 and 25 characters');
        return;
    }
    var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,25}$/;
    if (!passwordRegex.test(password)) {
        res.redirect('/register?error=Password must contain at least one uppercase letter, one lowercase letter, and one digit');
        return;
    }
    for (var i = 0; i < usersList.length; i++) {
        var user = usersList[i];
        if (user.login === login) {
            res.redirect('/register?error=This login already exists');
            return;
        }
    }
    if (login.length < 3 || login.length > 25) {
        res.redirect('/register?error=Login must be between 3 and 25 characters');
        return;
    }
    usersList.push({ name: name, login: login, password: password });
    var json = JSON.stringify(usersList);
    fs.writeFileSync("./usersList.json", json);
    res.send(compiledFunction({
        login: login,
        users: usersList,
    }));
});
app.post('/login', function (req, res) {
    var _a = req.body, login = _a.login, password = _a.password;
    var userFound = false;
    for (var i = 0; i < usersList.length; i++) {
        var user = usersList[i];
        if (user.login === login) {
            userFound = true;
            if (user.password !== password) {
                res.redirect('/login?error=Your login or password is incorrect');
                return;
            }
        }
    }
    if (userFound == false) {
        res.redirect('/login?error=Your login or password is incorrect');
        return;
    }
    res.send(compiledFunction({
        login: login,
        users: usersList,
    }));
});
app.listen(port, function () {
    console.log("The server is running on http://localhost:".concat(port));
});
