const title = document.getElementById('Title');
const author = document.getElementById('Author');
const link = document.getElementById('Link');
const description = document.getElementById('Description');
const submit = document.getElementById('Submit');

const deleteButtons = document.getElementsByClassName('delete');


const submitHandler = () => {
    console.log('Attempting to submit...')
    let data = [{
        'title': title.value,
        'author': author.value,
        'link': link.value,
        'description': description.value
    }];
    fetch(`api/articles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(() => window.location.replace('/articles'));
};

submit.addEventListener('click', submitHandler);


const deleteHandler = () => {
    console.log('ID: ', event.target.id);
    fetch(`/api/articles/${event.target.id}`, {
        method: 'DELETE'
    }).then(() => window.location.replace('/articles'));
};

for (let i = 0; i < deleteButtons.length; i++) {
    deleteButtons[i].addEventListener('click', deleteHandler);
};

submit.addEventListener('click', deleteHandler);