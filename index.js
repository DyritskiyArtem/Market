const express = require('express');
const pug = require('pug');
const fs = require('fs');

const compiledFunction = pug.compileFile("userList.pug");
const compiledFunctionRegister = pug.compileFile("register.pug");
const compiledFunctionLogin = pug.compileFile("login.pug");

const app = express();
const port = 1000;

let usersList = require("./usersList.json");
const { password } = require('telegram');

app.use(express.urlencoded({ extended: true })); 
app.use(express.static("public"));

app.get('/register', (req, res) => {
    let {error} = req.query

    res.send(compiledFunctionRegister({
        error
    }));
});

app.get('/login', (req, res) => {
    let {error} = req.query

    res.send(compiledFunctionLogin({
        error
    }));
});

app.post('/register', (req, res) => {
    const { name, login, password } = req.body;

    if (name.length < 3 || name.length > 25) {
        res.redirect('/register?error=Name must be between 3 and 25 characters')
        return;
    }

    if (password.length < 8 || password.length > 25) {
        res.redirect('/register?error=Password must be between 8 and 25 characters')
        return;
    }

    for (let i = 0; i < usersList.length; i++) {
        const user = usersList[i];
        if (user.login === login) {
            res.redirect('/register?error=This login already exists');
            return;
        }
    }

    if (login.length < 3 || login.length > 25) {
        res.redirect('/register?error=Login must be between 3 and 25 characters')
        return;
    }

    usersList.push({ name, login, password });
    let json = JSON.stringify(usersList);
    fs.writeFileSync("./usersList.json", json);

    res.send(compiledFunction({
        login: login,
        users: usersList,
    }));

});

app.post('/login', (req, res) => {
    const {login, password} = req.body;

    let userFound = false;
    for (let i = 0; i < usersList.length; i++) {
        const user = usersList[i];
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

app.listen(port, () => {
  console.log(`The server is running on http://localhost:${port}`);
});
