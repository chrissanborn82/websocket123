const fs = require('fs');
var PNGReader = require('png.js');

fs.readFile('assets/fish.png', function (err, buffer) {
    var reader = new PNGReader(buffer);
    reader.parse(function (err, png) {
        if (err) throw err;
        console.log(png.getPixel(1, 0));
        let map = new Array(10).fill().map(() => new Array(10).fill(0));
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                console.log(i, j)
                map[i][j] = png.getPixel(i, j)[3] === 255
            }
        }
        console.log(map);
    });
});