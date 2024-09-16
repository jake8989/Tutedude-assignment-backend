import express from 'express';
import cors from 'cors';
import evn from 'dotenv';
import connectDb from './config/db';
import userRoute from './routes/userRoutes';

import http from 'http';
import bodyParser from 'body-parser';
import protect from './middleware/auth';
import invitationRoutes from './routes/invitationRoutes';
evn.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(userRoute);
// app.use(protect);
app.get('/', (req, res) => {
  res.send('Hii😎');
});
app.use('/auth/v1/invitations', protect, invitationRoutes);
app.use('/api/v1/users', userRoute);
app.post('/test', (req: express.Request, res: express.Response) => {
  console.log(req.body);
  res.status(200).json({ message: 'Success' });
});

connectDb().then(() => {
  app.listen(8000, () => {
    console.log('server is running');
  });
});
