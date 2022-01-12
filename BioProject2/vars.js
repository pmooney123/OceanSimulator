class element {
    constructor() {

    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
    update() {

    }
}
class Map {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.sky = new Zone(0, 50, "rgb(156,243,255)");
        this.zones = [];
        this.zones.push(new Zone(50, 100, "rgb(48,48,180)", 0.75));
        this.zones.push(new Zone(100, 180, "rgb(35,35,130)", 0.2));
        this.zones.push(new Zone(180, 275, "rgb(25,25,105)", 0.05));
        this.zones.push(new Zone(275, 380, "rgb(20,20,85)", 0.01));
        this.zones.push(new Zone(380, 450, "rgb(15,15,55)", 0));
        this.ground = new Zone(450, 500, "rgb(28,20,20)", 0);
        this.sky.carbon = 250;
        this.sky.oxygen = 1500;
        this.ground.oxygen = 1000;
        this.ground.carbon = 100;
    }
    getZone(y) {
        for (let i = 0; i < this.zones.length; i++) {
            if (this.zones[i].startY <= y && this.zones[i].endY >= y) {
                return this.zones[i];
            }
        }
        console.log('fuck')
    }
}
class Zone {
    constructor(startY, endY, color, light) {
        this.startY = startY;
        this.endY = endY;
        this.color = color;

        this.light = light;

        this.carbon = 200;
        this.oxygen = 200;
        this.nitrogen = 1;


    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(0, this.startY, map.width, (this.endY - this.startY));
    }
}
/*
class Organism {
    constructor(map) {
        this.type = "organism";
        this.x = getRandomInt(map.width);
        this.y = getRandomInt(map.height);
        this.size = 4;
        this.color = "white";

        this.gl = 10;
        this.genome = "";
        let alphabet = "ABC";
        for (let i = 0; i < this.gl; i++) {
            let rand = getRandomInt(alphabet.length);
            let newLetter = alphabet.substring(rand, rand + 1)
            this.genome = this.genome.concat(newLetter);
        }

        this.angle = Math.random() * 6.28;
        this.anglemax = 6.28;
        this.da = 6.28/5

    }
    setStats() {

    }
    mutate() {
        if (Math.random() < 10/100) {
            let alphabet = "ABC";
            let randg = getRandomInt(this.genome.length);
            let randl = getRandomInt(alphabet.length);
            let newLetter = alphabet.substring(randl, randl + 1)
            this.genome = setCharAt(this.genome, randg,newLetter);
        }
        this.setColor();
    }
    setColor() {

    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
    move() {

        this.x += (Math.random() * 1 - 0.5) * this.size;
        this.y += (Math.random() * 1 - 0.5) * this.size;

        this.angle += Math.random() * this.da - this.da / 2;
        this.x += this.size/3 * Math.cos(this.angle);
        this.y += this.size/3 * Math.sin(this.angle);

        this.x = cap(this.x, map.width);
        this.y = cap(this.y, 450);
        this.x = floor(this.x, 0);
        this.y = floor(this.y, 50);
    }
    incSize(num) {
        this.size += num;
        if (Math.random() < this.growMult) {
            this.size += num;
        }
        if (this.size > 8) {
            this.size = 8;
        }
    }
    dcrSize(num) {
        if (Math.random() < this.drugMult) {
            return;
        }
        this.size -= num;
        if (this.size <= 0) {
            this.size = 2;
            this.flagRemove = true;
        }
    }
    grow() {
        if (this.size <= 0) {
            this.flagRemove = true;
        }

    }
    update() {
        this.move();
        this.grow();
    }
}
*/
class Plankton {
    constructor(map) {
        this.type = "plankton";
        this.x = getRandomInt(map.width);
        this.y = getRandomInt(map.height);
        this.hasenergy = true;
        this.color = "green";

        this.angle = Math.random() * 6.28;
        this.anglemax = 6.28;
        this.da = 6.28/8;

        this.metabolismRate = 100;
        this.maxSize = 6;
        this.size = 2;
        //a size is 1 carbon, 1 light
        this.flagRemove = false;


    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
    move() {
        /*
        this.x += (Math.random() * 1 - 0.5) * this.size;
        this.y += (Math.random() * 1 - 0.5) * this.size;
         */
        this.angle += Math.random() * this.da - this.da / 2;
        while (this.angle > 6.28) {
            this.angle -= 6.28;
        }
        while (this.angle < 0) {
            this.angle += 6.28;
        }
        this.x += .3 * Math.cos(this.angle);
        this.y += .3 * Math.sin(this.angle);

        this.x = cap(this.x, map.width);
        this.y = cap(this.y, 450);
        this.x = floor(this.x, 0);
        this.y = floor(this.y, 50);
    }
    incSize(num) {
        if (map.getZone(this.y).carbon >= num) {
            map.getZone(this.y).carbon -= num;
            map.getZone(this.y).oxygen += num;
            this.size += num;
        }
    } //carbon sequestration through photosynthesis
    dcrSize(num) {
        if (map.getZone(this.y).oxygen < num) {
            this.die();
        } else {
            this.size -= num;
            map.getZone(this.y).carbon += num;
            map.getZone(this.y).oxygen -= num;
        }
        if (this.size <= 1) {
            this.die();
        }
    } //1 O2 + 1 C -> 1 CO2
    reproduce() {
        let newp = new Plankton(map);
        newp.x = this.x;
        newp.y = this.y;
        newp.size = 4;
        this.size -= 4;
        gameElements.push(newp)
    }
    photosynthesize() {
        if (count % 5 === 0) {
            if (Math.random() < map.getZone(this.y).light) {
                this.incSize(1); //remove co2, add one size, add one o2
            }
        }
    } //1 CO2 -> 1 O2 + 1 C
    metabolize() {
        if (count % Math.round(this.metabolismRate * respCo) === 0) {
            this.dcrSize(1); //remove one size, add one carbon, remove one o2
        } //metabolize
    }
    grow() {
        this.photosynthesize();
        this.metabolize();
        if (this.size >= 8) {
            this.reproduce();
        }

        if (this.size <= 0) {
            this.flagRemove = true;
        }
    }
    fall() {
        this.y += g;

        this.x = cap(this.x, map.width);
        this.y = cap(this.y, 450);
        this.x = floor(this.x, 0);
        this.y = floor(this.y, 50);
    }
    update() {
        if (this.hasenergy) {
            this.move();
        }
        this.fall();
        this.grow();
    }
    die() {
        if (this.flagRemove === false && this.size > 0) {
            let newc = new Corpse(map, this.size);
            this.size = 0;
            newc.x = this.x;
            newc.y = this.y;
            gameElements.push(newc);
            corpses.push(newc);
        }
        this.flagRemove = true;
    }
}
class Corpse {
    constructor(map, size) {
        this.type = "corpse";
        this.x = getRandomInt(map.width);
        this.y = getRandomInt(200) + 50;

        this.color = "brown";

        this.size = size;

        this.flagRemove = false;
        //a size is 1 carbon, 1 light


    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
    move() {
        this.y += 3 * g;
        this.x = cap(this.x, map.width);
        this.y = cap(this.y, 450);
        this.x = floor(this.x, 0);
        this.y = floor(this.y, 50);
    }
    update() {
        this.move();
        if (this.size <= 0) {
            this.flagRemove = true;
        }
    }
}
class Decomposer {
    constructor(map) {
        this.type = "decomposer";
        this.x = getRandomInt(map.width);
        this.y = getRandomInt(map.height);

        this.color = "orange";

        this.angle = Math.random() * 6.28;
        this.anglemax = 6.28;
        this.da = 6.28/8;
        this.metabolismRate = 50;
        this.offset = getRandomInt(this.metabolismRate);
        this.size = 2  ;
        this.flagRemove = false;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
    move() {
        /*
        this.x += (Math.random() * 1 - 0.5) * this.size;
        this.y += (Math.random() * 1 - 0.5) * this.size;
         */
        this.angle += Math.random() * this.da - this.da / 2;
        while (this.angle > 6.28) {
            this.angle -= 6.28;
        }
        while (this.angle < 0) {
            this.angle += 6.28;
        }
        this.x += .3 * Math.cos(this.angle);

        this.x = cap(this.x, map.width);
        this.y = cap(this.y, 450);
        this.x = floor(this.x, 0);
        this.y = floor(this.y, 50);
    }
    incSize(num) {
        if (map.getZone(this.y).carbon >= num) {
            map.getZone(this.y).carbon -= num;
            this.size += num;
        }
    } //carbon sequestration through photosynthesis
    dcrSize(num) {
        if (map.getZone(this.y).oxygen < num) {
            this.die();
        } else {
            this.size -= num;
            map.getZone(this.y).carbon += num;
            map.getZone(this.y).oxygen -= num;
        }
        if (this.size <= 1) {
            this.die();
        }
    } //1 O2 + 1 C -> 1 CO2
    reproduce() {
        this.metabolize();
        if (!this.flagRemove) {
            let newp = new Decomposer(map);
            newp.x = this.x;
            newp.y = this.y;
            newp.size = 3;
            this.size -= 3;
            gameElements.push(newp)
        }
    }
    photosynthesize() {
        if (count % 10 === 0) {
            for (let i = 0; i < corpses.length; i++) {
                if (corpses[i].size > 0) {
                    if (this.size * 2 > distance(this.x, this.y, corpses[i].x, corpses[i].y)
                        && !corpses[i].flagRemove) {

                        corpses[i].size--;
                        if (corpses[i].size <= 0) {
                            corpses[i].flagRemove = true;
                        }
                        this.size++;
                        break;

                    }
                }
            }
        }
    } //1 CO2 -> 1 O2 + 1 C
    metabolize() {

        if ((count+this.offset) % Math.round(this.metabolismRate * respCo) === 0) {
            this.dcrSize(1); //remove one size, add one carbon, remove one o2
        } //metabolize
    }
    grow() {
        this.photosynthesize();
        this.metabolize();
        if (this.size >= 6) {
            this.reproduce();
        }

        if (this.size <= 0) {
            this.flagRemove = true;
        }
    }
    fall() {
        this.y += g;

        this.x = cap(this.x, map.width);
        this.y = cap(this.y, 450);
        this.x = floor(this.x, 0);
        this.y = floor(this.y, 50);
    }
    update() {
        this.move();
        this.fall();
        this.grow();
    }
    die() {
        if (!this.flagRemove) {
            let newc = new Corpse(map, this.size);
            this.size = 0;
            newc.x = this.x;
            newc.y = this.y;
            gameElements.push(newc);
            corpses.push(newc);
        }
        this.flagRemove = true;
    }
}

class Food  {
    constructor(map) {
        this.type = "food";
        this.x = getRandomInt(map.width);
        this.y = getRandomInt(map.height);
        this.size = 2;
        this.color = "black";
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
    update() {

    }
}
class Bacteria {
    constructor(map) {
        this.type = "bacterium";
        this.x = getRandomInt(map.width);
        this.y = getRandomInt(map.height);
        this.size = 4;
        this.color = "white";
        this.gl = 10;
        this.genome = "";

        let alphabet = "ABC";
        for (let i = 0; i < this.gl; i++) {
            let rand = getRandomInt(alphabet.length);
            let newLetter = alphabet.substring(rand, rand + 1)
            this.genome = this.genome.concat(newLetter);
        }

        this.a = 0;
        this.b = 0;
        this.c = 0;
        this.red = 0;
        this.blue = 0;
        this.green = 0;
        this.setColor();

        this.angle = Math.random() * 6.28;
        this.anglemax = 6.28;
        this.da = 6.28/5
        this.speedMult=0;
        this.growMult=0;
        this.drugMult=0;
        this.setStats();
    }
    setStats() {
        this.speedMult = (this.a / this.genome.length)/2 + 0.5;
        this.growMult = (this.b / this.genome.length)/2;
        this.drugMult = (this.c / this.genome.length)*1.5;
        //.log("Genome: " + this.genome + " STATS: " + this.speedMult + " " + this.growMult + " " + this.drugMult);
    }
    mutate() {
        if (Math.random() < mutationChance/100) {
            let alphabet = "ABC";
            let randg = getRandomInt(this.genome.length);
            let randl = getRandomInt(alphabet.length);
            let newLetter = alphabet.substring(randl, randl + 1)
            this.genome = setCharAt(this.genome, randg,newLetter);
        }
        this.setColor();
    }
    setColor() {
        let numA = 0;
        let numB = 0;
        let numC = 0;

        for (let i = 0; i < this.genome.length; i++){
            if (this.genome[i] === "A") numA++;
            if (this.genome[i] === "B") numB++;
            if (this.genome[i] === "C") numC++;
        }

        this.red = (numA / this.genome.length) * 255;
        this.blue = (numB / this.genome.length) * 255;
        this.green = (numC / this.genome.length) * 255;

        this.a = numA;
        this.b = numB;
        this.c = numC;

        this.color = 'rgb(' + this.red + "," + this.blue + "," + this.green + ")";
    }
    draw(ctx) {
        if (this.size > 12) {
            this.size = 12;
        }
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
    move() {
        /*
        this.x += (Math.random() * 1 - 0.5) * this.size;
        this.y += (Math.random() * 1 - 0.5) * this.size;
         */
        this.angle += Math.random() * this.da - this.da / 2;
        this.x += this.size/3 * this.speedMult * Math.cos(this.angle);
        this.y += this.size/3 * this.speedMult * Math.sin(this.angle);

        this.x = cap(this.x, map.width);
        this.y = cap(this.y, map.height);
        this.x = floor(this.x, 0);
        this.y = floor(this.y, 0);
    }
    incSize(num) {
        this.size += num;
        if (Math.random() < this.growMult) {
            this.size += num;
        }
        if (this.size > 8) {
            this.size = 8;
        }
    }
    dcrSize(num) {
        if (Math.random() < this.drugMult) {
            return;
        }
        this.size -= num;
        if (this.size <= 0) {
            this.size = 2;
            this.flagRemove = true;
        }
    }
    grow() {
        if (count % 35 === 0 && Math.random() < 0.2) {
            this.size -= 2;
        }
        if (this.size <= 0) {
            this.flagRemove = true;
        }
        if (this.size >= 8) {
            this.flagRemove = true;
            addBacteria(this);
            addBacteria(this);
        }
    }
    update() {
        this.move();
        this.grow();
    }
}

