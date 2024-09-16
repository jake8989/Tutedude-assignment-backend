import mongoose from 'mongoose';
import env from 'dotenv';
env.config();
const connectDb = async () => {
  try {
    const connectUrl = process.env.DB_URL;
    // console.log(connectUrl);
    if (!connectUrl) {
      throw new Error('Mongo uri not found in env');
    }
    await mongoose.connect(connectUrl);
    console.log('Mongo Connected!');
  } catch (error) {
    console.log('Error connecting DB!');
  }
};
export default connectDb;
