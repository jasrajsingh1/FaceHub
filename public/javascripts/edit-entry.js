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

$('#tags').tagsinput('refresh');