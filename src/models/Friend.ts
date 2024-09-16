import mongoose, { Document, Mongoose, Schema, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
interface IFriend {
  id: string;
  user1: string;
  user2: string;
}

const friendSchema: Schema = new Schema({
  id: {
    type: String,
    default: uuidv4(),
    unique: true,
    trim: true,
  },
  user1: {
    type: String,
    required: true,
    trim: true,
  },
  user2: {
    type: String,
    required: true,
    trim: true,
  },
});

const Friend = mongoose.model<IFriend>('Friend', friendSchema);

export default Friend;
