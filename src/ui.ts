namespace App.Ui {
	/**
	 * A button object that uses the block sprite
	 */
	export class Button extends Phaser.GameObjects.Sprite {
		color: App.Breakout.Color | string;
		text: Phaser.GameObjects.Text;

		constructor(
			scene: Phaser.Scene, 
			x: number, 
			y: number, 
			text: string, 
			color: App.Breakout.Color | string
		) {
			// Create the sprite and add it to the scene
			super(scene, x, y, 'sprites', color);
			this.color = color;
			this.scene.add.existing(this);
			this.setScale(10);

			// Add text to the scene over the button
			this.text = this.scene.add.text(x, y, text, {
				fontFamily: 'VT323',
				fontSize: '32px',
				fill: '#FFF',
				stroke: '#000',
				strokeThickness: 5
			}).setOrigin(0.5, 0.5);

			// Add button-y interactions
			this.setInteractive();
			this.on('pointerdown', this.onDown, this);
			this.on('pointerup', this.onUp, this);
			this.on('pointerover', this.onHover, this);
			this.on('pointerout', this.onOut, this);
		}

		private onDown() {
			// Use the "cracked" version of the sprite
			this.setFrame(this.color + 'Cracked');
		}

		private onUp() {
			this.setFrame(this.color);
		}

		private onHover() {
			this.setTint(0x808080);
			this.text.setTint(0x808080);
		}

		private onOut() {
			this.setTint(0xffffff);
			this.text.setTint(0xffffff);
			this.setFrame(this.color);
		}
	}

	export class TextButton extends Phaser.GameObjects.Text {
		constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
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

		private onHover() {
			this.setColor('#1188CC');
		}

		private onOut() {
			this.setColor('#FFF');
		}

		private onDown() {
			this.setColor('#808080');
		}

		private onUp() {
			this.setColor('#1155AA');
		}
	}

	export class Slider extends Phaser.GameObjects.Sprite {
		minValue: number;
		maxValue: number;
		minX: number;
		maxX: number;
		currentValue: number;
		
		constructor(
			scene: Phaser.Scene,
			x: number,
			y: number,
			length: number,
			min: number,
			max: number,
			initialValue?: number
		) {
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

		private onDragStart(pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
			this.setTint(0x808080);
		}

		private onDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
			if (dragX <= this.maxX && dragX >= this.minX) {
				this.x = dragX;
				this.currentValue = this.minValue + (this.maxValue - this.minValue) * (this.x - this.minX) / (this.maxX - this.minX)
			}
		}

		private onDragEnd(pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
			this.setTint(0xffffff);
		}
	}
}