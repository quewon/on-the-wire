var WINDOW_HIDDEN = false;

var canvas = document.querySelector("canvas");
var context = canvas.getContext("2d");
var width;
var height;

var lines = [];

window.onresize = function() {
    width = window.innerWidth;
    height = window.innerHeight;        

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.resetTransform();
    context.scale(window.devicePixelRatio, window.devicePixelRatio);

    for (let line of lines) {
        context.strokeStyle = line.mode == "normal" ? "black" : "red";
        draw_line(line.points);
    }

    update_player();
    draw_player();

    if (!WINDOW_HIDDEN) requestAnimationFrame(draw);
}

function draw_line(points) {
    context.beginPath();
    context.moveTo(points[0][0], points[0][1]);

    for (let i=1; i<points.length; i++) {
        let point = points[i];
        context.lineTo(point[0], point[1]);
    }

    context.stroke();
}

//

var mouse = [-1, -1];
var mousedown = false;

canvas.onmousedown = function(e) {
    lines.push({
        points: [[e.pageX, e.pageY]],
        mode: "normal"
    });
    mousedown = true;
}

canvas.oncontextmenu = function(e) {
    lines.push({
        points: [[e.pageX, e.pageY]],
        mode: "fast"
    });
    mousedown = true;
    e.preventDefault();
}

document.onmousemove = function(e) {
    mouse = [e.pageX, e.pageY];

    if (mousedown) {
        let current_line = lines[lines.length-1];
        let last_point = current_line.points[current_line.points.length - 1];
        if (last_point) {
            let distance = sqr_distance([e.pageX, e.pageY], last_point);
            if (distance > 2) {
                current_line.points.push([e.pageX, e.pageY]);
            }
        } else {
            current_line.points.push([e.pageX, e.pageY]);
        }
    }
}

document.onmouseup = function() {
    if (lines.length > 0 && lines[lines.length - 1].points.length < 2) {
        lines.pop();
    } else {
        let newline = lines[lines.length - 1];
        if (newline) {

            let dir;
            for (let i=newline.points.length-1; i>=1; i--) {
                let a = newline.points[i];
                let b = newline.points[i-1];
                let abdir = [a[0] - b[0], a[1] - b[1]];
                if (dir && abdir[0] == dir[0] && abdir[1] == dir[1]) {
                    newline.points[i-1] = [a[0], a[1]];
                    newline.points.splice(i, 1);
                } else {
                    dir = abdir;
                }
            }

        }
    }

    mousedown = false;
}