namespace App.Breakout {
	export const enum Color {
		Grey = 'grey',
		Orange = 'orange',
		Beige = 'beige',
		Green = 'green',
		Blue = 'blue',
		Violet = 'violet'
	}

	export class Block extends Phaser.Physics.Arcade.Sprite {
		stamina: number;
		color: Color | string;
		// We keep track of the number of Block instances to know if the player has won
		static COUNT: number = 0;

		constructor(
			scene: Phaser.Scene, 
			x: number, 
			y: number, 
			color: Color | string
		) {
			super(scene, x, y, 'sprites', color);
			this.stamina = App.Difficulty.BLOCK_STAMINA;
			this.color = color;
			this.scene.add.existing(this);
			this.scene.physics.add.existing(this, true);

			Block.COUNT += 1;
		}

		/**
		 * Decreases the block's stamina by 1. If the resulting stamina is 0, then
		 * the block is destroyed. This function returns however many points are scored
		 * by damaging the block.
		 */
		takeDamage(): number {
			let points = this.getScoreValue();
			this.stamina--;
			if (!this.stamina) {
				this.destroy();
				Block.COUNT -= 1;
				console.log(Block.COUNT);
				
			} else {
				this.setTexture('sprites', this.color + 'Cracked');
			}

			return points;
		}

		/**
		 * Calculates the score value of a block, which is based on its color.
		 */
		private getScoreValue(): number {
			let value: number = 0;
			switch (this.color) {
				case Color.Grey:
					value = 200;
					break;
				case Color.Orange:
					value = 150;
					break;
				case Color.Beige:
					value = 100;
					break;
				case Color.Green:
					value = 50;
					break;
				case Color.Blue:
					value = 20;
					break;
				case Color.Violet:
					value = 10;
					break;
			}

			return value / this.stamina;
		}
	}

	export class Ball extends Phaser.Physics.Arcade.Sprite {
		constructor(scene: Phaser.Scene) {
			super(scene, Phaser.Math.Between(150, 400), 200, 'sprites', 'ball');
			this.scene.add.existing(this);
			this.scene.physics.add.existing(this);
			if (this.x >= App.Config.SCREEN_WIDTH / 2) {
				this.setVelocity(-App.Difficulty.BALL_SPEED, App.Difficulty.BALL_SPEED);
			} else {
				this.setVelocity(App.Difficulty.BALL_SPEED, App.Difficulty.BALL_SPEED);
			}
		}
	}

	export class Paddle extends Phaser.Physics.Arcade.Sprite {
		constructor(scene: Phaser.Scene) {
			super(
				scene, 
				App.Config.SCREEN_WIDTH / 2, 
				App.Config.SCREEN_HEIGHT - 30, 
				'sprites', 
				'paddle'
			);
			this.scene.add.existing(this);
			this.scene.physics.add.existing(this);
		}
	}
}