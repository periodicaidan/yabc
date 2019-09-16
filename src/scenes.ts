namespace App.Scenes {
    export abstract class BaseScene extends Phaser.Scene {
        abstract init(data?: any): void;
        abstract preload(): void;
        abstract create(data?: any): void;
        abstract update(dt: number, data?: any): void;
    }

    /**
     * This is where the main game takes place
     */
    export class Main extends BaseScene {
        ball: App.Breakout.Ball;
        paddle: Phaser.Physics.Arcade.Sprite;
        controls: Phaser.Types.Input.Keyboard.CursorKeys;
        score: number;
        scoreText: Phaser.GameObjects.Text;
        level: number;
        levelText: Phaser.GameObjects.Text;

        init(data?: any): void { 
            this.score = data['score'];
            this.level = data['level'] || 1;
            App.Breakout.Block.COUNT = 0;
        }

        preload(): void {
            this.load.setBaseURL('assets/');
            this.load.atlas('sprites', 'sprites.png', 'sprite_atlas.json');
            this.controls = this.input.keyboard.createCursorKeys();
        }

        create(data?: any): void {
            this.score = 0;

            this.ball = new App.Breakout.Ball(this)
                .setScale(2)
                .setCollideWorldBounds(true)
                .setBounce(1);

            this.generateBlocks();

            this.paddle = new App.Breakout.Paddle(this)
                .setScale(3)
                .setCollideWorldBounds(true);

            this.physics.add.collider(
                this.ball,
                this.paddle,
                this.handleBallPaddleCollision,
                undefined,
                this
            );

            this.scoreText = this.add.text(
                16,
                App.Config.SCREEN_HEIGHT - 22,
                `Score: ${this.score}`,
                {
                    fontFamily: 'VT323',
                    fontSize: '22px',
                    fill: '#FFF'
                }
            );

            this.levelText = this.add.text(
                App.Config.SCREEN_WIDTH - 16,
                App.Config.SCREEN_HEIGHT - 22,
                `Level ${this.level}`,
                {
                    fontFamily: 'VT323',
                    fontSize: '22px',
                    fill: '#FFF'
                }
            ).setOrigin(1, 0);

            // Once the whole field is loaded, we pause the physics so the player has a
            // second to take it all in.
            this.physics.pause();
            this.time.delayedCall(1500, this.physics.resume, [], this.physics);
        }

        update(dt: number, data?: any): void {
            // Controls for the paddle: moves horizontally
            if ((this.controls.left as Phaser.Input.Keyboard.Key).isDown) {
                this.paddle.setVelocityX(-App.Difficulty.PADDLE_SPEED);
            } else if ((this.controls.right as Phaser.Input.Keyboard.Key).isDown) {
                this.paddle.setVelocityX(App.Difficulty.PADDLE_SPEED);
            } else {
                this.paddle.setVelocityX(0);
            }

            // If all the blocks are cleared, go on to the next "level"
            if (App.Breakout.Block.COUNT <= 0) {
                this.scene.start('main', {
                    score: this.score,
                    level: this.level + 1
                });
            }

            // If the ball hits the bottom of the screen, go to the game over screen
            if (this.ball.getBottomCenter().y >= App.Config.SCREEN_HEIGHT) {
                this.physics.pause();
                this.scene.start('game_over', { score: this.score });
            }
        }

        /**
         * The ball-paddle collision should be like a collision between the ball and
         * a static body; none of the balls momentum should be transferred to the
         * paddle. I don't know if there's a less hacky way of doing this but this is
         * the solution I came up with.
         */
        private handleBallPaddleCollision() {
            this.ball.setVelocityY(-App.Difficulty.BALL_SPEED);
            this.paddle.setVelocityY(0);
            this.paddle.setY(App.Config.SCREEN_HEIGHT - 30)
        }

        /**
         * Generates the blocks at the start of a game
         * 
         * Normally I don't like writing functions that are only ever called once
         * but this is just so disgusting that it ruined the readability of the
         * [create] function.
         */
        private generateBlocks() {
            let colors = ['grey', 'orange', 'beige', 'green', 'blue', 'violet'];
            for (let i = 0; i < colors.length; i++) {
                for (let j = 0; j < 10; j++) {
                    let block = new App.Breakout.Block(
                        this,
                        j * 60 + 30,
                        i * 20 + 10,
                        colors[i]
                    ).setScale(4)
                        .refreshBody();

                    this.physics.add.collider(block, this.ball, this.damageBlock, undefined, this);
                }
            }
        }

        /**
         * Collision handler for the ball and block
         * Decreases the block's stamina and increases score accordingly
         */
        private damageBlock(block: App.Breakout.Block) {
            let score = block.takeDamage();
            this.score += score;
            this.scoreText.setText(`Score: ${this.score}`);
        }
    }

    export class Menu extends BaseScene {
        layout: any;

        init(data?: any): void {}

        preload(): void {
            this.load.setBaseURL('assets/');
            this.load.atlas('sprites', 'sprites.png', 'sprite_atlas.json');
            this.load.json('menu_layout', 'main_menu_format.json');
        }

        create(data?: any): void {
            // Get information about the menu's layout
            this.layout = this.cache.json.get('menu_layout');

            // Title text
            this.add.text(
                App.Config.SCREEN_WIDTH / 2,
                this.layout['title'],
                "YABC",
                {
                    fontFamily: 'VT323',
                    fontSize: '56px',
                    fill: '#FFF'
                }
            ).setOrigin(0.5, 0.5);

            // Subtitle text
            this.add.text(
                App.Config.SCREEN_WIDTH / 2,
                this.layout['subtitle'],
                "Yet Another Breakout Clone",
                {
                    fontFamily: 'VT323',
                    fontSize: '32px',
                    fill: '#FFF'
                }
            ).setOrigin(0.5, 0.5);

            // Player's high score
            this.add.text(
                App.Config.SCREEN_WIDTH / 2,
                this.layout['highScore'],
                `Your High Score: ${App.highScore}`,
                {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    fill: '#FFF'
                }
            ).setOrigin(0.5, 0.5);

            // The button to start a new game
            let newGameButton = new App.Ui.Button(
                this,
                App.Config.SCREEN_WIDTH / 2,
                this.layout['newGameButton'],
                'New Game',
                'blue'
            ).on('pointerup', () => this.scene.start('main', {score: 0, level: 1}), this);

            // The button to open the options menu
            let optionsButton = new App.Ui.Button(
                this,
                App.Config.SCREEN_WIDTH / 2,
                this.layout['optionsButton'],
                'Options',
                'beige'
            ).on('pointerup', () => this.scene.start('options'), this);

            // Copyright notice
            this.add.text(
                10,
                App.Config.SCREEN_HEIGHT - 20,
                'Copyright (c) 2018 Aidan T. Manning. MIT License.',
                {
                    fontFamily: 'VT323',
                    fontSize: '18px',
                    fill: '#FFF'
                }
            );

            // Link to the source code
            let githubButton = new App.Ui.TextButton(
                this,
                App.Config.SCREEN_WIDTH - 10,
                App.Config.SCREEN_HEIGHT - 20,
                'Source Code'
            ).setOrigin(1, 0)
                .setFontSize(18);

            githubButton.on('pointerup', () => window.open('https://github.com/periodicaidan/yabc', '_blank'), this);
        }

        update(dt: number, data?: any): void {}
    }

    export class GameOver extends BaseScene {
        finalScore: number;

        init(data?: any): void {
            this.finalScore = data['score'] || 0;

            // If this is a new high score, set the high score
            if (this.finalScore > App.highScore) {
                App.highScore = this.finalScore;
            }
        }        

        preload(): void {}

        create(data?: any): void {
            // Big, fat, in-your-face "Game Over" message
            this.add.text(
                App.Config.SCREEN_WIDTH / 2,
                App.Config.SCREEN_HEIGHT / 2 - 100,
                'Game Over',
                {
                    fontFamily: 'VT323',
                    fontSize: '48px',
                    fill: '#FFF'
                }
            ).setOrigin(0.5, 0.5);

            // Final score for that round
            this.add.text(
                App.Config.SCREEN_WIDTH / 2,
                App.Config.SCREEN_HEIGHT / 2 - 50,
                `Final Score: ${this.finalScore}`,
                {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    fill: '#FFF'
                }
            ).setOrigin(0.5, 0.5);

            // Button to start a new game
            let playAgainButton = new App.Ui.Button(
                this, 
                App.Config.SCREEN_WIDTH / 2, 
                220, 
                'Play Again', 
                'green'
            ).on('pointerup', () => this.scene.start('main', {score: 0, level: 1}), this);

            // Button to return to the main menu
            let mainMenuButton = new App.Ui.Button(
                this, 
                App.Config.SCREEN_WIDTH / 2, 
                300, 
                'Main Menu', 
                'orange'
            ).on('pointerup', () => this.scene.start('menu'), this);
        }

        update(dt: number, data?: any): void {}
    }

    export class Options extends BaseScene {
        ballSpeed: number;
        ballSpeedText: Phaser.GameObjects.Text;
        paddleSpeed: number;
        paddleSpeedText: Phaser.GameObjects.Text;
        blockStamina: number;
        blockStaminaText: Phaser.GameObjects.Text;

        init(data?: any): void {}        
        
        preload(): void {}

        create(data?: any): void {
            this.add.text(
                App.Config.SCREEN_WIDTH / 2,
                100,
                'Difficulty Settings',
                {
                    fontFamily: 'VT323',
                    fontSize: '48px',
                    fill: '#FFF'
                }
            ).setOrigin(0.5, 0.5);

            // Ball Speed Slider
            this.add.text(
                App.Config.SCREEN_WIDTH / 2 - 100,
                150,
                'Ball Speed',
                {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    fill: '#FFF'
                }
            ).setOrigin(1, 0.5);

            let ballSpeedSlider = new App.Ui.Slider(
                this,
                App.Config.SCREEN_WIDTH / 2 - 20,
                150,
                200,
                50,
                300,
                App.Difficulty.BALL_SPEED
            );

            this.ballSpeed = ballSpeedSlider.currentValue;

            this.ballSpeedText = this.add.text(
                App.Config.SCREEN_WIDTH - 30,
                150,
                this.ballSpeed.toFixed(0),
                {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    fill: '#FFF'
                }
            ).setOrigin(1, 0.5);

            ballSpeedSlider.on(
                'drag', 
                () => this.ballSpeedText.setText(ballSpeedSlider.currentValue.toFixed()),
                this
            );

            ballSpeedSlider.on(
                'drag',
                () => this.ballSpeed = ballSpeedSlider.currentValue,
                this
            );

            // Paddle Speed Slider
            this.add.text(
                App.Config.SCREEN_WIDTH / 2 - 100,
                200,
                'Paddle Speed',
                {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    fill: '#FFF'
                }
            ).setOrigin(1, 0.5);

            let paddleSpeedSlider = new App.Ui.Slider(
                this,
                App.Config.SCREEN_WIDTH / 2 - 20,
                200,
                200,
                50,
                300,
                App.Difficulty.PADDLE_SPEED
            );

            this.paddleSpeed = paddleSpeedSlider.currentValue;

            this.paddleSpeedText = this.add.text(
                App.Config.SCREEN_WIDTH - 30,
                200,
                this.paddleSpeed.toFixed(0),
                {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    fill: '#FFF'
                }
            ).setOrigin(1, 0.5);

            paddleSpeedSlider.on(
                'drag',
                () => this.paddleSpeedText.setText(paddleSpeedSlider.currentValue.toFixed()),
                this
            );

            paddleSpeedSlider.on(
                'dragend',
                () => this.paddleSpeed = paddleSpeedSlider.currentValue,
                this
            );

            // Block stamina setting
            this.add.text(
                App.Config.SCREEN_WIDTH / 2 - 100,
                250,
                'Block Stamina',
                {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    fill: '#FFF'
                }
            ).setOrigin(1, 0.5);

            this.blockStamina = Difficulty.BLOCK_STAMINA;

            this.blockStaminaText = this.add.text(
                App.Config.SCREEN_WIDTH / 2 + 50,
                250,
                `${this.blockStamina}`,
                {
                    fontFamily: 'VT323',
                    fontSize: '24px',
                    fill: '#FFF'
                }
            ).setOrigin(0, 0.5);

            let plusButton = new App.Ui.TextButton(
                this,
                App.Config.SCREEN_WIDTH / 2 + 80,
                250,
                '+'
            );

            plusButton.on('pointerup', () => {
                if (this.blockStamina < 2) this.blockStamina++;
                this.blockStaminaText.setText(`${this.blockStamina}`);
            })

            let minusButton = new App.Ui.TextButton(
                this,
                App.Config.SCREEN_WIDTH / 2 + 100,
                250,
                '-'
            );

            minusButton.on('pointerup', () => {
                if (this.blockStamina > 1) this.blockStamina--;
                this.blockStaminaText.setText(`${this.blockStamina}`);
            })
            
            let saveButton = new App.Ui.Button(
                this,
                App.Config.SCREEN_WIDTH / 2 - 80,
                App.Config.SCREEN_HEIGHT - 50,
                'Save',
                'blue'
            ).on('pointerup', this.saveSettings, this);

            let cancelButton = new App.Ui.Button(
                this,
                App.Config.SCREEN_WIDTH / 2 + 80,
                App.Config.SCREEN_HEIGHT - 50,
                'Cancel',
                'grey'
            ).on('pointerup', () => this.scene.start('menu'), this);
        }

        update(dt: number, data?: any): void {}

        private saveSettings() {
            App.Difficulty.BALL_SPEED = this.ballSpeed;
            App.Difficulty.PADDLE_SPEED = this.paddleSpeed;
            App.Difficulty.BLOCK_STAMINA = this.blockStamina;
            this.scene.start('menu');
        }
    }
}
