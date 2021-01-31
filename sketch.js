var canvas;
let xoff = [];
let yoff = [];
let color_scheme = []; // 0: input, 1: target, 2: text, 3: background
var scribble = new Scribble(); // global mode
scribble.bowing = 1.0;
scribble.roughness = 1.5;

function setup() {
    let canvas_width = parseInt(document.getElementById('canvas').clientWidth);
    canvas = createCanvas(canvas_width, canvas_width * (9 / 16));
    canvas.parent('#canvas');
    //console.log(width);
    select('#area').input(inputArea);
    select('#unit').changed(changedUnit);
    select('#target').changed(changedTarget);
    select('#area_custom').input(changedTarget);
    select('#name_input').input(update);
    select('#name_custom').input(update);
    select('#color_scheme').changed(changedColorScheme);

    select('#button_download').mouseClicked(download);
    textAlign(CENTER, TOP);
    textSize(32);
    frameRate(3);

    xoff[0] = random(1000);
    xoff[1] = random(1000);
    yoff[0] = random(1000);
    yoff[1] = random(1000);

    document.getElementById('area_custom').value = document.getElementById('target').value;
    var str = document.getElementById('color_scheme').value;
    str = str.replace(/ /g, ''); // 空白の除去
    color_scheme = str.split(',');
}

function download() {
    save('generated_image.png');
}

function windowResized() {
    let w = document.getElementById('canvas').clientWidth;
    resizeCanvas(w, w * (9 / 16));
}


function draw() {
    background(color_scheme[3]);
    let area_input = parseFloat(document.getElementById('area').value);
    let area_target = parseFloat(document.getElementById('target').value);
    if (area_target < 0.0) {
        area_target = parseFloat(document.getElementById('area_custom').value);
    }
    let w = document.getElementById('canvas').clientWidth;
    let h = document.getElementById('canvas').clientHeight;

    xoff[0] = xoff[0] + 0.01;
    yoff[0] = yoff[0] + 0.01;
    let data_input = {
        x: w * (1.0 / 4.0) + 10 * noise(xoff[0]) - 5,
        y: h * 0.5 + 10 * noise(yoff[0]) - 5
    };
    xoff[1] = xoff[1] + 0.01;
    yoff[1] = yoff[1] + 0.01;
    let data_target = {
        x: w * (3.0 / 4.0) + 10 * noise(xoff[1]) - 5,
        y: h * 0.5 + 10 * noise(yoff[1]) - 5
    }

    if (!isNaN(area_input) && area_input > 0.0) {

        if (area_input <= area_target) {
            data_target.r = map(area_target, 0.0, area_target, 1.0, 0.8 * h);
            data_input.r = sqrt(area_input / area_target) * data_target.r;

        } else {
            data_input.r = map(area_input, 0.0, area_input, 1.0, 0.8 * h);
            data_target.r = sqrt(area_target / area_input) * data_input.r;
        }

        // draw input area
        stroke(color_scheme[0]);
        scribble.scribbleRect(data_input.x, data_input.y, data_input.r, data_input.r);
        scribble.scribbleFilling(
            [data_input.x - data_input.r / 2, data_input.x + data_input.r / 2, data_input.x + data_input.r / 2, data_input.x - data_input.r / 2], [data_input.y - data_input.r / 2, data_input.y - data_input.r / 2, data_input.y + data_input.r / 2, data_input.y + data_input.r / 2],
            10.45, 300
        );

        // draw target area
        stroke(color_scheme[1]);
        scribble.scribbleRect(data_target.x, data_target.y, data_target.r, data_target.r);
        scribble.scribbleFilling(
            [data_target.x - data_target.r / 2, data_target.x + data_target.r / 2, data_target.x + data_target.r / 2, data_target.x - data_target.r / 2], [data_target.y - data_target.r / 2, data_target.y - data_target.r / 2, data_target.y + data_target.r / 2, data_target.y + data_target.r / 2],
            10.45, 300
        );

        noStroke();
        fill(color_scheme[2]);
        let label_input = document.getElementById('name_input').value;
        if (label_input == '') {
            label_input = "入力した面積";
        }
        text(label_input, data_input.x, data_input.y);

        //document.querySelector('target').options"
        let label_target = document.getElementById('target').options[document.getElementById('target').selectedIndex].text + "の面積";
        //        console.log(label_target);
        if (label_target == "カスタムの面積") {
            let label = document.getElementById('name_custom').value;
            if (label == '') {
                label = "カスタムの面積";
            }
            text(label, data_target.x, data_target.y);
        } else {
            text(label_target, data_target.x, data_target.y);
        }


    }
}

function update() {

    let area_target = document.getElementById('target').value;
    let area_input = document.getElementById('area').value;

    // 桁区切りカンマは削除する
    area_input = parseFloat(area_input.replace(/,/g, ''));
    area_target = parseFloat(area_target.replace(/,/g, ''));

    if (isNaN(area_input)) {
        document.getElementById('result').innerHTML = "ERROR: 数値を入力してください";
        document.getElementById('area').classList.add('is-invalid');
        return;
    } else {
        document.getElementById('area').classList.remove('is-invalid');
    }

    console.log(area_target);
    // Custom入力の場合
    if (area_target < 0.0) {
        area_target = document.getElementById('area_custom').value;
        area_target = parseFloat(area_target.replace(/,/g, ''));
    } else {
        // 比較対象面積のDOMを更新
        document.getElementById('area_custom').value = area_target;
    }

    let result = calcHowMany(area_input, area_target);

    // shows Display-1
    document.getElementById('result').innerHTML = nfc(result, 0) + "個分です";

    // shows lead text under the Display-1
    let label = document.getElementById('target').options[document.getElementById('target').selectedIndex].text;
    console.log(label);
    if (label == "カスタム") {
        label = document.getElementById('name_custom').value;
        if (label == '') {
            label = "カスタム面積";
        }

    }
    let name_input = document.getElementById('name_input').value;
    if (name_input == '') {
        name_input = '入力された面積';
    }
    document.getElementById('result_detailed').innerHTML = "（" +
        name_input + 'は' + label + result + "個分です）";
}

function calcHowMany(area_input, area_target) {
    //最初に入力された値を 平米（m^2）に計算する
    let unit = parseFloat(document.getElementById('unit').value);
    area_input = area_input * unit;

    //    console.log(area_input, area_target);
    // 東京ドーム何個分かを計算
    let result = area_input / area_target;
    return result;
}

function inputArea() {
    update();
}

function changedUnit() {
    update();
}

function changedTarget() {
    let area_target = parseInt(document.getElementById('target').value);
    if (area_target < 0) {
        document.getElementById('area_custom').disabled = false;
        document.getElementById('name_custom').disabled = false;
    } else {
        document.getElementById('area_custom').disabled = true;
        document.getElementById('name_custom').disabled = true;
    }
    update();
}

function changedColorScheme() {
    var str = document.getElementById('color_scheme').value;
    str = str.replace(/ /g, ''); // 空白の除去
    color_scheme = str.split(',');
}