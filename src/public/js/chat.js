var socket = io()

let token = sessionStorage.getItem('token')

let messageSound = new Audio('/clearly')

let messageContainer = document.getElementsByClassName('message-container')[0]
let userContainer=document.getElementsByClassName('user-container')[0]
let messageRecTemp = document.getElementById('message-rec-temp').innerHTML
let messageSentTemp = document.getElementById('message-sent-temp').innerHTML
let usersInRoomTemp = document.getElementById('users-in-room-temp').innerHTML
let locationTemp=document.getElementById('location-temp').innerHTML
let imageSentTemp=document.getElementById('image-sent-temp').innerHTML
let imageRecTemp = document.getElementById('image-rec-temp').innerHTML
let userTemp=document.getElementById('user-temp').innerHTML
let sendBtn = document.getElementById('send-btn')
let locationBtn = document.getElementById('location-btn')
let imgBtn=document.getElementById('img-btn')
let input = document.getElementById('input')
let fileInput = document.getElementById('file')
let loader = document.getElementById('loader')
let roomNameInModal = document.getElementsByClassName('room-info')[0]
let modalBody=document.getElementsByClassName('modal-body')[0]

autoScroll = () => {
    let newMessage = messageContainer.lastElementChild
    //margin heighe
    let newMessageStyleHeight =parseInt(getComputedStyle(newMessage).marginTop)
    //now total height
    let newMessageHeight = newMessage.offsetHeight + newMessageStyleHeight
    //visible height means const height of chaat div
    let visibleHeight = messageContainer.offsetHeight
    
    //height of total messages arrived
    let messageContainerHeight = messageContainer.scrollHeight
    
    if (messageContainerHeight>visibleHeight)
        messageContainer.scrollTop=messageContainerHeight+newMessageHeight
}

socket.emit('joining', token, (user, allUsers) => {
    document.getElementById('username').innerHTML = user.userName
    document.getElementById('roomname').innerHTML=user.roomName
        //adding new user to user list
        let allUsersInRoom = Mustache.render(usersInRoomTemp, { allUsers })
         userContainer.innerHTML = allUsersInRoom
         
        // adding user to modal
        // adding user to modal
        let usersHtml = Mustache.render(userTemp, { allUsers })
        modalBody.innerHTML=usersHtml
    
        roomNameInModal.innerHTML=`${user.roomName} (${allUsers.length})`
        //welcome user
        let welcomeMessage = Mustache.render(messageRecTemp, {
            user: 'Admin', message: `Welcome ${user.userName}`, time: new Date().toString().substring(16, 21)
        })
    messageContainer.insertAdjacentHTML('beforeend', welcomeMessage)
})

socket.on('newuserjoined', ({ user, allUsers }) => {
    // message for new user
    let newUserJoinedMessage = Mustache.render(messageRecTemp, {
        user: 'Admin', message: `${user.userName} has joined`, time: new Date().toString().substring(16, 21)
    })
    messageContainer.insertAdjacentHTML('beforeend', newUserJoinedMessage)
    //adding new user to user list
    let allUsersInRoom = Mustache.render(usersInRoomTemp, { allUsers })
    userContainer.innerHTML = allUsersInRoom
    // adding user to modal
    let usersHtml = Mustache.render(userTemp, { allUsers })
    modalBody.innerHTML=usersHtml
})

socket.on('userleft', ({ message, allUsers }) => {
    let newUserJoinedMessage = Mustache.render(messageRecTemp, {
        user: 'Admin', message: message, time: new Date().toString().substring(16, 21)
    })
    messageContainer.insertAdjacentHTML('beforeend', newUserJoinedMessage)
    //adding new user to user list
    let allUsersInRoom = Mustache.render(usersInRoomTemp, { allUsers })
    userContainer.innerHTML = allUsersInRoom
    // adding user to modal
    let usersHtml = Mustache.render(userTemp, { allUsers })
    modalBody.innerHTML=usersHtml
})

sendBtn.onclick = () => {
    sendBtn.dissabled = true
    locationBtn.dissabled=true
    let message=input.value
    if (message.length <= 0)
        return
    socket.emit('sendingmessage', message, () => {
        let sentMessage = Mustache.render(messageSentTemp, {
            user: 'You', message, time: new Date().toString().substring(16, 21)
        })
        messageContainer.insertAdjacentHTML('beforeend', sentMessage)
        autoScroll()
        input.value=''
        input.focus()
        sendBtn.dissabled = false
        locationBtn.dissabled = false
    })
}
socket.on('messagerecieved', ({ user, message }) => {
    let recMessage = Mustache.render(messageRecTemp, {
        user, message: message, time: new Date().toString().substring(16, 21)
    })
    messageContainer.insertAdjacentHTML('beforeend', recMessage)
    context.resume().then(() =>messageSound.play())
    autoScroll()
})

locationBtn.onclick = () => {
    sendBtn.dissabled = true
    locationBtn.dissabled=true
    if (!navigator.geolocation)
        alert('Your browser dont support location services!')
    else {
        navigator.geolocation.getCurrentPosition((location) => {
            let position = location.coords
            socket.emit('sharinglocation', { latitude: position.latitude, longitude: position.longitude }, () => {
                const locationMessage = Mustache.render(messageRecTemp, {
                    user:'Admin',
                    message:"Your Location Has Been Shared !",
                    time:new Date().toString().substring(15,21)
                })
                messageContainer.insertAdjacentHTML('beforeend', locationMessage)
                autoScroll()
                sendBtn.dissabled = false
                locationBtn.dissabled = false
            })
        })
    }
}

socket.on('usersharinglocation', ({ location, user }) => {
    const locationMessage = Mustache.render(locationTemp, {
        location,
        user,
        time:new Date().toString().substring(15,21)
    })
    messageContainer.insertAdjacentHTML('beforeend', locationMessage)
    context.resume().then(() =>messageSound.play())
    autoScroll()
})

function exit() {
    socket.emit('exitpermission', user => {
        if (user.isAdmin) {
            let consent = confirm('You are admin. Do you want to destroy room too?')
            if (consent)
                socket.emit('destroyroom', () => {
                    sessionStorage.removeItem('token')
                    window.location.replace('/')
                })
            window.location.replace('/')
            sessionStorage.removeItem('token')
        }
        window.location.replace('/')
        sessionStorage.removeItem('token')
    })
}

socket.on('roomdestroyed', () => {
    alert('Room has been closed by Admin')
    window.location.replace('/')
    sessionStorage.removeItem('token')
})

function openFiles() {
    fileInput.click()
}

function sendPic(e) {
    if (e.target.files[0].size > 1100000)
        return alert('We currently don\'t support sending iamges larger than 1mb')
    readThenSendFile(event.target.files[0]); 
}
function readThenSendFile(data) {
    let reader = new FileReader();
    reader.onload = function (evt) {
        imgBtn.style.display = 'none';
        loader.style.display = 'block';
        let file = evt.target.result;
        socket.emit('sendingimage', file, () => {
            let imgHtml = Mustache.render(imageSentTemp, {
                file: file,
                user: "You",
                time: new Date().toString().substring(15, 21)
            })
            messageContainer.insertAdjacentHTML('beforeend', imgHtml) 
            imgBtn.style.display = 'block';
            loader.style.display = 'none';
        })
    }
    reader.readAsDataURL(data)
}

socket.on('recievingimage', ({ file,user }) => {
    let imgHtml = Mustache.render(imageRecTemp, {
        file,
        user,
        time:new Date().toString().substring(15,21)
    })
    messageContainer.insertAdjacentHTML('beforeend', imgHtml) 
    context.resume().then(() =>messageSound.play())
    autoScroll()
})

let context=""
window.onload = function () {
    context = new AudioContext()
}