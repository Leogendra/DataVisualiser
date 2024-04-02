function min(x, y) {
    return x < y ? x : y;
}

function max(x, y) {
    return x > y ? x : y;
}

function date_str_to_num(dateStr) {
    return (new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}