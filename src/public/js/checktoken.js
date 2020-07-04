console.log('preloading')
var xhr = new XMLHttpRequest()
xhr.onload = () => {
    if (xhr.readyState === 4) {
        if (xhr.status !== 200) {
            try {
                sessionStorage.removeItem('token')
            } catch (e) { }
            return window.location.replace('/')
        }  
        console.log(xhr.status)
    }
}
xhr.open('POST', '/checktoken')
xhr.setRequestHeader('Content-type','application/json')
xhr.send(JSON.stringify({token:sessionStorage.getItem('token')}))