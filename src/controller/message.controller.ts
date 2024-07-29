import { JwtPayload } from "jsonwebtoken";
import catchAsyncError from "../middlewares/catchAsyncErrors";
import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import { getReceiverSocketId, io } from "../socket";
import sendResponse from "../utils/sendResponse";

export const sendMessageController = catchAsyncError(async (req, res) => {
  const { message } = req.body;
  const { id: receiver } = req.params;
  const user = req.user as JwtPayload;
  const sender = user._id;

  let conversation = await Conversation.findOne({
    participants: { $all: [sender, receiver] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [sender, receiver],
    });
  }

  const newMessage = new Message({
    sender,
    receiver,
    message,
    conversation: conversation._id,
  });

  // this will run in parallel
  await Promise.all([conversation.save(), newMessage.save()]);

  // SOCKET IO FUNCTIONALITY WILL GO HERE
  const receiverSocketId = getReceiverSocketId(receiver);
  if (receiverSocketId) {
    // io.to(<socket_id>).emit() used to send events to specific client
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  sendResponse(res, { data: newMessage, statusCode: 200, success: true });
});

export const getMessages = catchAsyncError(async (req, res) => {
  const { id: userToChatId } = req.params;
  const user = req.user as JwtPayload;
  const senderId = user._id;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, userToChatId] },
  });

  console.log(conversation);

  if (!conversation) return res.status(200).json([]);

  const messages = await Message.find({ conversation: conversation._id })
    .sort({
      createdAt: 1,
    })
    .populate("sender")
    .populate("receiver");

  sendResponse(res, { data: messages, statusCode: 200, success: true });
});

export const deleteMessage = catchAsyncError(async (req, res) => {
  const user = req.user as JwtPayload;
  const messageId = req.params.messageId as string;
  const isExistMessage = await Message.findById(messageId);
  if (!isExistMessage) {
    return sendResponse(res, {
      data: null,
      message: "Message not found",
      success: false,
    });
  }
  if (isExistMessage.isDeleted) {
    return sendResponse(res, {
      data: null,
      message: "Message already deleted",
      success: false,
      statusCode: 204,
    });
  }

  if (isExistMessage.sender.toString() !== user._id.toString()) {
    return sendResponse(res, {
      data: null,
      message: "Forbidden access",
      success: false,
      statusCode: 403,
    });
  }

  await Message.findByIdAndUpdate(isExistMessage._id, { isDeleted: true });
  sendResponse(res, {
    data: null,
    message: "message deleted successfylly",
    success: true,
  });
});
