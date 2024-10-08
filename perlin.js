// ==========================================================================
// Assignment 4
// ==========================================================================
//   This code is heavily based on noisejs/perlin.js
//   by josephg and flafla2's guide "Understandint PErlin Noise"
//   and is their copyright.
//   See https://github.com/josephg/noisejs/blob/master/perlin.js 
//   and https://flafla2.github.io/2014/08/09/perlinnoise.html
//
// (C)opyright:
//
// Creator: lbonn041 (Luc-Cyril Bonnet)
// Email:   lbonn041@uottawa.ca
// ==========================================================================

var seed_num = Math.random();
function dot2(x1, y1, x2, y2) {
    return x1 * x2 + y1 * y2;
};

var grad2 = [[1, 1], [-1, 1], [1, -1], [-1, -1],
[1, 0], [-1, 0], [1, 0], [-1, 0],
[0, 1], [0, -1], [0, 1], [0, -1]]

var p = [151, 160, 137, 91, 90, 15,
    131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
    190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
    77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
    102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
    135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
    5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
    223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
    129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
    251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
    49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
    138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];


var permutation = new Array(512);
var gradP = new Array(512);

//seeding function
//taken from github: josephg/noisejs
function seed(seed) {
    if (seed > 0 && seed < 1) {
        // Scale the seed out
        seed *= 65536;
    }

    seed = Math.floor(seed);
    if (seed < 256) {
        seed |= seed << 8;
    }

    for (var i = 0; i < 256; i++) {
        var v;
        if (i & 1) {
            v = p[i] ^ (seed & 255);
        } else {
            v = p[i] ^ ((seed >> 8) & 255);
        }

        permutation[i] = permutation[i + 256] = v;
        gradP[i] = gradP[i + 256] = grad2[v % 12];
    }
};

seed(seed_num);

function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function linearInterpolate(a, b, x) {
    return a+x*(b-a)
};

function perlin(x, y) {

    var X = Math.floor(x), Y = Math.floor(y);
    x = x - X; y = y - Y;
    X = X & 255; Y = Y & 255;
    var x_fade = fade(x);
    var y_fade = fade(y);

    var noise00 = dot2(gradP[X + permutation[Y]][0], gradP[X + permutation[Y]][1], x, y);
    var noise01 = dot2(gradP[X + permutation[Y + 1]][0], gradP[X + permutation[Y + 1]][1], x, y - 1);
    var noise10 = dot2(gradP[X + 1 + permutation[Y]][0], gradP[X + 1 + permutation[Y]][1], x - 1, y);
    var noise11 = dot2(gradP[X + 1 + permutation[Y + 1]][0], gradP[X + 1 + permutation[Y + 1]][1], x - 1, y - 1);

    

    var x_value = linearInterpolate(noise00, noise10, x_fade);
    var y_value = linearInterpolate(noise01, noise11, x_fade);

    return linearInterpolate(x_value, y_value, y_fade);
};