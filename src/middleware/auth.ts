import jwt from 'jsonwebtoken';
import express from 'express';
import env from 'dotenv';
// import User from '../models/user';
import { JwtPayload } from 'jsonwebtoken';
env.config();
interface RequestWithUser extends express.Request {
  _id: string;
}

async function protect(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction,
) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      let decode;
      if (process.env.JWT_SECRET != undefined) {
        decode = jwt.verify(token, process.env.JWT_SECRET);
      }

      if (!decode) {
        return res.status(401).json({ message: 'Not verified token' });
      }

      req._id = (decode as JwtPayload)._id;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Error Authorizing' });
    }
  } else {
    return res
      .status(401)
      .json({ message: 'Please Login/SignUp to continue!' });
  }
}
export default protect;
