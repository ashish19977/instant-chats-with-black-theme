let users = []

const checkCreate =user => {
    let alreadyExists = users.find(u => u.roomName === user.roomName)
    return alreadyExists
}

const checkJoin = user => {
    let roomExists = users.find(u => u.roomName === user.roomName)
    if (!roomExists)
        return 'Room not found !!!'
    
    let userAlreadyExists = users.find(u => user.userName === u.userName && user.roomName === u.roomName)
    if (userAlreadyExists)
        return 'User already exists in room'
    return true
}
const joinRoom = user => users.push(user)


const updateUser = user => {
   
    let index = users.findIndex(u => u.token === user.token)
    users[index] = user
}
const getUserBySocket = id => {
    return users.find(u=>u.id===id)
}

const removeUser = user => {
    let index = users.findIndex(u => u.token === user.token)
    if (index !== -1)
        users.splice(index, 1)
    return users.filter(u=>u.roomName===user.roomName)
}

const checkToken = token => {
    return users.find(user => user.token === token)
}

const getUsersInRoom = roomName => users.filter(u => u.roomName === roomName)

const formatter=user=>({userName:user.userName,roomName:user.roomName,isAdmin:user.isAdmin})
module.exports = {
    checkCreate, checkJoin, joinRoom, checkToken,getUserBySocket,updateUser,removeUser,getUsersInRoom,formatter
}