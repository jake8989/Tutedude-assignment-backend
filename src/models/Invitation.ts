import mongoose from 'mongoose';

export enum STATUS {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}
interface IInviation {
  _id: string;
  sender: string;
  receiver: string;
  status: string;
  ext: Number;
}
const invitationSchema = new mongoose.Schema(
  {
    _id: { type: String, trim: true },
    sender: { type: String, required: true, trim: true },
    receiver: { type: String, required: true, trim: true },
    status: { type: String, trim: true, default: STATUS.PENDING },
    ext: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);
const Inviation = mongoose.model<IInviation>('Inviation', invitationSchema);
export default Inviation;
