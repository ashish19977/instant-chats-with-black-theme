let form = document.getElementById('form1')
let crtBtn = document.getElementById('crt-btn')
let jnBtn = document.getElementById('jn-btn')
let user = document.getElementById('user')
let room = document.getElementById('room')
let p=document.getElementById('alert')
let action=''

try {
    sessionStorage.removeItem('token')
}catch(e){}

form.addEventListener('submit', e => {
    e.preventDefault()
    //disbble btns
    jnBtn.dissabled = true
    crtBtn.dissabled=true
    let data = {
        userName: user.value,
        roomName:room.value
    }

    let xhr = new XMLHttpRequest()
    xhr.onload = () => {
        if (xhr.readyState === 4) {
            let res = JSON.parse(xhr.response)
            //check if resposne is positive
            if (xhr.status === 200) {
                window.location.replace('/Chat.html')
                sessionStorage.setItem('token', res.token)
            }
            else {
                //this is alert para
                p.style.visibility='visible'
                p.innerHTML = res.error
                setTimeout(() => {
                    p.style.visibility='hidden'
                },1200)
            }

            //when response is back enbale btn
            jnBtn.dissabled = false
            crtBtn.dissabled=false
        }
    }
    xhr.open(form.method, action)
    xhr.setRequestHeader('Content-type','application/json')
    xhr.send(JSON.stringify(data))
      
})

crtBtn.addEventListener('click', async e => {
    action='/createroom'
    form.action = action
})

document.getElementById('jn-btn').addEventListener('click', e => {
    action = '/joinroom'
    form.action = action
})
window.onpush