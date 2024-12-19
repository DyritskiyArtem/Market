const bcrypt = require('bcrypt');
const saltRounds = 10;

export interface Item {
    photo: string,
    title: string,
    descriptions: string,
    price: number,
    currency: Currency,
    authorLogin: string,
    id: string
}

export interface User {
    name: string,
    login: string,
    password: string,
    photo: string | null,
    notifications: Notification[],
}

export interface Notification {
    text: string,
    time: Date,
    see: boolean
}

enum Currency {
    Dollar = "$",
    Hryvnia = "₴",
    Euro = "€",
    Pound = "£"
} 

const {createClient} = require("redis");
const REDIS_EXTERNAL_URL = process.env.REDIS_EXTERNAL_URL;

let client: any = null;
async function connectClient() {
    client = await createClient({url: REDIS_EXTERNAL_URL})
      .on('error', (err: any) => console.log('Redis Client Error', err))
      .connect();

      let users = await client.get("users");
      if (users == null) {
        await client.set("users", "[]");
      }

      let items = await client.get("items");
      if (items == null) {
        await client.set("items", "[]");
      }

    // await client.set("users", "[]");
    // await client.set("items", "[]");
    
    // await client.set('key', 'value');
    // const value = await client.get('key');
    // await client.disconnect();
}
connectClient()

async function getUsers() {
    const users = JSON.parse(await client.get('users'));
    return users;
}

async function getItems() {
    const items = JSON.parse(await client.get('items'));
    return items;
}


async function addUser(user: User) {
    const users = JSON.parse(await client.get('users'));
    const hash = await bcrypt.hash(user.password, saltRounds);
    user.password = hash;

    users.push(user);
    await client.set('users', JSON.stringify(users));
}

async function editUser(login: string, newUser: User) {
    const users = JSON.parse(await client.get('users'));
    const hash = await bcrypt.hash(newUser.password, saltRounds);
    newUser.password = hash;

    const updatedUsers = users.map((user: User) => {
        if (user.login === login) {
            return newUser;
        }
        return user;
    });
    await client.set('users', JSON.stringify(updatedUsers));
}

async function cheksPassword(user: User, password: User) {
    if (user == null) return false;
    return await bcrypt.compare(password, user.password);
}


async function addItem(item: Item) {
    const items = JSON.parse(await client.get('items'));
    items.push(item);
    await client.set('items', JSON.stringify(items));
}

async function removeItem(id: string) {
    const items = JSON.parse(await client.get('items'));
    const filteredItems = items.filter((item: Item) => item.id !== id);
    await client.set('items', JSON.stringify(filteredItems));
}

async function editItem(id: string, newItem: Item) {
    const items = JSON.parse(await client.get('items'));
    const updatedItems = items.map((item: Item) => {
        if (item.id === id) {
            return newItem;
        }
        return item;
    });
    await client.set('items', JSON.stringify(updatedItems));
}


async function addNotificationToUser(login: string, notification: Notification) {
    const users = JSON.parse(await client.get('users'));
    const updatedUsers = users.map((user: User) => {
        if (user.login === login) {
            user.notifications.push(notification);
        }
        return user;
    });
    await client.set('users', JSON.stringify(updatedUsers));
}

async function clearNotifications(login: string) {
    const users = JSON.parse(await client.get('users'));
    const updatedUsers = users.map((user: User) => {
        if (user.login === login) {
            user.notifications = [];
        }
        return user;
    });
    await client.set('users', JSON.stringify(updatedUsers));
}

async function seeNotificationsForUser(login: string) { 
    const users = JSON.parse(await client.get('users')); 
    const updatedUsers = users.map((user: User) => { 
        if (user.login === login) { 
            for (let i = 0; i < user.notifications.length; i++) {
        user.notifications[i].see = true;
      }
        } 
        return user; 
    }); 
    await client.set('users', JSON.stringify(updatedUsers)); 
}


async function getUser(login: string) {
    const users = JSON.parse(await client.get('users'));
    let user = null;

    for (let i = 0; i < users.length; i++) {
        const u = users[i];
        if (u.login == login) {
            user = u;
        }
    }

    return user;
}

async function getItem(id: string) {
    const items = JSON.parse(await client.get('items'));
    let item = null;

    for (let i = 0; i < items.length; i++) {
        const u = items[i];
        if (u.id == id) {
            item = u;
        }
    }

    return item;
}

module.exports = {Currency, getUser, getItem, getItems, getUsers, addUser, editUser, cheksPassword, addItem, removeItem, editItem, addNotificationToUser, clearNotifications, seeNotificationsForUser};