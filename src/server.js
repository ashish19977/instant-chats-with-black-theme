const http = require('http')
const socket = require('socket.io')
const express = require('express')
const path = require('path')
const bodyParser=require('body-parser')
const jwt = require('jsonwebtoken')

const {checkJoin,checkCreate,joinRoom,checkToken,getUserBySocket,updateUser,removeUser,getUsersInRoom,formatter} =require('./utils/users')

const app = express()
//for application/jsob
app.use(bodyParser.json())
//for urlencoded form
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, './public')))
const server = http.createServer(app)
const PORT =process.env.PORT||5050
const SECRET_KEY=process.env.SECRET_KEY||'SECRET_KEY'
const io = socket(server)

app.get('/clearly', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, './resource/clearly.mp3'))
})

app.post('/createroom', (req, res) => {
    let user = req.body
    user.isAdmin = true
    let alreadyExists = checkCreate(user)
    if (!alreadyExists)
    {
        let token = jwt.sign(JSON.stringify(user), SECRET_KEY)
        user.token = token
        joinRoom(user)
        return res.status(200).send({token})
        }
     res.status(404).send({error:'Room Already Exists !!!'})   
})

app.post('/joinroom', (req, res) => {
    let user = req.body
    user.isAdmin = false
    let alreadyExists = checkJoin(user)
    if (alreadyExists!==true)
        return res.status(404).send({ error: alreadyExists })
    
    let token = jwt.sign(JSON.stringify(user), SECRET_KEY)
    user.token = token
    joinRoom(user)
    res.status(200).send({token})
})

app.post('/checktoken', (req, res) => {
    if (req.body.token === null)
        return res.sendStatus(400)
    let tokenChecked = checkToken(req.body.token)
    if (!tokenChecked)
        return res.sendStatus(400)
    res.status(200).send()
})

disconnectedUsers=[]
io.on('connection', socket => {
    socket.on('joining', (token, cb) => {
        // if user present in disconnected users then he relaoded so we have to check
        let user = jwt.decode(token, SECRET_KEY)
        let index = disconnectedUsers.findIndex(u => u.token === token)
        user.id = socket.id
        user.token = token
        updateUser(user)
        socket.join(user.roomName)

        let allUsers = getUsersInRoom(user.roomName)
        let formattedUser = formatter(user)    
        
        if (index !== -1){
            disconnectedUsers.splice(index, 1)
            cb(formattedUser, allUsers)
            return
        }
        //else we will send welcome message
        cb(formattedUser, allUsers)
        socket.broadcast.to(user.roomName).emit('newuserjoined', { user:formattedUser, allUsers })
    })
    
    socket.on('sendingmessage', (message,cb) => {
        let user = getUserBySocket(socket.id)
        socket.broadcast.to(user.roomName).emit('messagerecieved', { user: user.userName, message })
        cb()
    })

    socket.on('sharinglocation', (payLoad,cb) => {
        let user = getUserBySocket(socket.id)
        socket.broadcast.to(user.roomName).emit('usersharinglocation', { location: 'https://www.google.com/maps?q=' + payLoad.latitude + ',' + payLoad.longitude ,user:user.userName})  
        cb()
    })

    socket.on('exitpermission', (cb) => {
        let user = getUserBySocket(socket.id)
        cb(user)
    })

    socket.on('destroyroom', () => {
        let user = getUserBySocket(socket.id)
        socket.broadcast.to(user.roomName).emit('roomdestroyed')
    })

    socket.on('sendingimage', (file,cb) => {
        let user=getUserBySocket(socket.id)
        socket.broadcast.to(user.roomName).emit('recievingimage', { file, user:user.userName })
        cb()
    })

    socket.on('disconnect', () => {
        let user = getUserBySocket(socket.id)
        disconnectedUsers.push(user)
        setTimeout(() => {
            try{
            if (disconnectedUsers.length > 0) {
                let index = disconnectedUsers.findIndex(u => u.id === socket.id)
                if (index !== -1) {
                    let user = disconnectedUsers[index]
                    disconnectedUsers.splice(index, 1)
                    let allUsers = removeUser(user)
                    //we will send the remaining users in the meeting
                    socket.broadcast.to(user.roomName).emit('userleft', { message: `${user.userName} has left`, allUsers })
                }
            }
        }catch(e){}
        },3000)
    })
    
})
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})