# Enhanced Multiplayer Tetris Game

Welcome to the **Enhanced Multiplayer Tetris Game**! This project is a modern take on the classic Tetris game, featuring multiplayer capabilities, improved visuals, and an expanded scoring system. Play solo or compete with others in real-time over the network.

## Table of Contents



- [Enhanced Multiplayer Tetris Game](#enhanced-multiplayer-tetris-game)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Demo](#demo)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Game](#running-the-game)
  - [How to Play](#how-to-play)
  - [Controls](#controls)
  - [Version](#version)

## Features

- **Multiplayer Support:** Play with friends over the network.
- **Unique Player IDs:** Each player is uniquely identified in the game.
- **Enhanced Graphics:** Improved UI with better colors and styles.
- **Expanded Scoring System:** Includes levels, lines cleared, and sophisticated scoring.
- **Game Over Handling:** Proper game over screens with restart functionality.
- **Optimized Networking:** Efficient data transfer between server and clients.
- **Real-time Updates:** Immediate reflection of game state across all players.

## Demo

*Note: As this is a local application, a live demo is not available. Follow the installation instructions to run the game on your machine.*

## Prerequisites

- **Node.js** (version 12 or higher)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Edge, etc.)

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/philipdenys/multiplayer-tetris.git
   cd multiplayer-tetris
2. Install Server Dependencies

```bash
npm install
```
## Running the Game
1. Start the Server

```bash

node server.js
```
The server will start and listen on port 8080.

2. Open the Game in a Browser

Navigate to http://localhost:8080 in your web browser.

3. Play with Friends

- Open additional browser windows or tabs on the same machine, or
- Share your local IP address (e.g., http://192.168.1.5:8080) with friends on the same network.
## How to Play
- Objective: Fit falling tetrominoes together to complete horizontal lines. Completed lines will disappear, granting you points.
- Multiplayer Mode: See other players' game areas and compete for the highest score.
## Controls
- Left Arrow (←): Move piece left
- Right Arrow (→): Move piece right
- Down Arrow (↓): Soft drop (increase fall speed)
- Q: Rotate piece counterclockwise
- W: Rotate piece clockwise
- Restart Game: Click on the "Game Over" message when you lose to restart the game.
Gameplay Enhancements
Scoring System:

Single Line Clear: 100 points
Multiple Line Clears: Points increase exponentially (e.g., 200 for two lines, 400 for three lines)
Leveling Up: Every 10 lines cleared increases your level.
Increasing Difficulty: As your level increases, the pieces fall faster.
Visual Improvements:

Each tetromino is represented with vibrant colors.
Clean and modern UI design for an enhanced gaming experience.
Game Over Handling:

When you lose, a "Game Over" message appears.
Click on the message to restart the game.
Project Structure
```graphql
Copy code
multiplayer-tetris/
├── server.js         # Server-side code using Express and WebSocket
├── package.json      # Project metadata and dependencies
├── public/           # Static files served by Express
    ├── index.html    # Main HTML file
    ├── client.js     # Client-side JavaScript code
    └── style.css     # Optional external CSS styles
```
Contributing
Contributions are welcome! Please follow these steps:

1. Fork the Repository

2. Create a New Branch

```bash
git checkout -b feature/your-feature-name
```
3. Commit Your Changes

```bash
git commit -m "Add your message"
```
4. Push to the Branch

```bash
git push origin feature/your-feature-name
```
5. Open a Pull Request

## Version
v1.0.0 Tetris games create with CHATgpt AI
- working and ready for enhancements
- ...

chatgpt reference:
https://chatgpt.com/c/66ed3346-094c-8000-8dc7-6d5ceead977f

License
This project is licensed under the MIT License. See the LICENSE file for details.

Acknowledgments
Tetris® is a registered trademark of Tetris Holding.
Inspired by the classic game developed by Alexey Pajitnov.
Thanks to the open-source community for various tutorials and resources.
Enjoy the game! If you encounter any issues or have suggestions, feel free to open an issue on the repository.