const express = require("express")
const app = express()
const http = require("http")
const cors = require("cors")
const {Server} = require ("socket.io")
const sqlite3 = require("sqlite3").verbose()
const axios = require("axios")

app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors:{
        origin: "http://localhost:5173",
        methods: ["GET","POST"]
    }
})

const TURSO_URL = 'libsql://workable-moondragon-xdiegofx.turso.io'
const TURSO_API_KEY = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MjA0MzIxMDYsImlkIjoiMTZhMGFkZjEtMWE3ZS00NGM5LTg4OWYtODMyOTYxMWJjYWI5In0.livDVCb4VDAcRmd47AnsIGDBcEMpqQ-VSzbPRQffthlgDigwjTQKnykvwUhtArjOymUtcxjXG7JUgThi3zpfDg'

// Configurar la base de datos SQLite
const db = new sqlite3.Database(':memory:')

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, room TEXT, author TEXT, message TEXT, time TEXT)")
})

let users = {}

io.on("connection", (socket) => {
    console.log(`Usuario actual: ${socket.id}` )

    socket.on("join_room", (data) =>{
        socket.join(data.room)
        users[socket.id] = {username: data.username, room: data.room}
        io.to(data.room).emit("update_users", getUsersInRoom(data.room))

        // Enviar mensajes antiguos al usuario que se une
        db.all("SELECT * FROM messages WHERE room = ?", [data.room], (err, rows) => {
            if (err) {
                console.error(err)
                return
            }
            socket.emit("previous_messages", rows)
        })

        console.log(`Usuario actual: ${socket.id} esta disponible ${data.room}` );
    })

    socket.on("send_message", (data) =>{
        socket.to(data.room).emit("receive_message", data);
        db.run("INSERT INTO messages (room, author, message, time) VALUES (?, ?, ?, ?)", [data.room, data.author, data.message, data.time], function(err) {
            if (err) {
                console.error(err)
            }
        })
    })

    socket.on("disconnect", () => {
        const user = users[socket.id]
        if (user){
            const room = user.room
            delete users[socket.id]
            io.to(room).emit("update_users", getUsersInRoom(room))
        }
        console.log("USUARIO DESCONECTADO", socket.id)
    })
})

function getUsersInRoom(room){
    return Object.values(users).filter(user => user.room === room)
}

server.listen(3001, () =>{
    console.log("CONEXION EXITOSA")
})