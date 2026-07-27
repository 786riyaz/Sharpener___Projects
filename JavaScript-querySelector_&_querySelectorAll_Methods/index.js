// Write the code as shown in the video below:
let mainHeading = document.querySelector('#basket-heading');
mainHeading.style.color = "brown";

let items = document.querySelectorAll('.fruit');
for (let i = 0; i < items.length; i++){
    items[i].style.listStyleType = 'none';
}

let eventItems = document.querySelectorAll('.fruit:nth-child(even)');
for (let i = 0; i < eventItems.length; i++){
    eventItems[i].style.backgroundColor = "brown";
    eventItems[i].style.color = "white";
}
