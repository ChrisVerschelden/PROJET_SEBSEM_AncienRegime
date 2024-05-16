function stupid_spacing(x) {return "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".repeat(x)};
function encase_in_p_w_left_margin(content, level, id) {
    return `<p id="${id}" style="margin: 0px;margin-left:${level*10}px"> ${content} </p>`
}
function encase_in_div_w_left_margin(content, level, id) {
    return `<div id="${id}" style="margin: 0px;margin-left:${level*10}px"> ${content} </div>`
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, 
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}