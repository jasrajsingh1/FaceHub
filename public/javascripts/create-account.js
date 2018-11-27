function handleFileSelect(e){
    let file = e.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function(){
        let img = document.getElementsByTagName('img')[0];
        if(img == null){
            img = document.createElement('img');
            document.getElementsByClassName("dropZoneContainer")[0].prepend(img);
            $('.dropZoneOverlay').removeClass('empty');
            $('.dropZoneOverlay').addClass('filled');
        }
        img.src = reader.result;
    };
}

function validate() {

    let p = document.getElementById("password").value;
    let cp = document.getElementById("confirmPassword").value;
    let phoneNumber = document.getElementById("number").value;
    let msg = "";


    if(p !== cp) {
        msg += "Passwords don't match\n";
    }

    if(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phoneNumber) === false) {
        msg += "Phone number is incorrect. Please format it correctly\n"
    }

    if(msg !== "") {
        alert(msg);
        return false;
    }

    return true;
}