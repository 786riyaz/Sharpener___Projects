let form = document.getElementsByTagName('form')[0];

// Task 1: Use DOM Manipulation to add another input element inside form, before the button.
// This input element will take the description of the fruit.
// Create an input element, give it id="description", type="text", and placeholder text like "Enter fruit description".
// Then insert it before the button inside the form.
let descInput = document.createElement('input');
descInput.type = "text";
descInput.id = "description";
descInput.placeholder = "Enter fruit description";

let submitButton = form.querySelector('button');
form.insertBefore(descInput, submitButton);

// add fruit to the cart
let fruititems = document.querySelector('.fruits');
let descriptionitems = document.querySelector('#description');

form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Ensure that a description is provided
    let fruitDescription = document.getElementById('description').value;
    if (fruitDescription === '') {
        alert('Please enter a description.');
        return;
    }

    // Task 2: Add code to show fruit name and description.
    // Create a new <li> element and add fruit name + description (in a <p> tag).
    // Show the description in italics.
    // Add a delete button at the end.
    // Append the new li element to the fruit list.
    let fruitName = document.getElementById('fruit-to-add').value;

    let li = document.createElement('li');
    li.className = 'fruit';

    li.appendChild(document.createTextNode(fruitName));

    let p = document.createElement('p');

    let italic = document.createElement('i');
    italic.textContent = fruitDescription;
    italic.style.fontStyle = "italic";
    p.appendChild(italic);
    p.style.fontStyle = "italic"
    li.appendChild(p);

    let deleteBtn = document.createElement('button');
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "x";

    li.appendChild(deleteBtn);
    fruititems.appendChild(li);

    // Clear input fields
    document.getElementById('fruit-to-add').value = '';
    document.getElementById('description').value = '';
});


// delete functionality
fruititems.addEventListener('click', function (event) {
    if (event.target.classList.contains('delete-btn')) {
        let buttontodelete = event.target.parentElement;
        fruititems.removeChild(buttontodelete);
    }
});

// Task 3: Create a filter that shows only those fruits whose
// either name or description or both matches the entered text.

// HINT: Check both the fruit name and the description (<p> tag)
// If either includes the entered text, show it; otherwise, hide it.

let filter = document.getElementById('filter');
filter.addEventListener('keyup', function (event) {
    let text = event.target.value.toLowerCase();

    let fruits = document.getElementsByClassName('fruit')

    Array.from(fruits).forEach(function (fruit) {
        let fruitName = fruit.childNodes[0].textContent.toLowerCase();

        let description = '';
        let pTag = fruit.querySelector('p');

        if (pTag) {
            description = pTag.textContent.toLowerCase();
        }

        if (fruitName.indexOf(text) !== -1 || description.indexOf(text) !== -1) {
            fruit.style.display = '';
        } else {
            fruit.style.display = "none";
        }
    })
})

