function changeTheme(){
    let circle=document.getElementById('circle')
    let container = document.getElementsByClassName('container')[0]
    if(getComputedStyle(circle).marginLeft==='5px'){
        circle.style.background='black'
        circle.style.marginLeft = '20px'
        container.style.background='#ecf0f1'
        return
    }
    circle.style.background='#ecf0f1'
    circle.style.marginLeft = '5px'
    container.style.background='#17202a'
}

let modal=document.getElementById('modal')
    function showModal(){
        modal.style.top='2%'
    }
    function hideModal(){
        modal.style.top="-102%"
    }