const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(__dirname));

const channels = [
    { name: "عام", password: "" },
    { name: "الفضاء", password: "space" },
    { name: "الأصدقاء", password: "1234" }
];

io.on("connection", socket => {
    socket.emit("channelsList", channels.map(c => ({
        name: c.name,
        protected: c.password !== ""
    })));

    socket.on("joinRoom", ({ room, username, password }) => {
        const channel = channels.find(c => c.name === room);
        if (!channel) return socket.emit("joinError", "القناة غير موجودة");
        if (channel.password && channel.password !== password)
            return socket.emit("joinError", "باسورد خاطئ");

        socket.join(room);
        io.to(room).emit("message", `${username} انضم إلى القناة`);
        socket.emit("joinSuccess", room);
    });

    socket.on("chatMessage", ({ room, username, text }) => {
        io.to(room).emit("message", `${username}: ${text}`);
    });
});

server.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
