function handleFormSubmit(event) {
    event.preventDefault();

    const username = event.target.username.value;
    const email = event.target.email.value;
    const phone = event.target.phone.value;

    const userObj = { username, email, phone };

    localStorage.setItem(email, JSON.stringify(userObj));
    showUserOnScreen(userObj);
}

function showUserOnScreen(userObj) {
    const parentElem = document.querySelector('ul');
    const childElem = document.createElement('li');

    childElem.textContent = `Username: ${userObj.username}, Email: ${userObj.email}, Phone: ${userObj.phone}`;
    parentElem.appendChild(childElem);
}

function getUsersFromLocalStorage() {
    const parentElem = document.querySelector('ul');

    for (let i = 0; i < localStorage.length; i++){
        const key = localStorage.key(i);
        const userObj = JSON.parse(localStorage.getItem(key));

        if (userObj && userObj.email) {
            const childElem = document.createElement('li');
            childElem.textContent = `Username: ${userObj.username}, Email: ${userObj.email}, Phone: ${userObj.phone}`;

            parentElem.appendChild(childElem);

        }
    }
}

// module.exports = handleFormSubmit;