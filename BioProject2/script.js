const canvas = document.getElementById('main-canvas');
const canvasContainer = document.getElementById('canvas-container');
canvas.width = 800;
canvas.height = 500;
const ctx = canvas.getContext('2d');
const fps = 25;
const tps = 25;
let count = 0;
let details = false;
let atmdiff = true;
let grounddiff = true;
let g = 0.1;
function startGame() {
    for (let i = 0; i < 250; i++) {
        gameElements.push(new Plankton(map));
    }
    for (let i = 0; i < 250; i++) {
        gameElements.push(new Decomposer(map));
    }
    for (let i = 0; i < 250; i++) {
        let newc = new Corpse(map, 2);
        gameElements.push(newc);
        corpses.push(newc);
    }
    //setInterval(renderCanvas,diff/fps);
    //setInterval(progressGame, diff/tps);
    renderCanvas();
}
let map = new Map(canvas.width, canvas.height);
let log = [];
const logText = document.getElementById('log');
let gameElements = [];
let plankton = [];
let corpses = [];
let decomposers = [];

let totalC = 0;
let OC = 0;
let IC = 0;
let diff = 250;
let respCo = 1;
let diffBoundary = 250; //this value controls diffusion with air and 'ground'
function renderCanvas() {
    ctx.clearRect(0, 0, 500, 500);
    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, 500, 500);
    map.sky.draw(ctx);
    for (let i = 0; i < map.zones.length; i++) {
        map.zones[i].draw(ctx);
        //if (details) {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px serif';
            ctx.fillText(Math.round(map.zones[i].carbon) + "", 20, map.zones[i].endY);
        ctx.fillText(Math.round(map.zones[i].oxygen) + "", map.width - 50, map.zones[i].endY);
        //}
    }
    map.ground.draw(ctx);
    if (details) {
        ctx.fillStyle = 'black';
        ctx.fillText(map.sky.carbon, 20, 50);

        ctx.fillStyle = 'black';
        ctx.fillText(map.sky.oxygen, 320, 50);

        ctx.fillStyle = 'white';
        ctx.fillText(map.ground.carbon, 20, 500);

        ctx.fillStyle = 'white';
        ctx.fillText(map.ground.oxygen, 320, 500);
    }
    for (let i = 0; i < gameElements.length; i++) {
        gameElements[i].draw(ctx);
    }
    progressGame();
    requestAnimationFrame(renderCanvas);
}

function controlVars() {
    let c = 0;
    let oc = 0;
    let ic = 0;
    for (let i = 0; i < map.zones.length; i++) {
        c += map.zones[i].carbon;
        ic += map.zones[i].carbon;
    }
    c += map.ground.carbon;
    ic += map.ground.carbon;
    c += map.sky.carbon;
    ic += map.sky.carbon;
    for (let i = 0; i < gameElements.length; i++) {
        c += gameElements[i].size;
        oc += gameElements[i].size;
    }
    totalC = c;
    OC = oc;
    IC = ic;
}

function updateText() {
    if (details) {
        ctx.font = 'bold 24px serif';
        ctx.fillStyle = "white";
        ctx.fillText("C: " + Math.round(10 * totalC) / 10, 200, 450);
    }
    ctx.font = 'bold 24px serif';
    if (details) {
    ctx.fillStyle = "white";
    ctx.fillText("IC: " + Math.round(IC/totalC * 100), 200, 400);

    ctx.fillStyle = "white";
    ctx.fillText("OC: " + Math.round(OC/totalC * 100), 200, 350);
    }
}
function handleDiffusion() {
    document.getElementById('diff').innerText = diff + "";
    document.getElementById('atmdiff').innerText = atmdiff + "";
    document.getElementById('grounddiff').innerText = grounddiff + "";
    document.getElementById('diffBoundary').innerText = diffBoundary + "";
    document.getElementById('respCo').innerText = respCo + "";
    document.getElementById('aCO2').innerText = map.sky.carbon + "";
    document.getElementById('aO2').innerText = map.sky.oxygen + "";
    document.getElementById('gCO2').innerText = map.ground.carbon + "";
    document.getElementById('gO2').innerText = map.ground.oxygen + "";
    //passive C diffusion through layers
    if (diff < 25) {
        diff = 25;
    }
    for (let i = 1; i < map.zones.length; i++) {
        let delta = Math.pow(map.zones[i].carbon/diff - map.zones[i-1].carbon/diff, 2);
        if (map.zones[i-1].carbon > map.zones[i].carbon) {
            map.zones[i-1].carbon -= delta;
            map.zones[i].carbon += delta;
        } else {
            map.zones[i-1].carbon += delta;
            map.zones[i].carbon -= delta;
        }
    }
    if (!atmdiff) {

    } else {
        let delta = Math.pow(map.sky.carbon / diff - map.zones[0].carbon / diff, 2);
        if (map.sky.carbon > map.zones[0].carbon) {
            map.zones[0].carbon += delta;
        } else {
            map.zones[0].carbon -= delta;
        }
        delta = Math.pow(map.sky.oxygen / diff - map.zones[0].oxygen / diff, 2);
        if (map.sky.oxygen > map.zones[0].oxygen) {
            map.zones[0].oxygen += delta;
        } else {
            map.zones[0].oxygen -= delta;
        }
    }

    //passive O diffusion through layers
    if (diff < 25) {
        diff = 25;
    }
    for (let i = 1; i < map.zones.length; i++) {
        let delta = Math.pow(map.zones[i].oxygen/diff - map.zones[i-1].oxygen/diff, 2);
        if (map.zones[i-1].oxygen > map.zones[i].oxygen) {
            map.zones[i-1].oxygen -= delta;
            map.zones[i].oxygen += delta;
        } else {
            map.zones[i-1].oxygen += delta;
            map.zones[i].oxygen -= delta;
        }
    }

    //GROUND DIFFUSSION WITH BOTTOM LAYER (o2 and co2 replenishment, depletion;
    if (grounddiff) {
        delta = Math.pow(map.ground.oxygen / diffBoundary - map.zones[map.zones.length - 1].oxygen / diffBoundary, 2);
        if (map.ground.oxygen > map.zones[map.zones.length - 1].oxygen) {
            map.zones[map.zones.length - 1].oxygen += delta;
        } else {
            map.zones[map.zones.length - 1].oxygen -= delta;
        }

        delta = Math.pow(map.ground.carbon / diffBoundary - map.zones[map.zones.length - 1].carbon / diffBoundary, 2);
        if (map.ground.carbon > map.zones[map.zones.length - 1].carbon) {
            map.zones[map.zones.length - 1].carbon += delta;
        } else {
            map.zones[map.zones.length - 1].carbon -= delta;
        }
    }


}
function progressGame() {
    controlVars();
    handleDiffusion();

    for (let i = 0; i < gameElements.length; i++) {
        gameElements[i].update();

        if (gameElements[i].flagRemove) {
            gameElements.splice(i, 1);
            i--;
        }
    }
    for (let c = 0; c < corpses.length; c++) {
        if (corpses[c].flagRemove) {
            corpses.splice(c, 1);
            c--;
        }
    }
    for (let p = 0; p < plankton.length; p++) {
        if (plankton[p].flagRemove) {
            plankton[p].die();
            plankton.splice(p, 1);
            p--;
        }
    }
    for (let p = 0; p < decomposers.length; p++) {
        if (decomposers[p].flagRemove) {
            decomposers[p].die();
            decomposers.splice(p, 1);
            p--;
        }
    }
    count++;
    updateText();

}

function displayMessages() {
    let string = '';
    for (let i = 0; i < log.length; i++) {
        string = string.concat(log[i].getString() + '\n');
    }
    logText.innerText = string;
}

function addMessages() {
    if (count % 100 === 0) {

    }
}

startGame();

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2));
}
function floor(value, cap) {
    if (value < cap) {
        return cap;
    }
    return value;
}
function cap(value, cap) {
    if (value > cap) {
        return cap;
    }
    return value;
}
function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}