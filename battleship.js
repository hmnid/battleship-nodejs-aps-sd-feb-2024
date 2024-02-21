const {Worker, isMainThread} = require('worker_threads');
const readline = require('readline-sync');
const gameController = require("./GameController/gameController.js");
const cliColor = require('cli-color');
const beep = require('beepbeep');
const position = require("./GameController/position.js");
const letters = require("./GameController/letters.js");
let telemetryWorker;

const PRINT_USER_SUCCESS = cliColor.green
const PRINT_USER_FAIL = cliColor.cyan
const PRINT_COMPUTER_SUCCESS = cliColor.yellow
const PRINT_COMPUTER_FAIL = cliColor.redBright

class Battleship {
    start() {
        telemetryWorker = new Worker("./TelemetryClient/telemetryClient.js");

        console.log("Starting...");
        telemetryWorker.postMessage({eventName: 'ApplicationStarted', properties: {Technology: 'Node.js'}});

        console.log(cliColor.magenta("                                     |__"));
        console.log(cliColor.magenta("                                     |\\/"));
        console.log(cliColor.magenta("                                     ---"));
        console.log(cliColor.magenta("                                     / | ["));
        console.log(cliColor.magenta("                              !      | |||"));
        console.log(cliColor.magenta("                            _/|     _/|-++'"));
        console.log(cliColor.magenta("                        +  +--|    |--|--|_ |-"));
        console.log(cliColor.magenta("                     { /|__|  |/\\__|  |--- |||__/"));
        console.log(cliColor.magenta("                    +---------------___[}-_===_.'____                 /\\"));
        console.log(cliColor.magenta("                ____`-' ||___-{]_| _[}-  |     |_[___\\==--            \\/   _"));
        console.log(cliColor.magenta(" __..._____--==/___]_|__|_____________________________[___\\==--____,------' .7"));
        console.log(cliColor.magenta("|                        Welcome to Battleship                         BB-61/"));
        console.log(cliColor.magenta(" \\_________________________________________________________________________|"));
        console.log();

        this.InitializeGame();
        this.StartGame();
    }

    StartGame() {
        console.log("                  __");
        console.log("                 /  \\");
        console.log("           .-.  |    |");
        console.log("   *    _.-'  \\  \\__/");
        console.log("    \\.-'       \\");
        console.log("   /          _/");
        console.log("  |      _  /");
        console.log("  |     /_\\'");
        console.log("   \\    \\_/");
        console.log("    \"\"\"\"");

        let count = 1

        do {
            console.log(' '.repeat(25) + 'ROUND' + count++)
            console.log();
            console.log("Player, it's your turn");
            console.log(cliColor.bgGreen("Enter coordinates for your shot :"));
            var position = Battleship.ParsePosition(readline.question());
            var isHit = gameController.CheckIsHit(this.enemyFleet, position);

            telemetryWorker.postMessage({
                eventName: 'Player_ShootPosition',
                properties: {Position: position.toString(), IsHit: isHit}
            });

            if (isHit) {
                beep();

                console.log(cliColor.red("                \\         .  ./"));
                console.log(cliColor.red("              \\      .:\";'.:..\"   /"));
                console.log(cliColor.red("                  (M^^.^~~:.'\")."));
                console.log(cliColor.red("            -   (/  .    . . \\ \\)  -"));
                console.log(cliColor.red("               ((| :. ~ ^  :. .|))"));
                console.log(cliColor.red("            -   (\\- |  \\ /  |  /)  -"));
                console.log(cliColor.red("                 -\\  \\     /  /-"));
                console.log(cliColor.red("                   \\  \\   /  /"));
            } else {
                console.log(cliColor.blue(`               ~~~~~~~~~~~~~~~~~~~~~`))
                console.log(cliColor.blue(`               ~~~~~~~~~~~~~~~~~~~~~`))
                console.log(cliColor.blue(`               ~~~~~~~~~~~~~~~~~~~~~`))
                console.log(cliColor.blue(`               ~~~~~~~~~~~~~~~~~~~~~`))
                console.log(cliColor.blue(`               ~~~~~~~~~~~~~~~~~~~~~`))
                console.log(cliColor.blue(`               ~~~~~~~~~~~~~~~~~~~~~`))
                console.log(cliColor.blue(`               ~~~~~~~~~~~~~~~~~~~~~`))
                console.log(cliColor.blue(`               ~~~~~~~~~~~~~~~~~~~~~`))
            }

            console.log(isHit ? PRINT_USER_SUCCESS("Yeah ! Nice hit !") : PRINT_USER_FAIL("Miss"));

            var computerPos = this.GetRandomPosition();
            var isHit = gameController.CheckIsHit(this.myFleet, computerPos);

            telemetryWorker.postMessage({
                eventName: 'Computer_ShootPosition',
                properties: {Position: computerPos.toString(), IsHit: isHit}
            });

            console.log();
            console.log(`Computer shot in ${computerPos.column}${computerPos.row} and ` + (isHit ? PRINT_COMPUTER_SUCCESS('has hit your ship !') : PRINT_COMPUTER_FAIL('miss')));
            if (isHit) {
                beep();

                console.log(cliColor.red("                \\         .  ./"));
                console.log(cliColor.red("              \\      .:\";'.:..\"   /"));
                console.log(cliColor.red("                  (M^^.^~~:.'\")."));
                console.log(cliColor.red("            -   (/  .    . . \\ \\)  -"));
                console.log(cliColor.red("               ((| :. ~ ^  :. .|))"));
                console.log(cliColor.red("            -   (\\- |  \\ /  |  /)  -"));
                console.log(cliColor.red("                 -\\  \\     /  /-"));
                console.log(cliColor.red("                   \\  \\   /  /"));
            } else {
                console.log(cliColor.blue(`               ~~~~~~~~~~~~~~~~~~~~~`))
                console.log(cliColor.blue(`               ~~~~~~~~~~~~~~~~~~~~~`))
                console.log(cliColor.blue(`               ~~~~~~~~~~~~~~~~~~~~~`))
                console.log(cliColor.blue(`               ~~~~~~~~~~~~~~~~~~~~~`))
                console.log(cliColor.blue(`               ~~~~~~~~~~~~~~~~~~~~~`))
                console.log(cliColor.blue(`               ~~~~~~~~~~~~~~~~~~~~~`))
                console.log(cliColor.blue(`               ~~~~~~~~~~~~~~~~~~~~~`))
                console.log(cliColor.blue(`               ~~~~~~~~~~~~~~~~~~~~~`))
            }

            console.log("----------------------------------------------")
        }
        while (true);
    }

    static ParsePosition(input) {
        var letter = letters.get(input.toUpperCase().substring(0, 1));
        var number = parseInt(input.substring(1, 2), 10);
        return new position(letter, number);
    }

    GetRandomPosition() {
        var rows = 8;
        var lines = 8;
        var rndColumn = Math.floor((Math.random() * lines));
        var letter = letters.get(rndColumn + 1);
        var number = Math.floor((Math.random() * rows));
        var result = new position(letter, number);
        return result;
    }

    InitializeGame() {
        this.InitializeMyFleet();
        this.InitializeEnemyFleet();
    }

    InitializeMyFleet() {
        this.myFleet = gameController.InitializeShips();

        console.log(cliColor.bgGreen("Please position your fleet (Game board size is from A to H and 1 to 8):"));

        this.myFleet.forEach(function (ship) {
            console.log();
            console.log(cliColor.bgGreen(`Please enter the positions for the ${ship.name} (size: ${ship.size})`));
            for (var i = 1; i < ship.size + 1; i++) {
                console.log(cliColor.bgGreen(`Enter position ${i} of ${ship.size} (i.e A3):`));
                const position = readline.question();
                telemetryWorker.postMessage({
                    eventName: 'Player_PlaceShipPosition',
                    properties: {Position: position, Ship: ship.name, PositionInShip: i}
                });
                ship.addPosition(Battleship.ParsePosition(position));
            }
        })
    }

    InitializeEnemyFleet() {
        this.enemyFleet = gameController.InitializeShips();

        const VARIANTS = [
            [
                [
                    ["B", 4],
                    ["B", 5],
                    ["B", 6],
                    ["B", 7],
                    ["B", 8],
                ],
                [
                    ["E", 6],
                    ["E", 7],
                    ["E", 8],
                    ["E", 9],
                ],
                [
                    ["A", 3],
                    ["B", 3],
                    ["C", 3],
                ],
                [
                    ["F", 8],
                    ["G", 8],
                    ["H", 8],
                ],
                [
                    ["C", 5],
                    ["C", 6],
                ],
            ],
            [
                [
                    ["C", 4],
                    ["C", 5],
                    ["C", 6],
                    ["C", 7],
                    ["C", 8],
                ],
                [
                    ["D", 6],
                    ["D", 7],
                    ["D", 8],
                    ["D", 9],
                ],
                [
                    ["A", 4],
                    ["B", 4],
                    ["C", 4],
                ],
                [
                    ["F", 1],
                    ["G", 1],
                    ["H", 1],
                ],
                [
                    ["E", 5],
                    ["E", 6],
                ],
            ],
            [
                [
                    ["B", 1],
                    ["C", 1],
                    ["D", 1],
                    ["E", 1],
                    ["F", 1],
                ],
                [
                    ["C", 3],
                    ["D", 3],
                    ["E", 3],
                    ["F", 3],
                ],
                [
                    ["D", 5],
                    ["E", 5],
                    ["F", 5],
                ],
                [
                    ["H", 4],
                    ["H", 5],
                    ["H", 6],
                ],
                [
                    ["A", 3],
                    ["A", 4],
                ],
            ],
            [
                [
                    ["A", 3],
                    ["A", 4],
                    ["A", 5],
                    ["A", 6],
                    ["A", 7],
                ],
                [
                    ["C", 5],
                    ["C", 6],
                    ["C", 7],
                    ["C", 8],
                ],
                [
                    ["F", 7],
                    ["G", 7],
                    ["H", 7],
                ],
                [
                    ["F", 1],
                    ["F", 2],
                    ["F", 3],
                ],
                [
                    ["C", 1],
                    ["D", 1],
                ],
            ],
            [
                [
                    ["F", 4],
                    ["F", 5],
                    ["F", 6],
                    ["F", 7],
                    ["F", 8],
                ],
                [
                    ["H", 1],
                    ["H", 2],
                    ["H", 3],
                    ["H", 4],
                ],
                [
                    ["B", 6],
                    ["B", 7],
                    ["B", 8],
                ],
                [
                    ["D", 2],
                    ["E", 2],
                    ["F", 2],
                ],
                [
                    ["A", 1],
                    ["B", 1],
                ],
            ],
            [
                [
                    ["C", 2],
                    ["C", 3],
                    ["C", 4],
                    ["C", 5],
                    ["C", 6],
                ],
                [
                    ["A", 5],
                    ["A", 6],
                    ["A", 7],
                    ["A", 8],
                ],
                [
                    ["H", 5],
                    ["H", 6],
                    ["H", 7],
                ],
                [
                    ["E", 3],
                    ["F", 3],
                    ["G", 3],
                ],
                [
                    ["E", 5],
                    ["E", 6],
                ],
            ]
        ];

        const random_variant_index = Math.floor(Math.random() * VARIANTS.length);
        const random_fleet = VARIANTS[random_variant_index];

        if (process.env.DEBUG_LOG) {
            console.debug("Enemy fleet: \n", JSON.stringify(random_fleet));
        }

        for (let i = 0; i < random_fleet.length; i++) {
            const ship = random_fleet[i];
            ship.forEach(([letter, number]) => {
                this.enemyFleet[i].addPosition(new position(letters[letter], number))
            })
        }
    }
}

module.exports = Battleship;