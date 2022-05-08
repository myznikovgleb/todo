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
todoInputItem
    .addEventListener('input', todoInputButtonToogle);
todoInputItem
    .addEventListener('keydown', todoAdd);
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

    if (event instanceof KeyboardEvent) {
        if (event.key == 'Enter') {
        // prevent default behavior
        event.preventDefault();
        }
        else {
            // do nothing
            return;
        }
    }
    else if (event instanceof MouseEvent) {
        // prevent default behavior
        event.preventDefault();
    }

    // forbid empty todo
    if (todoInputItem.value == '')
        return; 

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

    // allow to pick todo
    todoSpan.addEventListener('mousedown', todoPick);

    // disable todo input button 
    todoInputButton.classList.add('disable');
    
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
function todoStorageLoad(event) {
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

        // allow to pick todo
        todoSpan.addEventListener('mousedown', todoPick);
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

// load session storage header
function todoHeaderStorageLoad(event) {
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

// toogle todo input button
function todoInputButtonToogle(event) {
    if ((todoInputItem.value == '') && !(todoInputButton.classList.contains('disable'))) {
        todoInputButton.classList.add('disable'); 
    }
    else if (!(todoInputItem.value == '') && (todoInputButton.classList.contains('disable'))) {
        todoInputButton.classList.remove('disable');
    }
    return;
}

// pick todo
function todoPick(event) {
    let todo;
    let todoShadow;

    // get picked todo
    todo = event.target.parentElement;
    
    // make shadow copy of picked todo
    todoShadow = todo.cloneNode();
    todoShadow.innerHTML = todo.innerHTML;
    todoShadow.classList.add('shadow');

    // add shadow todo to list
    todoList.insertBefore(todoShadow, todo);

    // drag todo to pick point
    todo.classList.add('dragged');
    todoDragTo(todo, event.pageY);
    
    // listen drag and drop
    document
        .addEventListener('mousemove', todoDrag);
    todo
        .addEventListener('mouseup',   todoDrop);

    return;
}

// drag todo
function todoDrag(event) {
    todoDragTo(event.target, event.pageY);
    return;
}

// drag todo to Y-coordinate
function todoDragTo(todo, Y) {
    todo.style.top = Y - todo.offsetHeight / 2 + 'px';
    return;
}

// drop todo
function todoDrop(event) {
    let todo;
    let todoShadow;
    let target;
    let targetIndex;
    let todoIndex;
    let todoStorage;

    // get todo, its shadow and target
    todo        = event.target.parentElement;
    todoShadow  = document.querySelector('.shadow');
    target      = todoFromPoint(event.clientX, event.clientY);

    // release todo shadow
    todoList.replaceChild(todo, todoShadow);
    todoShadow.remove();

    // release dragging
    todo.classList.remove('dragged');
    todo.style.top = 'auto';

    // get indices of todo and target
    todoIndex   = 1;
    targetIndex = 1;
    for (let i = 1; i < todoList.childNodes.length; i++) {
        if (todoList.childNodes[i] === todo)
            todoIndex  = i; 
        if (todoList.childNodes[i] === target)
            targetIndex = i;
    }

    // drop todo right before target
    if (todoIndex < targetIndex) {
        // go down with swaps
        for (let i = todoIndex; i < targetIndex; i++) {
            let blank = document.createElement('div');
            todoList.insertBefore(blank, todoList.childNodes[i]);
            todoList.replaceChild(todoList.childNodes[i+2], blank);
        }
    }
    else if (todoIndex > targetIndex) {
        // go up with swaps
        for (let i = todoIndex; i > targetIndex; i--) {
            let blank = document.createElement('div');
            todoList.insertBefore(blank, todoList.childNodes[i-1]);
            todoList.replaceChild(todoList.childNodes[i+1], blank);
        }
    }
    else {
        // do nothing
    }
    
    // update session storage todos
    todoStorage = [];
    for (let i = 1; i < todoList.childNodes.length; i++) {
        todoStorage.push({
            content: todoList.childNodes[i].childNodes[0].innerHTML,
            state: (todoList.childNodes[i].classList.contains('done')) ? 'done' : 'default'
        });
    }
    sessionStorage.setItem('todoStorage', JSON.stringify(todoStorage));

    // stop listen drag and drop
    document
        .removeEventListener('mousemove', todoDrag);
    todo
        .removeEventListener('mouseup', todoDrop);

    return;
}

// get todo from point with X,Y-coordinates
function todoFromPoint(X, Y) {
    let todoSpanDragged;
    let todoDragged;
    let todoTargetSpan;
    let todoTarget;

    // get dragged todo from point
    todoSpanDragged = document.elementFromPoint(X, Y);
    todoDragged     = todoSpanDragged.parentElement;

    // forbid to get dragged todo from point
    todoSpanDragged.classList.add('pointerEventsNone');
    todoDragged.classList.add('pointerEventsNone');

    // get target todo form point
    todoTargetSpan = document.elementFromPoint(X, Y);

    // allow to get dragged todo from point
    todoSpanDragged.classList.remove('pointerEventsNone');
    todoDragged.classList.remove('pointerEventsNone');
    
    // return target todo
    if (todoTargetSpan.classList.contains('todo-span')) {
        todoTarget = todoTargetSpan.parentElement;
        if (todoTarget.classList.contains('shadow')) {
            return todoDragged;
        }
        else {
            return todoTarget;  
        }
    }
    else {
        return todoDragged;
    }
}