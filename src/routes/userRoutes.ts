import express from 'express';
import User from '../models/User';
// import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { Types } from 'mongoose';
// import { parseJsonText } from 'typescript';
// import protect from '../middlewares/auth';

// const app = express();
const router = express.Router();
// interface RequestWithUser extends express.Request {
// 	_id: string;
// }
router.post(
  '/register',
  async (req: express.Request, res: express.Response) => {
    try {
      // console.log(req);
      const values = req.body;
      // console.log(values);
      //   console.log(values);
      const hashedPassword = await argon2.hash(values.password);
      const user = {
        username: values.username,
        email: values.email,
        password: hashedPassword,
        ext: values.ext,
      };
      const user1 = await User.findOne({ username: values.username });
      // console.log(user1);
      if (user1) {
        return res
          .status(400)
          .json({ message: 'This username is not available ' });
      }
      const newUser = new User(user);
      // console.log(newUser);
      newUser
        .save()
        .then(() => {
          console.log(newUser._id);
          res.status(200).json({
            // newUser,
            _id: newUser._id,
            user: newUser.username,
            message: 'User Created Succesfully',
            token: generateToken(newUser._id),
            step: '/dashboard',
          });
        })
        .catch((err: any) => {
          console.log(err);
          res.status(400).json({ message: 'Error try after some time' });
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, message: 'Internal server error' });
    }
  },
);
router.post('/login', async (req: express.Request, res: express.Response) => {
  try {
    const values = req.body;
    const user1 = await User.findOne({ username: values.username });
    // console.log(user1);
    if (user1 && (await argon2.verify(user1.password, values.password))) {
      // console.log(user1._id);
      return res.status(200).json({
        _id: user1._id,
        user: user1.username,
        message: 'Logged In Succesfully',
        token: generateToken(user1._id),
        step: user1.step,
        profile: user1.profile,
      });
    }
    return res.status(400).json({ message: 'No user found' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error, message: 'Internal server error' });
  }
});
// ('/api/v1/users/get-userbyusername?search=admin');
router.get(
  '/get-userbyusername',
  async (req: express.Request, res: express.Response) => {
    const keyword = req.query.search;
    let username = keyword;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res
        .status(400)
        .json({ message: `cannot found this username ${keyword}` });
    }
    if (user) {
      res.status(200).json({
        _id: user._id,
        username: username,
        email: user.email,
      });
    }
  },
);
router.put(
  '/set-avtar',
  async (req: express.Request, res: express.Response) => {
    try {
      const values = req.body;
      const user1 = await User.findOne({ username: values.username });
      // if (values.profile.trim() === null) {
      // 	return res
      // 		.status(400)
      // 		.json({ message: 'You can select Default Profile Picture' });
      // }
      // console.log('Form avatar', user1);
      if (user1) {
        if (user1.profile !== '/favicon.ico') {
          return res
            .status(401)
            .json({ message: 'Already Found avatar for this username!' });
        }
        const updateUser = await User.findOneAndUpdate(
          { username: values.username },
          { profile: values.profile },
          { new: true },
        );
        const updateUser2 = await User.findOneAndUpdate(
          { username: values.username },
          { step: '/friends' },
          { new: true },
        );
        return res.status(200).json({
          message: 'Avtar Updated Succesfully',
          step: updateUser2?.step,
          user: updateUser2?.username,
          profile: updateUser2?.profile,
        });
      }
      return res.status(400).json({ message: 'No user found' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, message: 'Internal server error' });
    }
  },
);
router.get('/test', async (req: express.Request, res: express.Response) => {
  res.status(200).json({ message: 'Working' });
});

const generateToken = (_id: Types.ObjectId) => {
  const secretString = process.env.JWT_SECRET;
  if (!secretString) {
    return null;
  }
  return jwt.sign({ _id }, secretString, {
    expiresIn: '7d',
  });
};

export default router;
