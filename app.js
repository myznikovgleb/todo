'use strict';

/// main

// query objects
const todoInputItem   = document.querySelector('.todo-input-item');
const todoInputButton = document.querySelector('.todo-input-button');
const todoList        = document.querySelector('.todo-list');
const todoEnvCB       = document.querySelector('.todo-env-cb');
const todoHeader      = document.querySelector('.todo-list-header');

// listen events
document
    .addEventListener('DOMContentLoaded', todoHeaderStorageLoad);
document
    .addEventListener('DOMContentLoaded', todoStorageLoad);
todoInputButton
    .addEventListener('click', todoAdd);
todoList
    .addEventListener('click', todoHandle);
todoEnvCB
    .addEventListener('change', envThemeToogle);
todoHeader
    .addEventListener('click', todoHeaderEdit);


/// functions

// add todo
function todoAdd(event) {
    let todo;
    let todoContent
    let todoState;
    let todoSpan;
    let todoDoneButton;
    let todoRemoveButton;
    let todoStorage;

    // prevent default submitting
    event.preventDefault();

    // make todo
    todo = document.createElement('div');
    todo.classList.add('todo');

    // make todo content
    todoContent = todoInputItem.value;

    // make todo state
    todoState = 'default';

    // make todo span
    todoSpan = document.createElement('span');
    todoSpan.classList.add('todo-span');
    todoSpan.innerText = todoContent;

    // make todo done button
    todoDoneButton = document.createElement('a');
    todoDoneButton.classList.add('todo-done-button');
    todoDoneButton.innerHTML = '<span class="material-icons">check</span>';

    // make todo remove button
    todoRemoveButton = document.createElement('a');
    todoRemoveButton.classList.add('todo-remove-button');
    todoRemoveButton.innerHTML = '<span class="material-icons">delete</span>';

    // combine todo parts
    todo.appendChild(todoSpan);
    todo.appendChild(todoDoneButton);
    todo.appendChild(todoRemoveButton);

    // add todo to list
    todoList.appendChild(todo);
    
    // get session storage todos
    if (sessionStorage.getItem('todoStorage') === null) {
        todoStorage = [];
    }
    else {
        todoStorage = JSON.parse(sessionStorage.getItem('todoStorage'));
    }
    
    // update session storage todos
    todoStorage.push({
        content: todoContent,
        state: todoState
    });
    sessionStorage.setItem('todoStorage', JSON.stringify(todoStorage));

    // release todo input
    todoInputItem.value = '';

    return;
}

// toggle or remove todo 
function todoHandle(event) {
    // toggle todo
    if (event.target.classList[0] == 'todo-done-button') {
        let todo = event.target.parentElement;
        let todoStorage;

        // get session storage todos
        if (sessionStorage.getItem('todoStorage') === null) {
            todoStorage = [];
        }
        else {
            todoStorage = JSON.parse(sessionStorage.getItem('todoStorage'));
        }

        // update session storage todos
        for (let i = 1; i < todoList.childNodes.length; i++)
            if (todoList.childNodes[i] === todo)
                todoStorage[i-1].state == 'default' ? todoStorage[i-1].state = 'done' : todoStorage[i-1].state = 'default';
        sessionStorage.setItem('todoStorage', JSON.stringify(todoStorage));

        // toggle todo
        todo.classList.toggle('done');

        return;
    }

    // remove todo 
    else if (event.target.classList[0] == 'todo-remove-button') {
        let todo = event.target.parentElement;
        let todoStorage;

        // get session storage todos
        if (sessionStorage.getItem('todoStorage') === null) {
            todoStorage = [];
        }
        else {
            todoStorage = JSON.parse(sessionStorage.getItem('todoStorage'));
        }

        // update session storage todos
        for (let i = 1; i < todoList.childNodes.length; i++)
            if (todoList.childNodes[i] === todo)
                todoStorage.splice(i-1, 1);
        sessionStorage.setItem('todoStorage', JSON.stringify(todoStorage));

        // remove todo
        todo.remove();

        return;
    }

    return;
}

// load session storage todos
function todoStorageLoad() {
    let todoStorage;

    // get session storage todos
    if (sessionStorage.getItem('todoStorage') === null) {
        todoStorage = [];
    }
    else {
        todoStorage = JSON.parse(sessionStorage.getItem('todoStorage'));
    }

    // add session storage todos
    todoStorage.forEach(function(todoStorageItem) {
        let todo;
        let todoContent
        let todoState;
        let todoSpan;
        let todoDoneButton;
        let todoRemoveButton;
    
        // make todo
        todo = document.createElement('div');
        todo.classList.add('todo');

        // make todo content
        todoContent = todoStorageItem.content;

        // make todo state
        todoState = todoStorageItem.state;

        // make todo span
        todoSpan = document.createElement('span');
        todoSpan.classList.add('todo-span');
        todoSpan.innerText = todoContent;

        // make todo done button
        todoDoneButton = document.createElement('a');
        todoDoneButton.classList.add('todo-done-button');
        todoDoneButton.innerHTML = '<span class="material-icons">check</span>';

        // make todo remove button
        todoRemoveButton = document.createElement('a');
        todoRemoveButton.classList.add('todo-remove-button');
        todoRemoveButton.innerHTML = '<span class="material-icons">delete</span>';

        // combine todo parts
        todo.appendChild(todoSpan);
        todo.appendChild(todoDoneButton);
        todo.appendChild(todoRemoveButton);

        // add todo to list
        todoList.appendChild(todo);

        // toggle todo
        if (todoState == 'done')
            todo.classList.toggle('done');
    });
}

// toogle environment theme
function envThemeToogle() {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
}

// edit header of list
function todoHeaderEdit() {
    let todoHeaderTA;

    // replace header with text area
    todoHeaderTA = document.createElement('textarea');
    todoHeaderTA.value = todoHeader.innerHTML;
    todoHeaderTA.classList.add('todo-list-header-ta')
    
    todoHeader.replaceWith(todoHeaderTA);

    todoHeaderTA.addEventListener('blur', function() {
        // replace text area with header
        todoHeader.innerHTML = todoHeaderTA.value;
        todoHeaderTA.replaceWith(todoHeader);

        // update session storage header
        sessionStorage.setItem('todoHeader', JSON.stringify(todoHeader.innerHTML));
    });
}

// 
function todoHeaderStorageLoad() {
     // get session storage header
    if (sessionStorage.getItem('todoHeader') == null) {
        return;
    }
    else {
        // replace header with session storage header
        let todoHeaderStorage;
        todoHeaderStorage = JSON.parse(sessionStorage.getItem('todoHeader'));
        todoHeader.innerHTML = todoHeaderStorage;
        return;
    }
}