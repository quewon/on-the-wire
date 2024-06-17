var timer = document.getElementById("timer");

function update_timer() {
    // timer.textContent = ms_to_time(elapsed);
}

function ms_to_time(ms) {
    var s = Math.floor(ms/1000);

    var msec = ms % 1000;
    if (msec < 10) msec = "0"+msec;
    var sec = s % 60;
    if (sec < 10) sec = "0"+sec;
    var mins = Math.floor(s / 60);
    if (mins < 10) mins = "0"+mins;
    var hours = Math.floor(s / 3600);

    if (hours > 0) {
        return hours + ":" + mins + ":" + sec + "." + msec;
    } else {
        return mins + ":" + sec + "." + msec;
    }
}