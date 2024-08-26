import { Server } from "socket.io";
export const server = new Server({ cors: { origin: "http://localhost:3000" } });

server.on("connection", (socket) => {
  socket.on("joinRoom", (room: string) => {
    socket.join(room);
  });
  socket.on("sendMessage", (room: string, message: string) => {
    server.to(room).emit("distributeMessage", room, {
      message,
      user: socket.id,
      date: new Date(),
    });
  });
});
