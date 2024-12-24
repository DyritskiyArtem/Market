import {Express} from "express";
import {Item, User, Notification} from "./data";
import{Request, Response} from "express";
const {Currency, getUser, getItem, getUsers, getItems, addUser, cheksPassword, editUser, addItem, removeItem, editItem, addSubscriptionToUser, addNotificationToUser, clearNotifications, seeNotificationsForUser} = require('./data');
const {createToken, verifyToken, getLoginToken} = require('./token');
const upload = require('./upload');
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
    
    app.get('/', verifyToken, async (req: Request, res: Response) => {
        let { name, min, max } = req.query;
        let login = req.login;
    
        let user = await getUser(login!);
    
        let filteredItems = await getItems();
    
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
    
    app.get('/profile', verifyToken, async (req: Request, res: Response) => {
        let login = req.login;
    
        let user = await getUser(login!);
    
        res.send(compiledFunctionProfil({
            title: "Profile | DAMarket",
            user,
        }));
    });
    
    app.post('/editProfile', verifyToken, upload.single("file"), async (req: Request, res: Response) => {
        const { name, password } = req.body;
        const login = req.login;
    
        let user = await getUser(login!);
        if (user == null) {return}
            
            user.name = name;
            user.password = password;
    
            if (req.file !== undefined) {
                let photo = "uploads/" + req.file.filename;
                user.photo = photo;
            }

            await editUser(login, user)
            res.redirect('/profile');
    });
    
    app.get('/myAds', verifyToken, async (req: Request, res: Response) => {
        let login = req.login;
        let user = await getUser(login!);
    
        res.send(compiledFunctionMyAds({
            title: "My ads | DAMarket",
            itemList: await getItems(),
            user,
            currencies: Currency
        }));
    });
    
    app.get('/editItem', verifyToken, async (req: Request, res: Response) => {
        let {id, error} = req.query;
        let login = req.login;
    
        let user = await getUser(login!);
    
        if (id == undefined) {
            res.redirect("/myAds");
            return;
        }
    
        let item = await getItem(id);
    
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
    
    app.post('/editItem', verifyToken, upload.single("file"), async (req: Request, res: Response) => {
        const {id, title, descriptions, price, currency} = req.body;
        const login = req.login;
    
        console.log(id);
        
    
        let item = await getItem(id);
    
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

        await editItem(id, item)
        res.redirect('/myAds');
    });
    
    app.post('/deleteItem', verifyToken, async (req: Request, res: Response) => {
        let {id} = req.query;
        const login = req.login;
    
        if (id == undefined) {
            res.redirect("/myAds");
            return;
        }

        let item = await getItem(id);
    
        if (item == null) {
            res.redirect("/myAds");
            return
        } 
    
        if (item.authorLogin !== login) {
            res.redirect("/myAds");
            return;
        }

        await removeItem(id)
        res.redirect('/myAds');
    });
    
    app.post('/submit-order', (req: Request, res: Response) => {
        res.redirect("/");
    });
    
    app.get('/addItem', verifyToken, async (req: Request, res: Response) => {
        let {error} = req.query;
        let login = req.login;
    
        let user = await getUser(login!);
    
        res.send(compiledFunctionAddItem({
            error,
            title: "Add item | DAMarket",
            user,
            currencies: Currency // Object.keys(Currency)
        }));
    });
    
    app.post('/addItem', verifyToken,  upload.single("file"), async (req: Request, res: Response) => {
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
        await addItem({title, descriptions, price, currency, photo, authorLogin: login!, id})
        res.redirect('/');
    });
    
    app.get('/item', verifyToken, async (req: Request, res: Response) => {
        let {id} = req.query;
        let login = req.login;
    
        let user = await getUser(login!);
    
        if (id == undefined) {
            res.redirect("/");
            return;
        }
    
        let item = await getItem(id);
    
        res.send(compiledFunctionItem({
            title: "Item | DAMarket",
            item,
            user,
            currencies: Currency,
        }));
    });

    app.post('/orderitem', verifyToken, async (req: Request, res: Response) => {
        let { id } = req.query;
        let buyerLogin = req.login;
        
        // if (id == undefined) {
        //     res.redirect("/");
        //     return;
        // }
    
        let item = await getItem(id);
    
        let buyer = await getUser(buyerLogin!);
        let seller = await getUser(item.authorLogin);


    
        // if (buyerLogin === item.authorLogin) {
        //     res.redirect("/");
        //     return;
        // }
    
        const sellerNotification: Notification = {text: `User ${buyerLogin} wants to buy your item "${item.title}" for ${item.price} ${item.currency}. Contact them to complete the transaction.`, time: new Date(), see: false};
        const buyerNotification: Notification = {text: `You've ordered "${item.title}" for ${item.price} ${item.currency} from ${item.authorLogin}. Wait for the seller to contact you.`, time: new Date(), see: false};

        await addNotificationToUser(seller.login, sellerNotification)
        await addNotificationToUser(buyer.login, buyerNotification)
    
        res.redirect("/notifications");
    });

    app.get('/notifications', verifyToken, async (req: Request, res: Response) => {
        let login = req.login; 
        let user = await getUser(login!);

        res.send(compiledFunctionNotifications({
            title: "Notifications | DAMarket",
            user, 
        }));

        let update: boolean = false;
        for (let i = 0; i < user.notifications.length; i++) {
            const notification = user.notifications[i];

            if (notification.see === false) {
                update = true;
            }

            notification.see = true;
        }

        if (update === true) {await seeNotificationsForUser(login)}
    });

    app.post('/subscribe', verifyToken, async (req: Request, res: Response) => {
        let login = req.login;
        const subscription = req.body;

        await addSubscriptionToUser(login, subscription)
        res.json({messege: "ok"});
    });

    app.get('/requestinfo', verifyToken, async (req: Request, res: Response) => {
        let {id} = req.query;
        let login = req.login;
        let user = await getUser(login!);

        if (id == undefined) {
            res.redirect("/");
            return;
        }

        let item = await getItem(id);

        let authorLogin = item.authorLogin;
        let author = await getUser(authorLogin);

        const notification: Notification = {text: `User <span>${login}</span> requested your data. Click <a href='/sendinfo?sendLogin=${login}'> here</a> to send them`, time: new Date(), see: false};
        author.notifications.push(notification);

        await addNotificationToUser(authorLogin, notification);

        res.redirect("/");
    });

    app.get('/sendinfo', verifyToken, async (req: Request, res: Response) => { 
        let login = req.login;
        let user = await getUser(login!);
        let {sendLogin} = req.query;
        let sendUser = await getUser(sendLogin!);

        const notification: Notification = {text: `You have received the data you requested: ${login}, ${user.name}`, time: new Date(), see: false};
        sendUser.notifications.push(notification);

        await addNotificationToUser(sendUser.login, notification);
        res.redirect("/");
    });

    app.get('/clearn', verifyToken, async (req: Request, res: Response) => { 
        let login = req.login;
        let user = await getUser(login!);
        
        if (user) {
            user.notifications = [];
            await clearNotifications(login)
        }
    
        res.redirect("/notifications");
    });
    
    app.get('/register', getLoginToken, async (req: Request, res: Response) => {
        let {error} = req.query;
        let login = req.login;
    
        let user = await getUser(login!);
    
        res.send(compiledFunctionRegister({
            error,
            user,
            title: "Register | DAMarket",
        }));
    });
    
    app.get('/login', getLoginToken, async (req: Request, res: Response) => {
        let {error} = req.query;
        let login = req.login;
    
        let user = await getUser(login!);
    
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
    
    app.post('/register', async (req: Request, res: Response) => {
        const { name, login, password } = req.body;
        let user = await getUser(login!);
        let {sendLogin} = req.query;
        let sendUser = await getUser(sendLogin!);
    
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

        let user2 = await getUser(login);

        if (user2 !== null) {
            res.redirect('/register?error=This login already exists');
            return;
        }
    
        if (login.length < 3 || login.length > 25) {
            res.redirect('/register?error=Login must be between 3 and 25 characters')
            return;
        }
    
        const token = createToken(login);

        const welcomeNotification: Notification = {text: "Welcome to DAMarket! Sell your products and reach buyers easily. Start now!", time: new Date(), see: false};

        await addUser({ name, login, password, photo: null, notifications: [welcomeNotification] });

        res.cookie( "token", token, {path: "/", expires: new Date(10000000000000), sameSite: 'lax',  httpOnly: true, secure: true}) // додати при відправки на GitHub
        res.redirect('/');
    });
    
    app.post('/login', async (req: Request, res: Response) => {
        const {login, password} = req.body;

        let user = await getUser(login);

        if (!(await cheksPassword(user, password))) {
            res.redirect('/login?error=Your login or password is incorrect');
            return;
        }
    
        const token = createToken(login);
    
        res.cookie( "token", token, {path: "/", expires: new Date(10000000000000), sameSite: 'lax', httpOnly: true, secure: true}) // додати при відправки на GitHub httpOnly: true, secure: true
        res.redirect('/');
    });
}