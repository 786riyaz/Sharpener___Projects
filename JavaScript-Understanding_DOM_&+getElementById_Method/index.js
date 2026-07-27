// Write your code below:
let heading = document.getElementById('main-heading');
heading.textContent = "Fruit World";
heading.style.color = "orange";

let header = document.getElementById('header');
header.style.backgroundColor = "green";
header.style.borderBottom = "3px solid orange";

let title = document.getElementById('basket-heading');
title.style.color = "green";

let para = document.createElement('p');
para.textContent = "Please visit us again";

let paraDiv = document.getElementById('thanks');
paraDiv.appendChild(para);