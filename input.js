var keysdown = {};
var keysreleased = {};
var keymap = {
    "jump": ['KeyW', 'KeyZ', 'Space', 'ArrowUp'],
    "left": ['KeyA', 'KeyQ', 'ArrowLeft'],
    "right": ['KeyD', 'ArrowRight'],
    "down": ['KeyS', 'ArrowDown']
}

document.onkeydown = function(e) {
    cursor_visible = false;

    keysdown[e.code] = true;
}

document.onkeyup = function(e) {
    keysdown[e.code] = false;
    keysreleased[e.code] = true;
}

window.onblur = function() {
    for (let key in keysdown) {
        keysdown[key] = false;
    }
}

function keydown(name) {
    for (let code of keymap[name]) {
        if (keysdown[code]) return true;
    }
    return false;
}

function keyreleased(name) {
    for (let code of keymap[name]) {
        if (keysreleased[code]) return true;
    }
    return false;
}