import express from 'express';
import Inviation, { STATUS } from '../models/Invitation';
// import { Promise, STATES } from 'mongoose';
import User from '../models/User';
import Friend from '../models/Friend';
const router = express.Router();
import { v4 as uuidv4 } from 'uuid';
interface RequestWithUser extends express.Request {
  _id: string;
}
//for testing purpose
router.get(
  '/test-invitation',
  (req: RequestWithUser, res: express.Response) => {
    const _id = req._id;
    // console.log(_id);
    res.send('/hii');
  },
);
//creating a new invitation
router.post(
  '/create-invitation',
  async (req: RequestWithUser, res: express.Response) => {
    const sender_id = req._id;
    const receiver_id = req.body.receiver_id;
    // console.log(sender_id, receiver_id);
    if (sender_id === receiver_id) {
      return res.status(400).json({ message: 'Cannot Perform This Action' });
    }

    const existFriends = await Friend.findOne({
      user1: sender_id,
      user2: receiver_id,
    });
    const ef1 = await Friend.findOne({
      user1: receiver_id,
      user2: sender_id,
    });
    if (existFriends || ef1) {
      return res.status(500).json({ message: 'Users are already friends!' });
    }
    const existInvitation = await Inviation.findOne({
      sender: sender_id,
      receiver: receiver_id,
    });
    const existInvitation2 = await Inviation.findOne({
      sender: receiver_id,
      receiver: sender_id,
    });
    if (existInvitation) {
      if (existInvitation.status == STATUS.PENDING) {
        return res.status(400).json({
          message:
            'Please Check your inbox either they sent you a request/invitation already exists or you are already friended!',
        });
      }
    }
    if (existInvitation2) {
      if (existInvitation2.status == STATUS.PENDING) {
        return res.status(400).json({
          message:
            'Please Check your inbox either they sent you a request/invitation already exists or you are already friended!',
        });
      }
    }
    const invitaion = {
      _id: uuidv4(),
      sender: sender_id,
      receiver: receiver_id,
      status: STATUS.PENDING,
    };
    const receiverUser = await User.findById(receiver_id);
    const newInvitation = new Inviation(invitaion);
    newInvitation
      .save()
      .then(() => {
        // console.log(newInvitation);
        return res.status(200).json({
          message: `Invitation Sent to User:  ${receiverUser.username}`,
        });
      })
      .catch((err) => {
        return res.status(400).json({ message: 'Internal Server Error' });
      });
  },
);
//finding all sent requests
router.get(
  '/all-sent-requests',
  async (req: RequestWithUser, res: express.Response) => {
    const sender_id = req._id;
    const sender = await User.findById(sender_id);
    const pendingInvitations = await Inviation.find({
      sender: sender_id,
      status: STATUS.PENDING,
    });
    const promises = pendingInvitations.map(async (invitation) => {
      const receiver = await User.findById(invitation.receiver);
      // return ()
      return {
        invitation_id: invitation._id,
        sender_id: invitation.sender,
        sender_username: sender.username,
        sender_profile: sender.profile,
        receiver_id: invitation.receiver,
        receiver_username: receiver.username,
        receiver_profile: receiver.profile,
      };
    });
    if (!promises) {
      return res.status(400).json({ message: 'No Sent Invitations' });
    }
    const result = await Promise.all(promises);
    return res.status(200).json(result);
  },
);
//finding all received requests
router.get(
  '/all-received-requests',
  async (req: RequestWithUser, res: express.Response) => {
    const receiver_id = req._id;
    const receiver = await User.findById(receiver_id);
    const pendingInvitations = await Inviation.find({
      receiver: receiver_id,
      status: STATUS.PENDING,
    });
    // console.log(pendingInvitations);
    // return res.json({ pendingInvitations });
    const promises = pendingInvitations.map(async (invitation) => {
      const sender = await User.findById(invitation.sender);
      // return ()
      return {
        invitation_id: invitation._id,
        sender_id: invitation.sender,
        sender_username: sender.username,
        sender_profile: sender.profile,
        receiver_id: invitation.receiver,
        receiver_username: receiver.username,
        receiver_profile: receiver.profile,
      };
    });
    if (!promises) {
      return res.status(400).json({ message: 'No Received Invitations' });
    }
    const result = await Promise.all(promises);
    return res.status(200).json(result);
  },
);
//accept invite
router.post(
  '/accept-invite',
  async (req: RequestWithUser, res: express.Response) => {
    const receiver_id = req._id;
    const invitation_id = req.body.invitation_id;
    const invitaion = await Inviation.findById(invitation_id);
    if (
      invitaion.status === STATUS.ACCEPTED ||
      invitaion.status === STATUS.REJECTED
    ) {
      return res.status(500).json({ message: 'Invitation Expired' });
    }
    const friend = {
      id: invitation_id,
      user1: invitaion.receiver,
      user2: invitaion.sender,
    };
    console.log(friend);
    const newFriend = new Friend(friend);
    try {
      newFriend
        .save()
        .then(async () => {
          if (newFriend) {
            await Inviation.updateOne(
              { _id: invitation_id },
              { status: STATUS.ACCEPTED },
            );
            return res.status(200).json({
              message: 'Added Succesfully to your friend list',
              newFriend,
              // updateInvitation,
            });
          } else {
            return res
              .status(400)
              .json({ message: 'Cannot preform this action' });
          }
        })
        .catch((err) => {
          return res.status(500).json({ message: 'Server Error', err });
        });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error });
    }
  },
);
//deletion of a invitation
router.post(
  '/delete-invitation',
  async (req: RequestWithUser, res: express.Response) => {
    const invitation_id = req.body.invitation_id;
    const invitation = await Inviation.findById(invitation_id);
    if (!invitation) {
      return res.status(400).json({ message: 'No invitation Found' });
    }
    Inviation.findOneAndDelete({ _id: invitation_id })
      .then(() => {
        return res
          .status(200)
          .json({ message: 'Invitation deleted Successfully' });
      })
      .catch(() => {
        return res.status(500).json({ message: 'Server Error'! });
      });
  },
);
//searching a user
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
        profile: user.profile,
      });
    }
  },
);
//finding all friends of a user
router.get(
  '/users-friends',
  async (req: RequestWithUser, res: express.Response) => {
    const user_id = req._id;
    const usid1 = await Friend.find({ user1: user_id });
    const usid2 = await Friend.find({ user2: user_id });
    const promise1 = usid1.map(async (usid) => {
      const user = await User.findById(usid.user2);
      return {
        _id: usid.id,
        friendId: user._id,
        friendUsername: user.username,
        friendEmail: user.email,
        friendProfile: user.profile,
      };
    });
    const promise2 = usid2.map(async (usid) => {
      const user = await User.findById(usid.user1);
      return {
        _id: usid.id,
        friendId: user._id,
        friendUsername: user.username,
        friendEmail: user.email,
        friendProfile: user.profile,
      };
    });

    const arr = await Promise.all(promise1);
    const brr = await Promise.all(promise2);

    const result = [...arr, ...brr];
    return res.status(200).json({ message: 'List', result });
  },
);
router.get(
  '/get-recommendations',
  async (req: RequestWithUser, res: express.Response) => {
    const user_id = req._id;
    const usersFriends = await Friend.find({
      $or: [{ user1: user_id }, { user2: user_id }],
    });
    console.log(usersFriends);
  },
);
router.post(
  '/unfriend-user',
  async (req: express.Request, res: express.Response) => {
    //I am assuming friendship is mutual if userA unfrinds userB then userB also unfriends userA

    try {
      const { friendShipId } = req.body; // extract friend_id from the request body

      if (!friendShipId) {
        return res.status(400).json({ error: 'friend_id is required' });
      }

      // Find and delete the friend document by the `id` field
      const deletedFriend = await Friend.findOneAndDelete({ id: friendShipId });

      if (!deletedFriend) {
        return res.status(404).json({ message: 'Friend not found' });
      }

      res
        .status(200)
        .json({ message: 'Friend deleted successfully', deletedFriend });
    } catch (error) {
      res
        .status(500)
        .json({ error: 'An error occurred while deleting the friend' });
    }
  },
);
router.get(
  '/get-friends-recommendations',
  async (req: RequestWithUser, res: express.Response) => {
    try {
      const userId = req._id;

      const userFriendships = await Friend.find({
        $or: [{ user1: userId }, { user2: userId }],
      });

      const userFriendIds = userFriendships.map((friendship) =>
        friendship.user1.toString() === userId
          ? friendship.user2
          : friendship.user1,
      );

      const friendsOfFriends = await Friend.find({
        $or: [
          {
            user1: { $in: userFriendIds },
            user2: { $nin: [...userFriendIds, userId] },
          },
          {
            user2: { $in: userFriendIds },
            user1: { $nin: [...userFriendIds, userId] },
          },
        ],
      });

      const potentialFriendCounts = new Map();
      friendsOfFriends.forEach((friendship) => {
        const potentialFriendId =
          friendship.user1.toString() === userId
            ? friendship.user2
            : friendship.user1;
        potentialFriendCounts.set(
          potentialFriendId,
          (potentialFriendCounts.get(potentialFriendId) || 0) + 1,
        );
      });

      const sortedPotentialFriends = Array.from(potentialFriendCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      const recommendationIds = sortedPotentialFriends.map(([id]) => id);
      const recommendations = await User.find(
        { _id: { $in: recommendationIds } },
        { password: 0, email: 0 },
      );

      res.json({
        success: true,
        recommendations: recommendations.map((user) => ({
          ...user.toObject(),
          mutualFriends: potentialFriendCounts.get(user._id.toString()),
        })),
      });
    } catch (error) {
      console.error('Error in get-friends-recommendations:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  },
);
export default router;
