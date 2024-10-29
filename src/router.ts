import {Express} from "express";
import {Item, User, Notification} from "./data";
import{Request, Response} from "express";
import { userInfo } from "os";
const {Currency, usersList, itemList, getUser} = require('./data.ts');
const {createToken, verifyToken, getLoginToken} = require('./token.ts');
const upload = require('./upload.ts');
const pug = require('pug');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

declare global {
    namespace Express {
      interface Request {
        login: string | null
      }
    }
}

module.exports = function makeRouter(app: Express) {
    const compiledFunction = pug.compileFile("pug/home.pug");
    const compiledFunctionRegister = pug.compileFile("pug/register.pug");
    const compiledFunctionLogin = pug.compileFile("pug/login.pug");
    const compiledFunctionMyAds = pug.compileFile("pug/myAds.pug");
    const compiledFunctionAddItem = pug.compileFile("pug/addItem.pug");
    const compiledFunctionItem = pug.compileFile("pug/item.pug");
    const compiledFunctionProfil = pug.compileFile("pug/profil.pug");
    const compiledFunctionEditItem = pug.compileFile("pug/edititem.pug");
    const compiledFunctionNotifications = pug.compileFile("pug/notifications.pug");
    
    app.get('/', verifyToken, (req: Request, res: Response) => {
        let { name, min, max } = req.query;
        let login = req.login;
    
        let user = getUser(login!);
    
        let filteredItems = itemList;
    
        if (name) {
            filteredItems = filteredItems.filter((item: Item) => 
                item.authorLogin.includes((name as string))
            );
        }
    
        if (min) {
            filteredItems = filteredItems.filter((item: Item) => 
                item.price >= parseFloat(min as string)
            );
        }
    
        if (max) {
            filteredItems = filteredItems.filter((item: Item) => 
                item.price <= parseFloat(max as string)
            );
        }
    
        res.send(compiledFunction({
            title: "DAMarket",
            itemList: filteredItems,
            user,
            currencies: Currency
        }));
    });
    
    app.get('/profile', verifyToken, (req: Request, res: Response) => {
        let login = req.login;
    
        let user = getUser(login!);
    
        res.send(compiledFunctionProfil({
            title: "Profile | DAMarket",
            user,
        }));
    });
    
    app.post('/editProfile', verifyToken, upload.single("file"), (req: Request, res: Response) => {
        const { name, password } = req.body;
        const login = req.login;
    
        let user = getUser(login!);
        if (user == null) {return}
            
        if (login == user.login) {
            user.name = name;
            user.password = password;
    
            if (req.file !== undefined) {
                let photo = "uploads/" + req.file.filename;
                user.photo = photo;
            }
    
            let json = JSON.stringify(usersList);
            fs.writeFileSync("./usersList.json", json);
    
            res.redirect('/profile');
            return;
        }
    });
    
    app.get('/myAds', verifyToken, (req: Request, res: Response) => {
        let login = req.login;
        let user = getUser(login!);
    
        res.send(compiledFunctionMyAds({
            title: "My ads | DAMarket",
            itemList,
            user,
            currencies: Currency
        }));
    });
    
    app.get('/editItem', verifyToken, (req: Request, res: Response) => {
        let {id, error} = req.query;
        let login = req.login;
    
        let user = getUser(login!);
    
        if (id == undefined) {
            res.redirect("/myAds");
            return;
        }
    
        let item = null;
    
        for (let i = 0; i < itemList.length; i++) {
            const item2 = itemList[i];
            if (item2.id == id) {
                item = item2;
                break;
            }
        }
    
        if (item == null) {
            res.redirect("/myAds");
            return
        }
        
        if (item.authorLogin !== login) {
            res.redirect("/myAds");
            return;
        }
    
        res.send(compiledFunctionEditItem({
            error,
            title: "Edit Item | DAMarket",
            item,
            login,
            user,
            currencies: Currency // Object.keys(Currency)
        }));
    });
    
    app.post('/editItem', verifyToken, upload.single("file"), (req: Request, res: Response) => {
        const {id, title, descriptions, price, currency} = req.body;
        const login = req.login;
    
        console.log(id);
        
    
        let item = null;
    
        for (let i = 0; i < itemList.length; i++) {
            const item2 = itemList[i];
            if (item2.id == id) {
                item = item2;
                break;
            }
        }
    
        if (item == null) {
            res.redirect("/myAds");
            return
        }
    
        if (item.authorLogin !== login) {
            res.redirect("/myAds");
            return;
        }
    
        if (descriptions.length < 10 || descriptions.length > 150) {
            res.redirect(`/editItem?error=Description must be between 10 and 150 characters&id=${id}`);
            return;
        }
    
        if (price.length < 0 || price.length > 6) {
            res.redirect(`/editItem?error=The price of the product must be from 0 to 100,000$&id=${id}`);
            return;
        }
    
        item.title = title;
        item.descriptions = descriptions;
        item.price = price;
        item.currency = currency;
    
        if (req.file) {
            item.photo = "uploads/" + req.file.filename;
        }
    
        let json = JSON.stringify(itemList);
        fs.writeFileSync("./items.json", json);
        res.redirect('/myAds');
    });
    
    app.post('/deleteItem', verifyToken, (req: Request, res: Response) => {
        let {id} = req.query;
        const login = req.login;
    
        if (id == undefined) {
            res.redirect("/myAds");
            return;
        }
    
        let item = null;
        for (let i = 0; i < itemList.length; i++) {
            const item2 = itemList[i];
            if (item2.id == id) {
                item = item2;
                break;
            }
        }
    
        if (item == null) {
            res.redirect("/myAds");
            return
        } 
    
        if (item.authorLogin !== login) {
            res.redirect("/myAds");
            return;
        }
    
        itemList.splice(+id, 1);
        let json = JSON.stringify(itemList);
        fs.writeFileSync("./items.json", json);
        res.redirect('/myAds');
    });
    
    app.post('/submit-order', (req: Request, res: Response) => {
        res.redirect("/");
    });
    
    app.get('/addItem', verifyToken, (req: Request, res: Response) => {
        let {error} = req.query;
        let login = req.login;
    
        let user = getUser(login!);
    
        res.send(compiledFunctionAddItem({
            error,
            title: "Add item | DAMarket",
            user,
            currencies: Currency // Object.keys(Currency)
        }));
    });
    
    app.post('/addItem', verifyToken,  upload.single("file"), (req: Request, res: Response) => {
        const {descriptions, price, currency, title} = req.body;
        const login = req.login
    
        const id = uuidv4();
    
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
        itemList.push({title, descriptions, price, currency, photo, authorLogin: login!, id});
        let json = JSON.stringify(itemList);
        fs.writeFileSync("./items.json", json);
        res.redirect('/');
    });
    
    app.get('/item', verifyToken, (req: Request, res: Response) => {
        let {id} = req.query;
        let login = req.login;
    
        let user = getUser(login!);
    
        if (id == undefined) {
            res.redirect("/");
            return;
        }
    
        let item = null;
    
        for (let i = 0; i < itemList.length; i++) {
            const item2 = itemList[i];
            if (item2.id == id) {
                item = item2;
                break;
            }
        }
    
        res.send(compiledFunctionItem({
            title: "Item | DAMarket",
            item,
            user,
            currencies: Currency,
        }));
    });

    app.get('/notifications', verifyToken, (req: Request, res: Response) => {
        let login = req.login;    
        let user = getUser(login!);
    
        res.send(compiledFunctionNotifications({
            title: "Notifications | DAMarket",
            user,
        }));
    });

    app.get('/requestinfo', verifyToken, (req: Request, res: Response) => {
        let {id} = req.query;
        let login = req.login;
        let user = getUser(login!);

        if (id == undefined) {
            res.redirect("/");
            return;
        }

        let item = null;
        for (let i = 0; i < itemList.length; i++) {
            const item2 = itemList[i];
            if (item2.id == id) {
                item = item2;
                break;
            }
        }

        let authorLogin = item.authorLogin;
        let author = getUser(authorLogin);

        const notification: Notification = {text: 'Вітаю в DAMarket!', time: new Date(), see: true};
        author.notifications.push(notification);

        let json = JSON.stringify(usersList);
        fs.writeFileSync("./usersList.json", json);

        res.redirect("/myAds");
    });
    
    app.get('/register', getLoginToken, (req: Request, res: Response) => {
        let {error} = req.query;
        let login = req.login;
    
        let user = getUser(login!);
    
        res.send(compiledFunctionRegister({
            error,
            user,
            title: "Register | DAMarket",
        }));
    });
    
    app.get('/login', getLoginToken, (req: Request, res: Response) => {
        let {error} = req.query;
        let login = req.login;
    
        let user = getUser(login!);
    
        res.send(compiledFunctionLogin({
            error,
            user,
            title: "Login | DAMarket"
        }));
    });
    
    app.get('/logout', (req: Request, res: Response) => {
        res.clearCookie( "token", {path: "/", expires: new Date(10000000000000), sameSite: 'lax',  httpOnly: true, secure: true}); // додати при відправки на GitHub
        res.redirect('/login');
    });
    
    app.post('/register', (req: Request, res: Response) => {
        const { name, login, password } = req.body;
    
        if (name.length < 3 || name.length > 25) {
            res.redirect('/register?error=Name must be between 3 and 25 characters');
            return;
        }
    
        if (password.length < 8 || password.length > 25) {
            res.redirect('/register?error=Password must be between 8 and 25 characters');
            return;
        }
    
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,25}$/;
        if (!passwordRegex.test(password)) {
            res.redirect('/register?error=Password must contain at least one uppercase letter, one lowercase letter, and one digit')
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
    
        const token = createToken(login);
    
        usersList.push({ name, login, password, photo: null, notifications: [] });
        let json = JSON.stringify(usersList);
        fs.writeFileSync("./usersList.json", json);
    
        res.cookie( "token", token, {path: "/", expires: new Date(10000000000000), sameSite: 'lax',  httpOnly: true, secure: true}) // додати при відправки на GitHub
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
    
        const token = createToken(login);
    
        res.cookie( "token", token, {path: "/", expires: new Date(10000000000000), sameSite: 'lax', httpOnly: true, secure: true}) // додати при відправки на GitHub httpOnly: true, secure: true
        res.redirect('/');
    });
}