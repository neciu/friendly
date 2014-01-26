function addTreasure(amountOfTreasure, size, newmap)
{
    for (var i = 0; i < amountOfTreasure; ++ i)
    {
        do
        {
            var startx = Math.floor(Math.random() * (size - 1) + 1); // 1 - size-1
            var starty = Math.floor(Math.random() * (size - 1) + 1);
        }
        while ((newmap[startx][starty] != 0) || (newmap[startx-1][starty] != 0) || (newmap[startx][starty-1] != 0) || (newmap[startx+1][starty] != 0) || (newmap[startx][starty+1] != 0));

        newmap[startx][starty] = 5;
    }
    return newmap;
};


doMap = function (size) {
    //0 - grass
    //1 - tree
    //2 - wall
    //3 - lake
    //4 - rock
    //5 - treasure
    var newmap = [
        []
    ];
    var x, y, i, j, startx, starty, length;
    for (x = 0; x < size; x++) {
        newmap[x] = [];
        for (y = 0; y < size; y++) {
            newmap[x][y] = 0;
        }
    }
    var seed = Math.floor(size / 8) + 1; // 1 per 8
    var amountOfWalls = Math.floor(Math.random() * (seed + 1) + (seed / 2)); // 1/2 seed - 3/2 seed
    var amountOfTrees = Math.floor((seed * 2) - amountOfWalls) + 1; //2 * seed - walls
    var amountOfLakes = 1;
    var amountOfRocks = Math.floor(Math.random() * (4 * seed + 1) + (2 * seed)); // 2seed - 4 seed;
    var amountOfTreasure = seed;
    //walls
    for (i = 0; i < amountOfWalls; i++) {
        if (i % 2 == 0) {
            do
            {
                startx = Math.floor(Math.random() * size);
                starty = Math.floor(Math.random() * (size - 3));
            }
            while (newmap[startx][starty] != 0);

            length = Math.floor(Math.random() * 6 + 3); // 3-7
            for (j = 0; j < length; j++) {
                if (startx + j > size - 1) break;
                newmap[startx + j][starty] = 2;
            }
        }
        else {
            do
            {
                startx = Math.floor(Math.random() * (size - 3));
                starty = Math.floor(Math.random() * size);
            }
            while (newmap[startx][starty] != 0);

            length = Math.floor(Math.random() * 6 + 3); // 3-7
            for (j = 0; j < length; j++) {
                if (starty + j > size - 1) break;
                newmap[startx][starty + j] = 2;
            }
        }
    }

    //trees
    for (i = 0; i < amountOfTrees; ++i) {
        do
        {
            startx = Math.floor(Math.random() * (size - 1));
            starty = Math.floor(Math.random() * (size - 1));
        }
        while ((newmap[startx][starty] != 0) && (newmap[startx + 1][starty] != 0) && (newmap[startx][starty + 1] != 0) && (newmap[startx + 1][starty + 1] != 0));

        newmap[startx][starty] = 1;
        newmap[startx + 1][starty] = 1;
        newmap[startx][starty + 1] = 1;
        newmap[startx + 1][starty + 1] = 1;
    }

    //rocks
    for (i = 0; i < amountOfRocks; ++i) {
        do
        {
            startx = Math.floor(Math.random() * size);
            starty = Math.floor(Math.random() * size);
        }
        while (newmap[startx][starty] != 0);

        newmap[startx][starty] = 4;
    }
    console.log(newmap);

    //treasure
    addTreasure (amountOfTreasure, size, newmap);

    //Math.floor(Math.random()*(max-min+1)+min);
    return newmap;
};


