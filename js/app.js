var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
window.onload = launch;
window.onbeforeunload = shutdown;
function launch() {
    return __awaiter(this, void 0, void 0, function* () {
        let configJson;
        try {
            configJson = yield App.Utils.loadJson('assets/config.json');
            App.Utils.loadValuesIntoObject(configJson, App.Config);
        }
        catch (err) {
            throw err;
        }
        App.game = new App.Game();
    });
}
function shutdown() {
    App.save();
}
var App;
(function (App) {
    let storage;
    function initHighScore() {
        if (storage.getItem('highScore')) {
            App.highScore = Number.parseInt(storage.getItem('highScore'));
        }
        else {
            App.highScore = 0;
            save();
        }
    }
    function save() {
        storage.setItem('highScore', App.highScore.toString());
    }
    App.save = save;
    class Game extends Phaser.Game {
        constructor() {
            let config = {
                title: "Yet Another Breakout Clone",
                type: Phaser.AUTO,
                parent: Config.PARENT,
                scale: {
                    mode: Phaser.Scale.FIT,
                    autoCenter: Phaser.Scale.CENTER_BOTH
                },
                width: Config.SCREEN_WIDTH,
                height: Config.SCREEN_HEIGHT,
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { y: Config.GRAVITY },
                        debug: Config.DEBUG
                    }
                },
                render: {
                    antialias: false,
                    pixelArt: true
                },
                backgroundColor: '#111'
            };
            super(config);
            this.scene.add('menu', App.Scenes.Menu);
            this.scene.add('main', App.Scenes.Main);
            this.scene.add('options', App.Scenes.Options);
            this.scene.add('game_over', App.Scenes.GameOver);
            storage = window.localStorage;
            initHighScore();
            this.scene.start('menu');
        }
    }
    App.Game = Game;
    class Config {
    }
    Config.PARENT = 'game';
    Config.SCREEN_WIDTH = 800;
    Config.SCREEN_HEIGHT = 600;
    Config.GRAVITY = 0;
    Config.DEBUG = true;
    App.Config = Config;
    class Difficulty {
    }
    Difficulty.BALL_SPEED = 125;
    Difficulty.PADDLE_SPEED = 150;
    Difficulty.BLOCK_STAMINA = 2;
    App.Difficulty = Difficulty;
})(App || (App = {}));
var App;
(function (App) {
    var Breakout;
    (function (Breakout) {
        class Block extends Phaser.Physics.Arcade.Sprite {
            constructor(scene, x, y, color) {
                super(scene, x, y, 'sprites', color);
                this.stamina = App.Difficulty.BLOCK_STAMINA;
                this.color = color;
                this.scene.add.existing(this);
                this.scene.physics.add.existing(this, true);
                Block.COUNT += 1;
            }
            takeDamage() {
                let points = this.getScoreValue();
                this.stamina--;
                if (!this.stamina) {
                    this.destroy();
                    Block.COUNT -= 1;
                    console.log(Block.COUNT);
                }
                else {
                    this.setTexture('sprites', this.color + 'Cracked');
                }
                return points;
            }
            getScoreValue() {
                let value = 0;
                switch (this.color) {
                    case "grey":
                        value = 200;
                        break;
                    case "orange":
                        value = 150;
                        break;
                    case "beige":
                        value = 100;
                        break;
                    case "green":
                        value = 50;
                        break;
                    case "blue":
                        value = 20;
                        break;
                    case "violet":
                        value = 10;
                        break;
                }
                return value / this.stamina;
            }
        }
        Block.COUNT = 0;
        Breakout.Block = Block;
        class Ball extends Phaser.Physics.Arcade.Sprite {
            constructor(scene) {
                super(scene, Phaser.Math.Between(150, 400), 200, 'sprites', 'ball');
                this.scene.add.existing(this);
                this.scene.physics.add.existing(this);
                if (this.x >= App.Config.SCREEN_WIDTH / 2) {
                    this.setVelocity(-App.Difficulty.BALL_SPEED, App.Difficulty.BALL_SPEED);
                }
                else {
                    this.setVelocity(App.Difficulty.BALL_SPEED, App.Difficulty.BALL_SPEED);
                }
            }
        }
        Breakout.Ball = Ball;
        class Paddle extends Phaser.Physics.Arcade.Sprite {
            constructor(scene) {
                super(scene, App.Config.SCREEN_WIDTH / 2, App.Config.SCREEN_HEIGHT - 30, 'sprites', 'paddle');
                this.scene.add.existing(this);
                this.scene.physics.add.existing(this);
            }
        }
        Breakout.Paddle = Paddle;
    })(Breakout = App.Breakout || (App.Breakout = {}));
})(App || (App = {}));
var App;
(function (App) {
    var Scenes;
    (function (Scenes) {
        class BaseScene extends Phaser.Scene {
        }
        Scenes.BaseScene = BaseScene;
        class Main extends BaseScene {
            init(data) {
                this.score = data['score'];
                this.level = data['level'] || 1;
                App.Breakout.Block.COUNT = 0;
            }
            preload() {
                this.load.setBaseURL('assets/');
                this.load.atlas('sprites', 'sprites.png', 'sprite_atlas.json');
                this.controls = this.input.keyboard.createCursorKeys();
            }
            create(data) {
                this.score = 0;
                this.ball = new App.Breakout.Ball(this)
                    .setScale(2)
                    .setCollideWorldBounds(true)
                    .setBounce(1);
                this.generateBlocks();
                this.paddle = new App.Breakout.Paddle(this)
                    .setScale(3)
                    .setCollideWorldBounds(true);
                this.physics.add.collider(this.ball, this.paddle, this.handleBallPaddleCollision, undefined, this);
                this.scoreText = this.add.text(16, App.Config.SCREEN_HEIGHT - 22, `Score: ${this.score}`, {
                    fontFamily: 'VT323',
                    fontSize: '22px',
                    fill: '#FFF'
                });
                this.levelText = this.add.text(App.Config.SCREEN_WIDTH - 16, App.Config.SCREEN_HEIGHT - 22, `Level ${this.level}`, {
                    fontFamily: 'VT323',
                    fontSize: '22px',
                    fill: '#FFF'
                }).setOrigin(1, 0);
                this.physics.pause();
                this.time.delayedCall(1500, this.physics.resume, [], this.physics);
            }
            update(dt, data) {
                if (this.controls.left.isDown) {
                    this.paddle.setVelocityX(-App.Difficulty.PADDLE_SPEED);
                }
                else if (this.controls.right.isDown) {
                    this.paddle.setVelocityX(App.Difficulty.PADDLE_SPEED);
                }
                else {
                    this.paddle.setVelocityX(0);
                }
                if (App.Breakout.Block.COUNT <= 0) {
                    this.scene.start('main', {
                        score: this.score,
                        level: this.level + 1
                    });
                }
                if (this.ball.getBottomCenter().y >= App.Config.SCREEN_HEIGHT) {
                    this.physics.pause();
                    this.scene.start('game_over', { score: this.score });
                }
            }
            handleBallPaddleCollision() {
                this.ball.setVelocityY(-App.Difficulty.BALL_SPEED);
                this.paddle.setVelocityY(0);
                this.paddle.setY(App.Config.SCREEN_HEIGHT - 30);
            }
            generateBlocks() {
                let colors = ['grey', 'orange', 'beige', 'green', 'blue', 'violet'];
                for (let i = 0; i < colors.length; i++) {
                    for (let j = 0; j < 10; j++) {
                        let block = new App.Breakout.Block(this, j * 60 + 30, i * 20 + 10, colors[i]).setScale(4)
                            .refreshBody();
                        this.physics.add.collider(block, this.ball, this.damageBlock, undefined, this);
                    }
                }
            }
            damageBlock(block) {
                let score = block.takeDamage();
                this.score += score;
                this.scoreText.setText(`Score: ${this.score}`);
            }
        }
        Scenes.Main = Main;
        class Menu extends BaseScene {
            init(data) { }
            preload() {
                this.load.setBaseURL('assets/');
                this.load.atlas('sprites', 'sprites.png', 'sprite_atlas.json');
                this.load.json('menu_layout', 'main_menu_format.json');
            }
            create(data) {
                this.layout = this.cache.json.get('menu_layout');
                this.add.text(App.Config.SCREEN_WIDTH / 2, this.layout['title'], "YABC", {
                    fontFamily: 'VT323',
                    fontSize: '56px',
                    fill: '#FFF'
                }).setOrigin(0.5, 0.5);
                this.add.text(App.Config.SCREEN_WIDTH / 2, this.layout['subtitle'], "Yet Another Breakout Clone", {
                    fontFamily: 'VT323',
                    fontSize: '32px',
                    fill: '#FFF'
                }).setOrigin(0.5, 0.5);
                this.add.text(App.Config.SCREEN_WIDTH / 2, this.layout['highScore'], `Your High Score: ${App.highScore}`, {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    fill: '#FFF'
                }).setOrigin(0.5, 0.5);
                let newGameButton = new App.Ui.Button(this, App.Config.SCREEN_WIDTH / 2, this.layout['newGameButton'], 'New Game', 'blue').on('pointerup', () => this.scene.start('main', { score: 0, level: 1 }), this);
                let optionsButton = new App.Ui.Button(this, App.Config.SCREEN_WIDTH / 2, this.layout['optionsButton'], 'Options', 'beige').on('pointerup', () => this.scene.start('options'), this);
                this.add.text(10, App.Config.SCREEN_HEIGHT - 20, 'Copyright (c) 2019 Aidan T. Manning. MIT License.', {
                    fontFamily: 'VT323',
                    fontSize: '18px',
                    fill: '#FFF'
                });
                let githubButton = new App.Ui.TextButton(this, App.Config.SCREEN_WIDTH - 10, App.Config.SCREEN_HEIGHT - 20, 'Source Code').setOrigin(1, 0)
                    .setFontSize(18);
                githubButton.on('pointerup', () => window.open('https://github.com/periodicaidan/yabc', '_blank'), this);
            }
            update(dt, data) { }
        }
        Scenes.Menu = Menu;
        class GameOver extends BaseScene {
            init(data) {
                this.finalScore = data['score'] || 0;
                if (this.finalScore > App.highScore) {
                    App.highScore = this.finalScore;
                }
            }
            preload() { }
            create(data) {
                this.add.text(App.Config.SCREEN_WIDTH / 2, App.Config.SCREEN_HEIGHT / 2 - 100, 'Game Over', {
                    fontFamily: 'VT323',
                    fontSize: '48px',
                    fill: '#FFF'
                }).setOrigin(0.5, 0.5);
                this.add.text(App.Config.SCREEN_WIDTH / 2, App.Config.SCREEN_HEIGHT / 2 - 50, `Final Score: ${this.finalScore}`, {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    fill: '#FFF'
                }).setOrigin(0.5, 0.5);
                let playAgainButton = new App.Ui.Button(this, App.Config.SCREEN_WIDTH / 2, 220, 'Play Again', 'green').on('pointerup', () => this.scene.start('main', { score: 0, level: 1 }), this);
                let mainMenuButton = new App.Ui.Button(this, App.Config.SCREEN_WIDTH / 2, 300, 'Main Menu', 'orange').on('pointerup', () => this.scene.start('menu'), this);
            }
            update(dt, data) { }
        }
        Scenes.GameOver = GameOver;
        class Options extends BaseScene {
            init(data) { }
            preload() { }
            create(data) {
                this.add.text(App.Config.SCREEN_WIDTH / 2, 100, 'Difficulty Settings', {
                    fontFamily: 'VT323',
                    fontSize: '48px',
                    fill: '#FFF'
                }).setOrigin(0.5, 0.5);
                this.add.text(App.Config.SCREEN_WIDTH / 2 - 100, 150, 'Ball Speed', {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    fill: '#FFF'
                }).setOrigin(1, 0.5);
                let ballSpeedSlider = new App.Ui.Slider(this, App.Config.SCREEN_WIDTH / 2 - 20, 150, 200, 50, 300, App.Difficulty.BALL_SPEED);
                this.ballSpeed = ballSpeedSlider.currentValue;
                this.ballSpeedText = this.add.text(App.Config.SCREEN_WIDTH - 30, 150, this.ballSpeed.toFixed(0), {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    fill: '#FFF'
                }).setOrigin(1, 0.5);
                ballSpeedSlider.on('drag', () => this.ballSpeedText.setText(ballSpeedSlider.currentValue.toFixed()), this);
                ballSpeedSlider.on('drag', () => this.ballSpeed = ballSpeedSlider.currentValue, this);
                this.add.text(App.Config.SCREEN_WIDTH / 2 - 100, 200, 'Paddle Speed', {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    fill: '#FFF'
                }).setOrigin(1, 0.5);
                let paddleSpeedSlider = new App.Ui.Slider(this, App.Config.SCREEN_WIDTH / 2 - 20, 200, 200, 50, 300, App.Difficulty.PADDLE_SPEED);
                this.paddleSpeed = paddleSpeedSlider.currentValue;
                this.paddleSpeedText = this.add.text(App.Config.SCREEN_WIDTH - 30, 200, this.paddleSpeed.toFixed(0), {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    fill: '#FFF'
                }).setOrigin(1, 0.5);
                paddleSpeedSlider.on('drag', () => this.paddleSpeedText.setText(paddleSpeedSlider.currentValue.toFixed()), this);
                paddleSpeedSlider.on('dragend', () => this.paddleSpeed = paddleSpeedSlider.currentValue, this);
                this.add.text(App.Config.SCREEN_WIDTH / 2 - 100, 250, 'Block Stamina', {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    fill: '#FFF'
                }).setOrigin(1, 0.5);
                this.blockStamina = App.Difficulty.BLOCK_STAMINA;
                this.blockStaminaText = this.add.text(App.Config.SCREEN_WIDTH / 2 + 50, 250, `${this.blockStamina}`, {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    fill: '#FFF'
                }).setOrigin(0, 0.5);
                let plusButton = new App.Ui.TextButton(this, App.Config.SCREEN_WIDTH / 2 + 80, 250, '+');
                plusButton.on('pointerup', () => {
                    if (this.blockStamina < 2)
                        this.blockStamina++;
                    this.blockStaminaText.setText(`${this.blockStamina}`);
                });
                let minusButton = new App.Ui.TextButton(this, App.Config.SCREEN_WIDTH / 2 + 100, 250, '-');
                minusButton.on('pointerup', () => {
                    if (this.blockStamina > 1)
                        this.blockStamina--;
                    this.blockStaminaText.setText(`${this.blockStamina}`);
                });
                let saveButton = new App.Ui.Button(this, App.Config.SCREEN_WIDTH / 2 - 80, App.Config.SCREEN_HEIGHT - 50, 'Save', 'blue').on('pointerup', this.saveSettings, this);
                let cancelButton = new App.Ui.Button(this, App.Config.SCREEN_WIDTH / 2 + 80, App.Config.SCREEN_HEIGHT - 50, 'Cancel', 'grey').on('pointerup', () => this.scene.start('menu'), this);
            }
            update(dt, data) { }
            saveSettings() {
                App.Difficulty.BALL_SPEED = this.ballSpeed;
                App.Difficulty.PADDLE_SPEED = this.paddleSpeed;
                App.Difficulty.BLOCK_STAMINA = this.blockStamina;
                this.scene.start('menu');
            }
        }
        Scenes.Options = Options;
    })(Scenes = App.Scenes || (App.Scenes = {}));
})(App || (App = {}));
var App;
(function (App) {
    var Ui;
    (function (Ui) {
        class Button extends Phaser.GameObjects.Sprite {
            constructor(scene, x, y, text, color) {
                super(scene, x, y, 'sprites', color);
                this.color = color;
                this.scene.add.existing(this);
                this.setScale(10);
                this.text = this.scene.add.text(x, y, text, {
                    fontFamily: 'VT323',
                    fontSize: '32px',
                    fill: '#FFF',
                    stroke: '#000',
                    strokeThickness: 5
                }).setOrigin(0.5, 0.5);
                this.setInteractive();
                this.on('pointerdown', this.onDown, this);
                this.on('pointerup', this.onUp, this);
                this.on('pointerover', this.onHover, this);
                this.on('pointerout', this.onOut, this);
            }
            onDown() {
                this.setFrame(this.color + 'Cracked');
            }
            onUp() {
                this.setFrame(this.color);
            }
            onHover() {
                this.setTint(0x808080);
                this.text.setTint(0x808080);
            }
            onOut() {
                this.setTint(0xffffff);
                this.text.setTint(0xffffff);
                this.setFrame(this.color);
            }
        }
        Ui.Button = Button;
        class TextButton extends Phaser.GameObjects.Text {
            constructor(scene, x, y, text) {
                super(scene, x, y, text, {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    color: '#FFF'
                });
                this.setOrigin(0.5, 0.5);
                this.scene.add.existing(this);
                this.setInteractive();
                this.on('pointerover', this.onHover, this);
                this.on('pointerout', this.onOut, this);
                this.on('pointerdown', this.onDown, this);
                this.on('pointerup', this.onUp, this);
            }
            onHover() {
                this.setColor('#1188CC');
            }
            onOut() {
                this.setColor('#FFF');
            }
            onDown() {
                this.setColor('#808080');
            }
            onUp() {
                this.setColor('#1155AA');
            }
        }
        Ui.TextButton = TextButton;
        class Slider extends Phaser.GameObjects.Sprite {
            constructor(scene, x, y, length, min, max, initialValue) {
                let currentValue = initialValue || min;
                super(scene, x + (length * (currentValue - min) / (max - min)), y, 'sprites', 'ball');
                this.minX = x;
                this.maxX = x + length;
                this.maxValue = max;
                this.minValue = min;
                this.currentValue = currentValue;
                this.scene.add.line(0, 0, x, y, x + length, y, 0xffffff).setOrigin(0, 0);
                this.scene.add.existing(this);
                this.setScale(2);
                this.setInteractive({
                    draggable: true
                });
                this.on('dragstart', this.onDragStart, this);
                this.on('drag', this.onDrag, this);
                this.on('dragend', this.onDragEnd, this);
            }
            onDragStart(pointer, dragX, dragY) {
                this.setTint(0x808080);
            }
            onDrag(pointer, dragX, dragY) {
                if (dragX <= this.maxX && dragX >= this.minX) {
                    this.x = dragX;
                    this.currentValue = this.minValue + (this.maxValue - this.minValue) * (this.x - this.minX) / (this.maxX - this.minX);
                }
            }
            onDragEnd(pointer, dragX, dragY) {
                this.setTint(0xffffff);
            }
        }
        Ui.Slider = Slider;
    })(Ui = App.Ui || (App.Ui = {}));
})(App || (App = {}));
var App;
(function (App) {
    var Utils;
    (function (Utils) {
        function loadJson(fileName) {
            return __awaiter(this, void 0, void 0, function* () {
                return fetch(fileName, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => response.json(), err => new Error(`Error loading ${fileName}: ${err}`))
                    .catch(err => new Error(`Network error loading ${fileName}`));
            });
        }
        Utils.loadJson = loadJson;
        function loadValuesIntoObject(jsonData, targetObject) {
            for (let prop in jsonData) {
                targetObject[prop] = jsonData[prop];
            }
        }
        Utils.loadValuesIntoObject = loadValuesIntoObject;
    })(Utils = App.Utils || (App.Utils = {}));
})(App || (App = {}));
//# sourceMappingURL=app.js.map