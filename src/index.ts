const express = require('express');
const multer = require('multer');
const pug = require('pug');
const path = require('path');
const fs = require('fs');
import{Request, Response} from "express";

const compiledFunction = pug.compileFile("pug/home.pug");
const compiledFunctionRegister = pug.compileFile("pug/register.pug");
const compiledFunctionLogin = pug.compileFile("pug/login.pug");
const compiledFunctionMyAds = pug.compileFile("pug/myAds.pug");
const compiledFunctionAddItem= pug.compileFile("pug/addItem.pug");
const compiledFunctionItem= pug.compileFile("pug/item.pug");
const app = express();
const port = 1000;

let usersList = require("../usersList.json");

interface Item {
    photo: string,
    title: string,
    descriptions: string,
    price: number,
}

let itemList: Item[] = require("../items.json")
app.use(express.urlencoded({ extended: true })); 
app.use(express.static("public"));

// Налаштування сховища для завантажених файлів
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: any) => {
      cb(null, "public/uploads");
    },
    filename: (req: Request, file: Express.Multer.File, cb: any) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  
  const upload = multer({ storage: storage });

app.get('/', (req: Request, res: Response) => {
    res.send(compiledFunction({
        title: "DAMarket",
        itemList
    }));
});

app.get('/myAds', (req: Request, res: Response) => {
    res.send(compiledFunctionMyAds({
        title: "My ads | DAMarket"
    }));
});

app.get('/submit-order', (req: Request, res: Response) => {
    res.redirect("/");
});

app.get('/addItem', (req: Request, res: Response) => {
    let {error} = req.query

    // let {login} = req.cookies;

    res.send(compiledFunctionAddItem({
        error,
        title: "Add item | DAMarket",
        // login
    }));
});

app.post('/addItem',  upload.single("file"), (req: Request, res: Response) => {
    const {descriptions, price, title} = req.body;

    if (req.file == undefined) {
        res.redirect('/addItem?error=You need to upload a photo');
        return;
    }

    if (descriptions.length < 10 || descriptions.length > 150) {
        res.redirect('/addItem?error=Description must be between 10 and 150 characters');
        return;
    }

    if (price.length < 0 || price.length > 6) {
        res.redirect('/addItem?error=The price of the product must be from 0 to 100,000$');
        return;
    }

    let photo = "uploads/" + req.file.filename;
    itemList.push({title, descriptions, price, photo});
    let json = JSON.stringify(itemList);
    fs.writeFileSync("../items.json", json);
    res.redirect('/');
});

app.get('/item', (req: Request, res: Response) => {
    let {id} = req.query;

    if (id == undefined) {
        res.redirect("/");
        return;
    }

    res.send(compiledFunctionItem({
        title: "Item | DAMarket",
        item: itemList[+id],
    }));
});

app.get('/register', (req: Request, res: Response) => {
    let {error} = req.query;

    res.send(compiledFunctionRegister({
        error,
        title: "Register | DAMarket"
    }));
});

app.get('/login', (req: Request, res: Response) => {
    let {error} = req.query

    res.send(compiledFunctionLogin({
        error,
        title: "Login | DAMarket"
    }));
});

app.post('/register', (req: Request, res: Response) => {
    const { name, login, password } = req.body;

    // if (name.length < 3 || name.length > 25) {
    //     res.redirect('/register?error=Name must be between 3 and 25 characters');
    //     return;
    // }

    // if (password.length < 8 || password.length > 25) {
    //     res.redirect('/register?error=Password must be between 8 and 25 characters');
    //     return;
    // }

    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,25}$/;
    // if (!passwordRegex.test(password)) {
    //     res.redirect('/register?error=Password must contain at least one uppercase letter, one lowercase letter, and one digit')
    //     return;
    // }

    // for (let i = 0; i < usersList.length; i++) {
    //     const user = usersList[i];
    //     if (user.login === login) {
    //         res.redirect('/register?error=This login already exists');
    //         return;
    //     }
    // }

    // if (login.length < 3 || login.length > 25) {
    //     res.redirect('/register?error=Login must be between 3 and 25 characters')
    //     return;
    // }

    usersList.push({ name, login, password });
    let json = JSON.stringify(usersList);
    fs.writeFileSync("./usersList.json", json);

    res
        .cookie( "login", login, {path: "/", expires: new Date(10000000000000), sameSite: 'lax'}) // додати при відправки на GitHub httpOnly: true, secure: true
        .cookie( "password", password, {path: "/", expires: new Date(10000000000000), sameSite: 'lax'}); // додати при відправки на GitHub httpOnly: true, secure: true
    res.redirect('/');
});

app.post('/login', (req: Request, res: Response) => {
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
