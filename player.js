var player_point = [-1, -1];
var player_velocity = [0, 0];

var player_line;
var player_line_length;
var player_line_length_to_point;
var player_line_velocity = 0;
var player_segment_dir = 0;

var player_radius = 5;

var jump_windup = 0;
var max_jump_windup = 300;

var friction = .002;
var gravity = 1.5;

function draw_player() {
    let x = player_point[0];
    let y = player_point[1];

    context.strokeStyle = "black";

    context.beginPath();
    context.arc(x, y - jump_windup, player_radius, 0, Math.PI*2);
    context.stroke();

    context.beginPath();
    context.arc(x, y, player_radius, 0, Math.PI*2);
    context.fill();
}

document.addEventListener("visibilitychange", () => {
    WINDOW_HIDDEN = document.hidden;

    if (!WINDOW_HIDDEN) {
        _previous_time = new Date();
        draw();
    }
});

var _previous_time = new Date();
function update_player() {
    var now = new Date();
    var delta = now - _previous_time;

    //

    var prev_point = [player_point[0], player_point[1]];
    var new_point;

    if (keydown('jump')) {
        jump_windup = lerp(jump_windup, max_jump_windup, delta/1000);
    }

    if (keydown('down')) {
        player_line = null;
        player_point[1] += 2;
        player_velocity[0] = 1;
    }

    if (keyreleased('jump')) {
        player_line = null;
        player_velocity[1] -= Math.sqrt(gravity * jump_windup * 3000);
        jump_windup = 0;
    }

    if (keydown('left')) {
        player_velocity[0] -= delta;
    }
    if (keydown('right')) {
        player_velocity[0] += delta;
    }

    if (player_line) {
        if (keydown('left')) {
            player_line_velocity -= delta * player_segment_dir;
        }
        if (keydown('right')) {
            player_line_velocity += delta * player_segment_dir;
        }

        var length_to_point = player_line_length_to_point;
        var segment;
        var length = 0;

        for (let i=1; i<player_line.points.length; i++) {
            let a = player_line.points[i-1];
            let b = player_line.points[i];
            let distance = Math.sqrt(sqr_distance(a, b));

            if (length_to_point >= length && length_to_point <= length + distance) {
                segment = [a, b];
                break;
            }

            length += distance;
        }

        if (!segment) {
            segment = [player_line.points[0], player_line.points[1]];
        }

        context.strokeStyle = "red";
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(segment[0][0], segment[0][1]);
        context.lineTo(segment[1][0], segment[1][1]);
        context.stroke();
        context.lineWidth = 1;
        context.strokeStyle = "black";

        var a = segment[0];
        var b = segment[1];

        if (a[0] < b[0]) {
            player_segment_dir = 1;
        } else if (b[0] < a[0]) {
            player_segment_dir = -1;
        }

        var slope = (b[1] - a[1]) / (b[0] - a[0]) * player_segment_dir;

        if (slope == Infinity || slope == -Infinity) {
            slope = Math.sign(player_line_velocity) * 2;
        }

        if (player_line.mode == "normal") {
            player_line_velocity /= 1 + friction * delta;
            player_velocity[0] /= 1 + friction * delta;
        }

        player_line_velocity += slope * delta / 2;
        player_velocity[0] += slope * delta / 2 * player_segment_dir;

        player_line_length_to_point += player_line_velocity * delta / 1000;
        if (player_line_length_to_point < 0) {
            player_line_length_to_point = 0;
            player_line_velocity = 0;
            player_velocity[0] = 0;
        }
        if (player_line_length_to_point > player_line_length) {
            player_line_length_to_point = player_line_length;
            player_line_velocity = 0;
            player_velocity[0] = 0;
        }

        length_to_point = player_line_length_to_point;
        length = 0;
        rest_point;
        for (let i=1; i<player_line.points.length; i++) {
            let a = player_line.points[i-1];
            let b = player_line.points[i];
            let distance = Math.sqrt(sqr_distance(a, b));

            if (length_to_point >= length && length_to_point <= length + distance) {
                let t = (length_to_point - length) / distance;
                rest_point = [
                    lerp(a[0], b[0], t),
                    lerp(a[1], b[1], t)
                ];
                break;
            }

            length += distance;
        }

        if (rest_point) player_point = rest_point;
    } else {
        player_velocity[0] /= 1 + friction * delta;

        player_velocity[1] += gravity * delta;
        player_point[0] += player_velocity[0] * delta / 1000;
        player_point[1] += player_velocity[1] * delta / 1000;  
    }

    // collision

    if (player_point[1] < player_radius) {
        player_velocity[1] = -player_velocity[1] / 2;
        player_point[1] = player_radius;
    }
    if (player_point[1] > height - player_radius) {
        player_velocity[1] = -player_velocity[1] / 2;
        player_point[1] = height - player_radius;
    }
    if (player_point[0] < player_radius) {
        player_velocity[0] = -player_velocity[0] / 2;
        player_point[0] = player_radius;
    }
    if (player_point[0] > width - player_radius) {
        player_velocity[0] = -player_velocity[0] / 2;
        player_point[0] = width - player_radius;
    }

    new_point = [player_point[0], player_point[1]];

    if (player_velocity[1] > 0) {
        var intersections = [];
        var rest_point;
        var rest_line;

        for (let line of lines) {
            for (let i=1; i<line.points.length; i++) {
                let p1 = line.points[i-1];
                let p2 = line.points[i];
                let p = intersection(prev_point, new_point, p1, p2);
                if (p) intersections.push([p, line]);
            }
        }

        if (intersections.length == 1) {
            rest_point = intersections[0][0];
            rest_line = intersections[0][1];
        } else if (intersections.length > 1) {
            var d = [Math.sign(player_velocity[0]), Math.sign(player_velocity[1])];

            var closest_point;
            var closest_line;
            var closest_distance = Infinity;
            for (let data of intersections) {
                var point = data[0];
                var dx = point[0] - prev_point[0];
                var dy = point[1] - prev_point[1];
                if (Math.sign(dx) != d[0] || Math.sign(dy) != d[1]) continue;
                var distance = (dx * dx) + (dy * dy);
                if (distance < closest_distance) {
                    closest_point = data[0];
                    closest_line = data[1];
                    closest_distance = distance;
                }
            }

            rest_point = closest_point;
            rest_line = closest_line;
        }

        if (rest_point && rest_line) {
            player_point = [rest_point[0], rest_point[1]];
            player_velocity[1] = 0;
            player_line = rest_line;

            var line_length = 0;
            var length_to_point = 0;

            let p = rest_point;
            for (let i=1; i<player_line.points.length; i++) {
                let a = player_line.points[i-1];
                let b = player_line.points[i];
                
                if (
                    p[0] >= Math.min(a[0], b[0]) && p[0] <= Math.max(a[0], b[0]) && 
                    p[1] >= Math.min(a[1], b[1]) && p[1] <= Math.max(a[1], b[1])
                ) {
                    length_to_point = line_length;
                    length_to_point += Math.sqrt(sqr_distance(a, p));
                    if (a[0] < b[0]) {
                        player_segment_dir = 1;
                    } else if (b[0] < a[0]) {
                        player_segment_dir = -1;
                    }
                }

                line_length += Math.sqrt(sqr_distance(a, b));
            }

            player_line_length = line_length;
            player_line_length_to_point = length_to_point;
            player_line_velocity = (player_velocity[0] + player_velocity[1] * 100) * player_segment_dir;
        }
    }

    //

    for (let key in keysreleased) {
        keysreleased[key] = false;
    }

    _previous_time = now;
}

function lerp(a, b, t) {
    return a * (1 - t) + b * t;
}

function cross_product(a, b) {
    return a[0] * b[1] - a[1] * b[0];
}

function sqr_distance(a, b) {
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    return dx * dx + dy * dy;
}

function intersection(a, b, c, d) {
    var p = a;
    var q = c;
    var r = [b[0] - a[0], b[1] - a[1]];
    var s = [d[0] - c[0], d[1] - c[1]];

    var q_minus_p = [q[0] - p[0], q[1] - p[1]];

    var num = cross_product(q_minus_p, r);
    var denom = cross_product(r, s);
    
    var u = num / denom;
    var t = cross_product(q_minus_p, s) / denom;

    if (u < 0 || u > 1 || t < 0 || t > 1 || !t || !u) return null;

    return [
        p[0] + r[0] * t,
        p[1] + r[1] * t
    ];
}