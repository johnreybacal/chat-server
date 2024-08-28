import { Server } from "socket.io";
export const server = new Server({
  cors: {
    origin: "*",
  },
  connectionStateRecovery: {},
});

server.on("connection", (socket) => {
  console.log(`connection: ${socket.id} ${socket.handshake.auth.username}`);

  const roomEvent = () => ({
    socketId: socket.id,
    username: socket.handshake.auth.username,
    date: new Date(),
  });

  socket.on("joinRoom", (room: string) => {
    console.log(`joinRoom: ${socket.id} ${room}`);

    socket.join(room);
    server.to(room).emit("roomEvent", room, {
      type: "userJoined",
      ...roomEvent(),
    });
  });
  socket.on("sendMessage", (room: string, message: string) => {
    console.log(`sendMessage: ${socket.id} ${room}`);

    server.to(room).emit("roomEvent", room, {
      type: "message",
      message,
      ...roomEvent(),
    });
  });
  socket.on("disconnecting", (reason) => {
    console.log("disconnect", socket.id, reason);

    for (const room of Array.from(socket.rooms)) {
      if (room !== socket.id) {
        server.to(room).emit("roomEvent", room, {
          type: "userLeft",
          ...roomEvent(),
        });
      }
    }
  });
});
