import { Server } from "socket.io";
export const server = new Server({
  cors: {
    origin: ["http://localhost:3000", "https://johnreybacal.github.io/"],
  },
  connectionStateRecovery: {},
});

server.on("connection", (socket) => {
  console.log(`connection: ${socket.id} ${socket.handshake.auth.username}`);

  socket.on("joinRoom", (room: string) => {
    console.log(`joinRoom: ${socket.id} ${room}`);

    socket.join(room);
  });
  socket.on("sendMessage", (room: string, message: string) => {
    console.log(`sendMessage: ${socket.id} ${room}`);

    server.to(room).emit("distributeMessage", room, {
      message,
      socketId: socket.id,
      username: socket.handshake.auth.username,
      date: new Date(),
    });
  });
});
