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

let usersList: User[] = require("../usersList.json");
let itemList: Item[] = require("../items.json");

function getUser(login: string): User | null {
    let user = null;

    for (let i = 0; i < usersList.length; i++) {
        const u = usersList[i];
        if (u.login == login) {
            user = u;
        }
    }

    return user;
}

module.exports = {Currency, usersList, itemList, getUser};