const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const path = require("path")
const socketIo = require("socket.io")
const http = require("http")


const app = express()

const port = process.env.PORT || 5000

//this will act as middleware for logging the comming request
app.use((req, res, next) => {
    console.log(`Request_Endpoint: ${req.method} ${req.url}`);
    next();
});

// Configure the bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Configure the CORs middleware
app.use(cors());

const api = require('./routes/routes')
//Configure app to use routes
app.use('/api/v1/', api)

// This middleware informs the express application to serve our compiled React files
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    app.use(express.static(path.join(__dirname, 'client/build')));

    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
};

app.get('*', (req, res) => {
    res.status(200).json({
        msg: 'Catch All'
    });
});

//This to create an http server so that it can be used by other socket io
const server = http.createServer(app)

//use the server
var options = {
    cors: '*:*' 
};

const io = socketIo(server, options)

io.on("connection", (socket)=>{
    console.log("A new connection boiii!!!")

    socket.on("disconnect", ()=>{
        console.log("User has left!!!!")
    })

    socket.on("joinRoom", (content)=>{
        console.log(content)
        socket.join(content.data)
        socket.to(content.data).emit("joined", {"roomId": content.data})
    })

    socket.on("userReady", (content)=>{
        socket.to(content.roomId).emit("ready", {"roomId": content.roomId})
    })

    socket.on("sendOffer", (data)=>{
        socket.to(data.roomId).emit("setOffer", data)
    })

    socket.on("sendAns", (data)=>{
        socket.to(data.roomId).emit("setAns", data)
    })

    socket.on("sentClientIce", (data)=>{
        socket.to(data.roomId).emit("setClientIce", data)
    })

    socket.on("sentUserIce", (data)=>{
        socket.to(data.roomId).emit("setUserIce", data)
    })
})


// Configure our server to listen on the port defiend by our port variable
server.listen(port, () => console.log(`BACK_END_SERVICE_PORT: ${port}`));