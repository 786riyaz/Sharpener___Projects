let listElements = document.querySelectorAll('.fruit');

for (let i = 0; i < listElements.length; i++){
    let editButton = document.createElement('button');
    editButton.innerText = "Edit";
    editButton.className = "edit-btn";
    listElements[i].appendChild(editButton);
}

let form = document.querySelector('form');
let fruitList = document.querySelector('.fruits');

form.addEventListener('submit', function (e) {
    e.preventDefault();

    let fruitInput = document.getElementById('fruit-to-add');
    let fruitName = fruitInput.value;

    if (fruitName.trim() === "") return;

    let newLi = document.createElement('li');
    newLi.className = 'fruit';
    newLi.appendChild(document.createTextNode(fruitName));

    let deleteBtn = document.createElement('button');
    deleteBtn.innerText = "x";
    deleteBtn.className = "delete-btn";

    let editBtn = document.createElement('button');
    editBtn.innerText = "Edit";
    editBtn.className = "edit-btn";

    newLi.appendChild(deleteBtn)
    newLi.appendChild(editBtn);

    fruitList.appendChild(newLi);
    fruitInput.value = "";
});

fruitList.addEventListener('click',function(e) {
    if(e.target.classList.contains('delete-btn')){
    let li = e.target.parentElement;
    fruitList.removeChild(li);
    }
})