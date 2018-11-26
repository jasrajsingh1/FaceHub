let selected = document.getElementById("selected").value;
document.getElementById(selected ? selected : 'All').classList.add('selected');