import express from "express";
import http from "http";
import { Server } from "socket.io";
import User from "../models/user.model";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

export const getReceiverSocketId = (receiverId: string) => {
  return userSocketMap[receiverId];
};

const userSocketMap: Record<string, string> = {}; // {userId: socketId ,...}

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId === "undefined" || !userId) {
    return;
  }
  console.log("user connected", userId);

  userSocketMap[userId as string] = socket.id;

  const isexist = userId && (await User.findById(userId));

  if (isexist) {
    await User.findOneAndUpdate(isexist._id, {
      onlineStatus: { isOnline: true, time: new Date() },
    });
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // socket.on() is used to listen to the events. can be used both on client and server side
  socket.on("disconnect", async () => {
    console.log("user disconnected", socket.id);

    const isexist = await User.findById(userId);
    if (isexist) {
      await User.findOneAndUpdate(isexist._id, {
        onlineStatus: { isOnline: false, time: new Date() },
      });
    }
    delete userSocketMap[userId as string];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
