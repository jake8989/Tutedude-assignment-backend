import mongoose, { Schema, Document } from 'mongoose';
import { transpileModule } from 'typescript';
interface userType {
  username: string;
  email: string;
  password: string;
  profile: string;
  step: string;
  ext: number;
}
const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    step: { type: String, trim: true, default: '/dashboard' },
    profile: { type: String, trim: true, default: '/favicon.ico' },
    ext: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);
const User = mongoose.model<userType>('User', userSchema);
export default User;
