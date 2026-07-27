let newH3 = document.createElement('h3');
newH3.innerText = "Buy high quality organic fruits online";
newH3.style.fontStyle = "italic";

let divs = document.querySelectorAll("div");
divs[0].appendChild(newH3);

let ul = document.querySelector("ul");
let newP = document.createElement("p");
newP.innerText = "Total fruits:4";
newP.id = 'fruits-total';
divs[1].insertBefore(newP, ul);