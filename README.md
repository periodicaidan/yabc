YABC
===
Yet Another Breakout Clone

## Context
This is a thing I made for a class.

## Program Architecture
This game is written in TypeScript with Phaser 3. The source files (the ones I actually wrote) are located in the `src` directory. The TypeScript has already been compiled and the output file is located in the `js` directory. The `lib` directory contains just the Phaser type declarations file. `assets` contains all static asset files (images, config files, etc.).

### Namespaces
I use namespaces over modules because the ES6 module system is stupid and vexing.

#### App
This is the top-level namespace. It sets up and exports the `Game` object, loads configuration files, and launches the game.

#### App.Scenes
Contains all the scene types of the game, and display and physics logic in general

#### App.Breakout
Custom game objects for Breakout (blocks, the paddle, and the ball)

#### App.Ui
Types for the user interface.

#### App.Utils
Miscellaneous functions.