window.onload = launch;
window.onbeforeunload = shutdown;

async function launch(): Promise<void> {
    // load configuration file
    let configJson: any;
    try {
        configJson = await App.Utils.loadJson('assets/config.json');
        App.Utils.loadValuesIntoObject(configJson, App.Config);
    } catch (err) {
        throw err;
    }

    App.game = new App.Game();
}

function shutdown() {
    App.save();
}

namespace App {
    export let game: Phaser.Game;
    export let highScore: number;
    let storage: Storage;

    function initHighScore() {
        if (storage.getItem('highScore')) {
            highScore = Number.parseInt(storage.getItem('highScore') as string);
        } else {
            highScore = 0;
            save();
        }
    }

    export function save() {
        storage.setItem('highScore', highScore.toString());
    }

    export class Game extends Phaser.Game {
        storage: Storage;

        constructor() {
            let config: Phaser.Types.Core.GameConfig = {
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

            this.scene.add('menu', Scenes.Menu);
            this.scene.add('main', Scenes.Main);
            this.scene.add('options', Scenes.Options);
            this.scene.add('game_over', Scenes.GameOver);

            storage = window.localStorage;
            initHighScore();

            this.scene.start('menu');
        }
    }

    export class Config {
        static readonly PARENT: string = 'game';
        static readonly SCREEN_WIDTH: number = 800;
        static readonly SCREEN_HEIGHT: number = 600;
        static readonly GRAVITY: number = 0;
        static readonly DEBUG: boolean = true;
    }

    export class Difficulty {
        static BALL_SPEED: number = 125;
        static PADDLE_SPEED: number = 150;
        static BLOCK_STAMINA: number = 2;
    }
}
