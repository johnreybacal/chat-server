import { Server } from "socket.io";
export const server = new Server({
  cors: {
    origin: "*",
  },
  connectionStateRecovery: {},
});

async function getTime(): Promise<String> {
  try {
    const response = await fetch(
      `http://worldtimeapi.org/api/timezone/${
        Intl.DateTimeFormat().resolvedOptions().timeZone
      }`
    );
    const json = await response.json();
    return json.utc_datetime;
  } catch (e) {
    return new Date().toISOString();
  }
}

server.on("connection", (socket) => {
  console.log(`connection: ${socket.id} ${socket.handshake.auth.username}`);

  const clientInformation = {
    socketId: socket.id,
    username: socket.handshake.auth.username,
  };

  socket.on("joinRoom", async (room: string) => {
    console.log(`joinRoom: ${socket.id} ${room}`);

    socket.join(room);
    server.to(room).emit("roomEvent", room, {
      type: "userJoined",
      date: await getTime(),
      ...clientInformation,
    });
  });
  socket.on("sendMessage", async (room: string, message: string) => {
    console.log(`sendMessage: ${socket.id} ${room}`);

    server.to(room).emit("roomEvent", room, {
      type: "message",
      date: await getTime(),
      message,
      ...clientInformation,
    });
  });
  socket.on("disconnecting", async (reason) => {
    console.log("disconnect", socket.id, reason);
    const date = await getTime();
    for (const room of Array.from(socket.rooms)) {
      if (room !== socket.id) {
        server.to(room).emit("roomEvent", room, {
          type: "userLeft",
          date,
          ...clientInformation,
        });
      }
    }
  });
});
