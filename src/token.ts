import{Request, Response} from "express";
const jwt = require('jsonwebtoken');
const {getUser} = require('./data');

const JWT_SECRET = process.env.TOKEN_SECRET;
const JWT_EXPIRY = '30d';

function createToken(login: string): string {
    const token = jwt.sign({login}, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    return token;
}

// Middleware to verify token
const verifyToken = async (req: Request, res: Response, next: Function) => {
    const {token} = req.cookies;
    if (!token) return res.status(403).redirect('/login');

    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
        if (err) return res.status(403).redirect('/login');
        
        let user = await getUser(decoded.login);
        if (user == null) {return res.status(403).redirect('/login')}

        req.login = decoded.login;
        next();
    });
};

const getLoginToken = async (req: Request, res: Response, next: Function) => {
    const {token} = req.cookies;
    if (!token){
        req.login = null;
        next();
        return;
    }

    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
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