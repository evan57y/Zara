const fs = require('fs-extra');
const path = require('path');

// ================= CONFIG =================
const cacheDir = path.join(__dirname, 'cache');

// difficulty sizes
const DIFFICULTY = {
    easy: 21,
    medium: 31,
    hard: 41
};

const LEVEL = 'medium'; // change: easy | medium | hard
const MAZE_ROWS = DIFFICULTY[LEVEL];
const MAZE_COLS = DIFFICULTY[LEVEL];

// fog vision (lower = harder)
const VISION = 3;

// ================= EMOJI MAP =================
const EMOJI_TO_DIR = {
    '⬆️': 'up',
    '⬇️': 'down',
    '⬅️': 'left',
    '➡️': 'right'
};

const DIR_TO_EMOJI = {
    up: '⬆️',
    down: '⬇️',
    left: '⬅️',
    right: '➡️'
};

// ================= UTIL =================
function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ================= MAZE GENERATION =================
function generateMaze() {
    const grid = Array(MAZE_ROWS).fill(0).map(() => Array(MAZE_COLS).fill(0));

    function carve(x, y) {
        grid[y][x] = 1;

        // slightly more winding maze
        const dirs = shuffle([
            [0, -2],
            [2, 0],
            [0, 2],
            [-2, 0],
            [0, -2]
        ]);

        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;

            if (
                nx > 0 &&
                nx < MAZE_COLS - 1 &&
                ny > 0 &&
                ny < MAZE_ROWS - 1 &&
                grid[ny][nx] === 0
            ) {
                grid[y + dy / 2][x + dx / 2] = 1;
                carve(nx, ny);
            }
        }
    }

    carve(1, 1);

    grid[1][0] = 1; // entrance
    grid[MAZE_ROWS - 2][MAZE_COLS - 1] = 2; // exit

    return grid;
}

// ================= RENDER UI =================
function renderMaze(grid, px, py, vision = VISION) {
    let output = "";

    for (let y = 0; y < MAZE_ROWS; y++) {
        let row = "";

        for (let x = 0; x < MAZE_COLS; x++) {
            const dist = Math.abs(px - x) + Math.abs(py - y);

            // fog of war
            if (dist > vision) {
                row += "⬛";
                continue;
            }

            if (x === px && y === py) {
                row += "🟢";
            } else if (grid[y][x] === 0) {
                row += "🟥";
            } else if (grid[y][x] === 2) {
                row += "🚪";
            } else {
                row += "⬜";
            }
        }

        output += row + "\n";
    }

    return output;
}

// ================= MOVE LOGIC =================
function attemptMove(grid, px, py, dir) {
    const moves = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0]
    };

    const delta = moves[dir];
    if (!delta) return null;

    const nx = px + delta[0];
    const ny = py + delta[1];

    if (nx < 0 || nx >= MAZE_COLS || ny < 0 || ny >= MAZE_ROWS) return null;
    if (grid[ny][nx] === 0) return null;

    return {
        nx,
        ny,
        isWin: grid[ny][nx] === 2
    };
}

// ================= VALID MOVES =================
function getMoveOptions(grid, px, py) {
    const dirs = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0]
    };

    const valid = [];

    for (const [dir, [dx, dy]] of Object.entries(dirs)) {
        const nx = px + dx;
        const ny = py + dy;

        if (
            nx >= 0 &&
            nx < MAZE_COLS &&
            ny >= 0 &&
            ny < MAZE_ROWS &&
            grid[ny][nx] !== 0
        ) {
            valid.push(DIR_TO_EMOJI[dir]);
        }
    }

    return valid;
}

// ================= STATE =================
async function saveState(uid, state) {
    const filePath = path.join(cacheDir, `maze_${uid}.json`);
    await fs.ensureDir(cacheDir);
    await fs.writeJSON(filePath, state, { spaces: 0 });
}

async function loadState(uid) {
    const filePath = path.join(cacheDir, `maze_${uid}.json`);
    if (!(await fs.pathExists(filePath))) return null;
    return fs.readJSON(filePath);
}

async function deleteState(uid) {
    const filePath = path.join(cacheDir, `maze_${uid}.json`);
    if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
    }
}

// ================= START GAME =================
async function startGame(uid) {
    const grid = generateMaze();

    const state = {
        grid,
        playerX: 0,
        playerY: 1,
        steps: 0
    };

    await saveState(uid, state);

    const moves = getMoveOptions(grid, state.playerX, state.playerY);
    const mazeView = renderMaze(grid, state.playerX, state.playerY);

    console.log("🟢 New Maze started!");
    console.log(mazeView);
    console.log("Moves:", moves.join(" "));
}

// ================= HANDLE MOVE =================
async function handleMove(uid, emoji) {
    const direction = EMOJI_TO_DIR[emoji];
   
