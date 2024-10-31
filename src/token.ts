import{Request, Response} from "express";
const jwt = require('jsonwebtoken');
const {getUser} = require('./data');

const JWT_SECRET = 'jufhyrY7e832u7uGJuer8326';
const JWT_EXPIRY = '30d';

function createToken(login: string): string {
    const token = jwt.sign({login}, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    return token;
}

// Middleware to verify token
const verifyToken = (req: Request, res: Response, next: Function) => {
    const {token} = req.cookies;
    if (!token) return res.status(403).redirect('/login');

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) return res.status(403).redirect('/login');
        
        let user = getUser(decoded.login);
        if (user == null) {return res.status(403).redirect('/login')}

        req.login = decoded.login;
        next();
    });
};

const getLoginToken = (req: Request, res: Response, next: Function) => {
    const {token} = req.cookies;
    if (!token){
        req.login = null;
        next();
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
        req.login = null;
        next();
    }else{
        req.login = decoded.login;
        next();
    }
    });
};

module.exports = {createToken, verifyToken, getLoginToken};