'use strict';

/// main

// add selectors
const todoInput  = document.querySelector('.todo-input');
const todoButton = document.querySelector('.todo-add-button');
const todoList   = document.querySelector('.todo-list');
const todoSelect = document.querySelector('.todo-select');

// listen events
document.addEventListener('DOMContentLoaded', getTodos);
todoButton.addEventListener('click', addTodo);
todoList.addEventListener('click', handleTodo);
todoSelect.addEventListener('click', filterTodos);

/// functions

// add todo
function addTodo(event) {
    let todoWrap;
    let todoItem;
    let todoCompleteButton;
    let todoRemoveButton;

    // prevent default submitting
    event.preventDefault();

    // make todo wrap
    todoWrap = document.createElement('div');
    todoWrap.classList.add('todo-wrap');

    // make todo item
    todoItem = document.createElement('li');
    todoItem.classList.add('todo-item');
    todoItem.innerText = todoInput.value;

    // make todo complete button
    todoCompleteButton = document.createElement('button');
    todoCompleteButton.classList.add('todo-complete-button');
    todoCompleteButton.innerHTML = '<span class="material-icons">check</span>';

    // make todo remove button
    todoRemoveButton = document.createElement('button');
    todoRemoveButton.classList.add('todo-remove-button');
    todoRemoveButton.innerHTML = '<span class="material-icons">delete</span>';

    // combine todo elements in todo wrap
    todoWrap.appendChild(todoItem);
    todoWrap.appendChild(todoCompleteButton);
    todoWrap.appendChild(todoRemoveButton);

    // add todo wrap to todo list
    todoList.appendChild(todoWrap);

    // save session storage todo
    saveTodo(todoItem.innerText);

    // release todo input
    todoInput.value = '';

    return;
}

// remove or mark todo as complete  
function handleTodo(event) {
    // handle todo complete button
    if (event.target.classList[0] === 'todo-complete-button') {
        let todoWrap;

        // mark completed/uncompleted todo wrap
        todoWrap = event.target.parentElement;
        todoWrap.classList.toggle('completed');

        return;
    }

    // handle todo remove button
    else if (event.target.classList[0] === 'todo-remove-button') {
        let todoWrap;
        let todoItemTexts;

        // mark removed todo wrap
        todoWrap = event.target.parentElement;
        todoWrap.classList.toggle('removed');

        // remove todo wrap
        todoWrap.addEventListener('transitionend', function() {
            todoWrap.remove();
        });

        // get session storage todos
        if (sessionStorage.getItem('todoItemTexts') === null) {
            todoItemTexts = [];
        }
        else {
            todoItemTexts = JSON.parse(sessionStorage.getItem('todoItemTexts'));
        }

        // remove session storage todo
        todoItemTexts.splice(todoItemTexts.indexOf(todoWrap.children[0].innerText), 1);
        sessionStorage.setItem('todoItemTexts', JSON.stringify(todoItemTexts));

        return;
    }

    return;
}

// filter todos
function filterTodos(event) {
    let todoWraps = document.querySelectorAll('.todo-wrap');;
    
    todoWraps.forEach(function(todoWrap) {
        switch (event.target.value) {
            case 'all':
                todoWrap.style.display = 'flex';
                break;
            case 'completed':
                if (todoWrap.classList.contains('completed')) {
                    todoWrap.style.display = 'flex';
                }
                else {
                    todoWrap.style.display = 'none';                  
                }
                break;
            case 'uncompleted':
                if (!todoWrap.classList.contains('completed')) {
                    todoWrap.style.display = 'flex';
                }
                else {
                    todoWrap.style.display = 'none';
                }
                break;
        }
    });
}

// save session storage todo
function saveTodo(todoItemText) {
    let todoItemTexts;
    
    // get session storage todos
    if (sessionStorage.getItem('todoItemTexts') === null) {
        todoItemTexts = [];
    }
    else {
        todoItemTexts = JSON.parse(sessionStorage.getItem('todoItemTexts'));
    }
    
    // save session storage todo
    todoItemTexts.push(todoItemText);
    sessionStorage.setItem('todoItemTexts', JSON.stringify(todoItemTexts));
}

// get session storage todos
function getTodos() {
    let todoItemTexts;

    // get session storage todos 
    if (sessionStorage.getItem('todoItemTexts') === null) {
        todoItemTexts = [];
    }
    else {
        todoItemTexts = JSON.parse(sessionStorage.getItem('todoItemTexts'));
    }

    // get session storage todo
    todoItemTexts.forEach(function(todoItemText) {
        let todoWrap;
        let todoItem;
        let todoCompleteButton;
        let todoRemoveButton;
    
        // make todo wrap
        todoWrap = document.createElement('div');
        todoWrap.classList.add('todo-wrap');

        // make todo item
        todoItem = document.createElement('li');
        todoItem.classList.add('todo-item');
        todoItem.innerText = todoItemText;

        // make todo complete button
        todoCompleteButton = document.createElement('button');
        todoCompleteButton.classList.add('todo-complete-button');
        todoCompleteButton.innerHTML = '<span class="material-icons">check</span>';

        // make todo remove button
        todoRemoveButton = document.createElement('button');
        todoRemoveButton.classList.add('todo-remove-button');
        todoRemoveButton.innerHTML = '<span class="material-icons">delete</span>';

        // combine todo elements in todo wrap
        todoWrap.appendChild(todoItem);
        todoWrap.appendChild(todoCompleteButton);
        todoWrap.appendChild(todoRemoveButton);

        // add todo wrap to todo list
        todoList.appendChild(todoWrap);
    });
}