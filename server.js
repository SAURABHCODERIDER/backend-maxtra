const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const orderRoutes = require("./routes/orderRoutes");
const connectDB = require("./config/db");
const Message = require("./models/Message");
const productRoutes = require("./routes/productRoutes");
const contentRoutes = require("./routes/content");
const supportRoutes = require("./routes/supportRoutes");
const userRoutes = require("./routes/userRoutes");

// ==========================
// CONFIG
// ==========================

dotenv.config();

const app = express();
const server = http.createServer(app);

// ==========================
// DB
// ==========================

connectDB();

// ==========================
// MIDDLEWARE
// ==========================

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

// ==========================
// ROUTES
// ==========================

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/support", supportRoutes);

app.get("/", (req, res) => {
  res.send("API RUNNING");
});

// ==========================
// SOCKET IO
// ==========================

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ==========================
// ONLINE USERS
// userId -> socketId
// ==========================

const onlineUsers = new Map();

// ==========================
// EMIT TO USER (personal room)
// ==========================

const emitToUser = (userId, event, data = {}) => {
  io.to(userId).emit(event, data);
};

// ==========================
// SOCKET AUTH
// ==========================

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("No Token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;

    next();
  } catch (error) {
    console.log("❌ SOCKET AUTH ERROR:", error.message);
    next(new Error("Auth Error"));
  }
});

// ==========================
// SOCKET CONNECTION
// ==========================

io.on("connection", (socket) => {
  console.log("✅ SOCKET CONNECTED:", socket.id);

  // ==========================
  // CURRENT USER ID
  // Supports id, _id, userId in token
  // ==========================

  const currentUserId =
    socket.user?.id?.toString() ||
    socket.user?._id?.toString() ||
    socket.user?.userId?.toString();

  if (!currentUserId) {
    console.log("❌ USER ID NOT FOUND IN TOKEN");
    socket.disconnect(true);
    return;
  }

  console.log("👤 USER CONNECTED:", currentUserId);

  // ==========================
  // JOIN PERSONAL ROOM
  // Caller uses emitToUser(userId, ...) which sends to this room
  // ==========================

  socket.join(currentUserId);
  onlineUsers.set(currentUserId, socket.id);

  io.emit("online_users", Array.from(onlineUsers.keys()));
  socket.broadcast.emit("user_online", { userId: currentUserId });

  console.log(`🟢 ${currentUserId} ONLINE | TOTAL: ${onlineUsers.size}`);

  // ==========================
  // JOIN CHAT ROOM
  // ==========================

  socket.on("join_room", async (room) => {
    try {
      socket.join(room);
      console.log(`🏠 ${currentUserId} JOINED ROOM: ${room}`);

      const messages = await Message.find({ room })
        .sort({ createdAt: 1 })
        .lean();

      socket.emit("old_messages", messages);
    } catch (error) {
      console.log("❌ JOIN ROOM ERROR:", error.message);
      socket.emit("error", { message: "Failed to load messages" });
    }
  });

  // ==========================
  // LEAVE CHAT ROOM
  // ==========================

  socket.on("leave_room", (room) => {
    socket.leave(room);
    console.log(`🚪 ${currentUserId} LEFT ROOM: ${room}`);
  });

  // ==========================
  // SEND MESSAGE
  // ==========================

  socket.on("send_message", async (data) => {
    try {
      console.log(`📩 MESSAGE: ${data.senderId} → ${data.receiverId}`);

      const newMessage = await Message.create({
        room      : data.room,
        senderId  : data.senderId,
        receiverId: data.receiverId,
        text      : data.text,
      });

      const messageData = {
        _id       : newMessage._id,
        room      : newMessage.room,
        senderId  : newMessage.senderId,
        receiverId: newMessage.receiverId,
        text      : newMessage.text,
        createdAt : newMessage.createdAt,
        localId   : data.localId ?? null,
        status    : "delivered",
      };

      io.to(data.room).emit("receive_message", messageData);
    } catch (error) {
      console.log("❌ SEND MESSAGE ERROR:", error.message);
      socket.emit("message_error", {
        localId: data.localId,
        error  : "Failed to send message",
      });
    }
  });

  // ==========================
  // MESSAGE SEEN
  // ==========================

  socket.on("message_seen", async ({ messageId, room }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { status: "seen" });
      socket.to(room).emit("message_seen", { messageId });
    } catch (error) {
      console.log("❌ MESSAGE SEEN ERROR:", error.message);
    }
  });

  // ==========================
  // TYPING
  // ==========================

  socket.on("typing",      (room) => socket.to(room).emit("typing"));
  socket.on("stop_typing", (room) => socket.to(room).emit("stop_typing"));

  // ==========================
  // ✅ FIX: CALL-USER — WebRTC offer ke saath
  // Frontend ab 'call-user' emit karta hai (pehle 'start-video-call' tha bina offer ke)
  // Yahi main bug tha — offer undefined tha receiver ko
  // ==========================

  socket.on("call-user", (data) => {
    const { to, from, offer, type, callerName } = data;

    // ✅ offer included in payload
    if (!offer) {
      console.warn(`⚠️ call-user from ${from} has no offer — receiver ka WebRTC fail hoga`);
    }

    console.log(`📲 CALL USER: ${from} → ${to} [${type}]`);

    const event = type === "video" ? "incoming-video-call" : "incoming-audio-call";

    // ✅ offer forward karo receiver ko
    emitToUser(to, event, {
      from,
      offer,                        // ← yahi missing tha pehle
      type,
      callerName: callerName ?? "Unknown",
    });
  });

  // ==========================
  // LEGACY HANDLERS (backward compat — agar purana code use ho)
  // Inhe bhi fix kiya — offer forward ho sake
  // ==========================

  socket.on("start-video-call", (data) => {
    console.log(`📹 (legacy) VIDEO CALL: ${data.from} → ${data.to}`);
    // Offer nahi hoga yahan — isliye call-user use karna chahiye
    emitToUser(data.to, "incoming-video-call", {
      from      : data.from,
      callerName: data.callerName ?? "Unknown",
      type      : "video",
      offer     : data.offer ?? null,       // null hoga agar legacy call
    });
  });

  socket.on("start-audio-call", (data) => {
    console.log(`📞 (legacy) AUDIO CALL: ${data.from} → ${data.to}`);
    emitToUser(data.to, "incoming-audio-call", {
      from      : data.from,
      callerName: data.callerName ?? "Unknown",
      type      : "audio",
      offer     : data.offer ?? null,
    });
  });

  // ==========================
  // CALL ACCEPTED — answer forward karo caller ko
  // ==========================

  socket.on("call-accepted", ({ to, answer }) => {
    console.log(`✅ CALL ACCEPTED → ${to}`);
    emitToUser(to, "call-accepted", { answer });
  });

  // ==========================
  // CALL REJECTED
  // ==========================

  socket.on("reject-call", ({ to }) => {
    console.log(`❌ CALL REJECTED → ${to}`);
    emitToUser(to, "call-rejected");
  });

  // ==========================
  // END CALL
  // ==========================

  socket.on("end-call", ({ to }) => {
    console.log(`☎️ CALL ENDED → ${to}`);
    emitToUser(to, "call-ended");
  });

  // ==========================
  // ✅ ICE CANDIDATE — bidirectional
  // ==========================

  socket.on("ice-candidate", ({ to, candidate }) => {
    if (!candidate) return;
    emitToUser(to, "ice-candidate", { candidate });
  });

  // ==========================
  // DISCONNECT
  // ==========================

  socket.on("disconnect", (reason) => {
    console.log(`❌ SOCKET DISCONNECTED: ${socket.id} [${reason}]`);

    if (currentUserId) {
      onlineUsers.delete(currentUserId);
      io.emit("online_users", Array.from(onlineUsers.keys()));
      socket.broadcast.emit("user_offline", {
        userId  : currentUserId,
        lastSeen: new Date().toISOString(),
      });
      console.log(`🔴 ${currentUserId} OFFLINE | TOTAL: ${onlineUsers.size}`);
    }
  });
});

// ==========================
// START SERVER
// ==========================

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
});