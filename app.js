'use strict';

/// main

// database vars
const todoDBName = 'todoDB';
const todoDBVersion = 1;

// query objects
const todoInputItem   = document.querySelector('.todo-input-item');
const todoInputButton = document.querySelector('.todo-input-button');
const todoList        = document.querySelector('.todo-list');
const todoEnvThemeCB  = document.querySelector('.todo-env-theme-cb');
const todoEnvPageCB   = document.querySelector('.todo-env-page-cb');
const todoHeader      = document.querySelector('.todo-list-header');
const todoPagesCanvas = document.querySelector('.todo-pages-canvas');
const todoPage        = document.querySelector('.todo-page');
const todoPageHeader  = document.querySelector('.todo-page-header');

// listen events
document
    .addEventListener('DOMContentLoaded', todoHeaderDBLoad);
document
    .addEventListener('DOMContentLoaded', todoDBLoad);
document
    .addEventListener('DOMContentLoaded', envThemeLoad);
todoInputItem
    .addEventListener('input', todoInputButtonToggle);
todoInputItem
    .addEventListener('keydown', todoAdd);
todoInputButton
    .addEventListener('click', todoAdd);
todoList
    .addEventListener('click', todoHandle);
todoEnvThemeCB
    .addEventListener('change', envThemeToggle);
todoEnvPageCB
    .addEventListener('change', envPageToggle);
todoHeader
    .addEventListener('click', todoHeaderEdit);
todoPage
    .addEventListener('click', todoPagePick);

/// functions

// add todo
function todoAdd(event) {
    let todo;
    let todoContent
    let todoTag;
    let todoState;
    let todoSpan;
    let todoToolTip;
    let todoDoneButton;
    let todoRemoveButton;
    let todoDB;
    let todoDBRequest;
    let todoStore;

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

    // extract todo content and tag
    todoContent = extractContent(todoInputItem.value);
    todoTag     = extractTag(todoInputItem.value);

    // forbid empty todo
    if (todoContent == '')
        return; 

    // make todo
    todo = document.createElement('div');
    todo.classList.add('todo');

    // make todo state
    todoState = 'default';

    // make todo tooltip
    todoToolTip = document.createElement('span');
    todoToolTip.classList.add('todo-tooltip');
    todoToolTip.innerHTML = todoTag;

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
    if (todoTag)
        todo.appendChild(todoToolTip);
    todo.appendChild(todoSpan);
    todo.appendChild(todoDoneButton);
    todo.appendChild(todoRemoveButton);

    // add todo to list
    todoList.appendChild(todo);

    // allow to pick todo
    todoSpan.addEventListener('mousedown', todoPick);

    // allow to show tooltip of todo subset
    todoSpan.addEventListener('mouseover', todoSubsetTooltipToggle);

    // allow to hide tooltip of todo subset
    todoSpan.addEventListener('mouseout', todoSubsetTooltipToggle);

    // disable todo input button 
    todoInputButton.classList.add('disable');

    // make request to todo database
    todoDBRequest = window.indexedDB.open(todoDBName, todoDBVersion);

    // create stores at todo database
    todoDBRequest.onupgradeneeded = event => {
        todoDB = event.target.result;
        todoDB.createObjectStore('todoStore', {autoIncrement: true});
        todoDB.createObjectStore('todoHeaderStore', {autoIncrement: true});
        todoDB.createObjectStore('envThemeStore', {autoIncrement: true});
    };

    // add todo to todo store
    todoDBRequest.onsuccess = event => {
        let todos = [];
        todoDB = event.target.result;
        
        let todoDBtransaction = todoDB.transaction(['todoStore'], 'readwrite');
        todoStore = todoDBtransaction.objectStore('todoStore');
        
        todoStore.openCursor().onsuccess = event => {
            if (event.target.result) {
                todos.push(event.target.result.value);
                event.target.result.continue();
            }
            else {
                todoStore.clear();
                todos.push({
                    content: todoContent,
                    tag:     todoTag,
                    state:   todoState
                });
                todos.forEach(function(todo) {
                    todoStore.add(todo);
                });
            }
        };
    };

    // release todo input
    todoInputItem.value = '';

    return;
}

// toggle or remove todo 
function todoHandle(event) {
    // toggle todo
    if (event.target.classList[0] == 'todo-done-button') {
        let todo = event.target.parentElement;
        let todoDB;
        let todoDBRequest;
        let todoStore;

        // make request to todo database
        todoDBRequest = window.indexedDB.open(todoDBName, todoDBVersion);

        // toggle todo at todo store
        todoDBRequest.onsuccess = event => {
            let todos = [];
            todoDB = event.target.result;
        
            let todoDBtransaction = todoDB.transaction(['todoStore'], 'readwrite');
            todoStore = todoDBtransaction.objectStore('todoStore');
        
            todoStore.openCursor().onsuccess = event => {
                if (event.target.result) {
                    todos.push(event.target.result.value);
                    event.target.result.continue();
                }
                else {
                    todoStore.clear();
                    for (let i = 1; i < todoList.childNodes.length; i++)
                        if (todoList.childNodes[i] === todo)
                            todos[i-1].state == 'default' ? todos[i-1].state = 'done' : todos[i-1].state = 'default';
                    todos.forEach(function(todo) {
                        todoStore.add(todo);
                    });
                }
            };
        };

        // toggle todo
        todo.classList.toggle('done');

        return;
    }

    // remove todo 
    else if (event.target.classList[0] == 'todo-remove-button') {
        let todo = event.target.parentElement;
        let todoDB;
        let todoDBRequest;
        let todoStore;

        // make request to todo database
        todoDBRequest = window.indexedDB.open(todoDBName, todoDBVersion);

        // remove todo from todo store
        todoDBRequest.onsuccess = event => {
            let todos = [];
            todoDB = event.target.result;
        
            let todoDBtransaction = todoDB.transaction(['todoStore'], 'readwrite');
            todoStore = todoDBtransaction.objectStore('todoStore');
        
            todoStore.openCursor().onsuccess = event => {
                if (event.target.result) {
                    todos.push(event.target.result.value);
                    event.target.result.continue();
                }
                else {
                    todoStore.clear();
                    for (let i = 1; i < todoList.childNodes.length; i++) {
                        if (todoList.childNodes[i] === todo)
                            todos.splice(i-1, 1);
                    }
                    todos.forEach(function(todo) {
                        todoStore.add(todo);
                    });

                    // remove todo
                    todo.remove();
                }
            };
        };

        return;
    }

    return;
}

// load database todos
function todoDBLoad(event) {
    let todoDB;
    let todoDBRequest;
    let todoStore;

    // make request to todo database
    todoDBRequest = window.indexedDB.open(todoDBName, todoDBVersion);

    // create stores at todo database
    todoDBRequest.onupgradeneeded = event => {
        todoDB = event.target.result;
        todoDB.createObjectStore('todoStore', {autoIncrement: true});
        todoDB.createObjectStore('todoHeaderStore', {autoIncrement: true});
        todoDB.createObjectStore('envThemeStore', {autoIncrement: true});
    };

    // add todo from todo store
    todoDBRequest.onsuccess = event => {
        let todos = [];
        todoDB = event.target.result;
        
        let todoDBtransaction = todoDB.transaction(['todoStore'], 'readwrite');
        todoStore = todoDBtransaction.objectStore('todoStore');
        
        todoStore.openCursor().onsuccess = event => {
            if (event.target.result) {
                todos.push(event.target.result.value);
                event.target.result.continue();
            } 
            else { 
                todos.forEach(function(todoStorageItem) {
                let todo;
                let todoContent
                let todoTag;
                let todoState;
                let todoSpan;
                let todoToolTip;
                let todoDoneButton;
                let todoRemoveButton;
    
                // make todo
                todo = document.createElement('div');
                todo.classList.add('todo');

                // make todo content
                todoContent = todoStorageItem.content;

                // make todo tag
                todoTag = todoStorageItem.tag;

                // make todo state
                todoState = todoStorageItem.state;

                // make todo tooltip
                todoToolTip = document.createElement('span');
                todoToolTip.classList.add('todo-tooltip');
                todoToolTip.innerHTML = todoTag;

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
                if (todoTag)
                    todo.appendChild(todoToolTip);
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

                // allow to show tooltip of todo subset
                todoSpan.addEventListener('mouseover', todoSubsetTooltipToggle);

                // allow to hide tooltip of todo subset
                todoSpan.addEventListener('mouseout', todoSubsetTooltipToggle);
                });
            }
        };
    };
}

// toggle environment theme
function envThemeToggle(event) {
    let todoDB;
    let todoDBRequest;
    let envThemeStore;

    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');

    // make request to todo database
    todoDBRequest = window.indexedDB.open(todoDBName, todoDBVersion);

    // create stores at todo database
    todoDBRequest.onupgradeneeded = event => {
        todoDB = event.target.result;
        todoDB.createObjectStore('todoStore', {autoIncrement: true});
        todoDB.createObjectStore('todoHeaderStore', {autoIncrement: true});
        todoDB.createObjectStore('envThemeStore', {autoIncrement: true});
    };

    // update environment theme store
    todoDBRequest.onsuccess = event => {
        todoDB = event.target.result;
        
        let todoDBtransaction = todoDB.transaction(['envThemeStore'], 'readwrite');
        envThemeStore = todoDBtransaction.objectStore('envThemeStore');

        envThemeStore.clear();
        envThemeStore.add(document.body.classList[0]);
    };

    return;
}

// toggle environment pages
function envPageToggle(event) {
    todoPagesCanvas.classList.toggle('hidden');
    return;
}

// edit header of list
function todoHeaderEdit() {
    let todoHeaderTA;
    let todoDB;
    let todoDBRequest;
    let todoHeaderStore;

    // replace header with text area
    todoHeaderTA = document.createElement('textarea');
    todoHeaderTA.value = todoHeader.innerHTML;
    todoHeaderTA.classList.add('todo-list-header-ta')
    
    todoHeader.replaceWith(todoHeaderTA);

    todoHeaderTA.addEventListener('blur', function() {
        // replace text area with header
        todoHeader.innerHTML = todoHeaderTA.value;
        todoHeaderTA.replaceWith(todoHeader);

        // make request to todo database
        todoDBRequest = window.indexedDB.open(todoDBName, todoDBVersion);

        // create stores at todo database
        todoDBRequest.onupgradeneeded = event => {
            todoDB = event.target.result;
            todoDB.createObjectStore('todoStore', {autoIncrement: true});
            todoDB.createObjectStore('todoHeaderStore', {autoIncrement: true});
            todoDB.createObjectStore('envThemeStore', {autoIncrement: true});
        };

        // update todo header store
        todoDBRequest.onsuccess = event => {
            todoDB = event.target.result;
        
            let todoDBtransaction = todoDB.transaction(['todoHeaderStore'], 'readwrite');
            todoHeaderStore = todoDBtransaction.objectStore('todoHeaderStore');

            todoHeaderStore.clear();
            todoHeaderStore.add(todoHeader.innerHTML);
        };

        // update todo page header
        todoPageHeader.innerHTML = todoHeader.innerHTML;
    });

    return;
}

// load database todo header
function todoHeaderDBLoad(event) {
    let todoDB;
    let todoDBRequest;
    let todoHeaderStore;

    // make request to todo database
    todoDBRequest = window.indexedDB.open(todoDBName, todoDBVersion);

    // create stores at todo database
    todoDBRequest.onupgradeneeded = event => {
        todoDB = event.target.result;
        todoDB.createObjectStore('todoStore', {autoIncrement: true});
        todoDB.createObjectStore('todoHeaderStore', {autoIncrement: true});
        todoDB.createObjectStore('envThemeStore', {autoIncrement: true});
    };

    // replace header with header from store
    todoDBRequest.onsuccess = event => {
        let todoHeaders = [];
        todoDB = event.target.result;
       
        let todoDBtransaction = todoDB.transaction(['todoHeaderStore'], 'readwrite');
        todoHeaderStore = todoDBtransaction.objectStore('todoHeaderStore');
       
        todoHeaderStore.openCursor().onsuccess = event => {
            if (event.target.result) {
                todoHeaders.push(event.target.result.value);
                event.target.result.continue();
            }
            else {
                if (todoHeaders.length == 0) {
                    return;
                }
                else {
                    todoHeader.innerHTML = todoHeaders[0];
                    todoPageHeader.innerHTML = todoHeaders[0];
                    return;
                }
            }
        };
    };
}

// toggle todo input button
function todoInputButtonToggle(event) {
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
    let todoDB;
    let todoDBRequest;
    let todoStore;

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

    // make request to todo database
    todoDBRequest = window.indexedDB.open(todoDBName, todoDBVersion);

    // update todo store
    todoDBRequest.onsuccess = event => {
        let todos = [];
        todoDB = event.target.result;
        
        let todoDBtransaction = todoDB.transaction(['todoStore'], 'readwrite');
        todoStore = todoDBtransaction.objectStore('todoStore');
        
        todoStore.openCursor().onsuccess = event => {
            if (event.target.result) {
                todos.push(event.target.result.value);
                event.target.result.continue();
            }
            else {
                todoStore.clear();
                if (todoIndex < targetIndex) {
                    // go down with swaps
                    for (let i = todoIndex; i < targetIndex; i++) {
                        let blank = todos[i-1];
                        todos[i-1] = todos[i];
                        todos[i]   = blank;
                    }
                }
                else if (todoIndex > targetIndex) {
                    // go up with swaps
                    for (let i = todoIndex; i > targetIndex; i--) {
                        let blank = todos[i-2];
                        todos[i-2] = todos[i-1];
                        todos[i-1] = blank;
                    }
                }
                else {
                    // do nothing
                }
                todos.forEach(function(todo) {
                    todoStore.add(todo);
                });
             }
        };
    };

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

// pick current todo page
function todoPagePick(event) {
    todoPagesCanvas.classList.toggle('hidden');
}

// extract content from string
function extractContent(string) {
    let content;

    const contentRE = /:[\w|\s]*/i;
    const wsRE      = /\s/;

    // extract content from string
    content = contentRE.exec(string);

    // release column symbol
    if (content === null) {
        content = string;
    }
    else {
        content = content[0].replace(':', '');
    }

    return content;
}

// extract tag from string
function extractTag(string) {
    let tag;

    const tagRE = /[\w|\s]*:/i;
    const wsRE  = /\s/;

    // extract tag from string
    tag = tagRE.exec(string);

    // release column symbol
    if (tag === null) {
        tag = '';
    }
    else {
        tag = tag[0].replace(':', '');
        if (wsRE.test(tag))
            tag = '';
    }

    return tag;
}

// toggle tooltip of todo subset
function todoSubsetTooltipToggle(event) {
    let todoTag;

    // get todo tag
    todoTag = event.target.parentElement.childNodes[0].innerHTML;

    // toggle subset tooltip
    for (let i = 1; i < todoList.childNodes.length; i++)
        if (todoList.childNodes[i].childNodes[0].innerHTML == todoTag)
            todoList.childNodes[i].childNodes[0].classList.toggle('visible');

    return;
};

// load environment theme
function envThemeLoad(event) {
    let todoDB;
    let todoDBRequest;
    let envThemeStore;

    // make request to todo database
    todoDBRequest = window.indexedDB.open(todoDBName, todoDBVersion);

    // create stores at todo database
    todoDBRequest.onupgradeneeded = event => {
        todoDB = event.target.result;
        todoDB.createObjectStore('todoStore', {autoIncrement: true});
        todoDB.createObjectStore('todoHeaderStore', {autoIncrement: true});
        todoDB.createObjectStore('envThemeStore', {autoIncrement: true});
    };

    // toggle theme with theme from store
    todoDBRequest.onsuccess = event => {
        let envThemes = [];
        todoDB = event.target.result;
       
        let todoDBtransaction = todoDB.transaction(['envThemeStore'], 'readwrite');
        envThemeStore = todoDBtransaction.objectStore('envThemeStore');
       
        envThemeStore.openCursor().onsuccess = event => {
            if (event.target.result) {
                envThemes.push(event.target.result.value);
                event.target.result.continue();
            }
            else {
                if (envThemes.length == 0) {
                    return;
                }
                else if (envThemes[0] == 'dark') {
                    document.body.classList.toggle('dark');
                    document.body.classList.toggle('light');
                    return;
                }
            }
        };
    };
}