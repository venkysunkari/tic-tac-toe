

const XO = function(x=0,o=0) {
    this.x = x;
    this.o = o;
}

const state = {
    xIsBot: false,
    oIsBot: true
}
let t;

addEventListener("load", initGame);

function initGame() {
    createBoard();
    restartGame();
    if (window.PointerEvent) { /* decent browsers */     addEventListener('pointerdown', handleClick);    }    else if (window.TouchEvent) { /* mobile Safari */     addEventListener('touchstart', handleClick);    }    else { /* desktop Safari */     etouch.addEventListener('mousedown', handleClick);    }
    addEventListener('gesturestart', e => {         e.preventDefault();     });    addEventListener('touchmove', e => {         if(e.scale !== 1) {             e.preventDefault();         }     }, {passive: false});
}

function restartGame() {
    if(t) clearTimeout(t);
    switch(id("select").value) {
        case "pp":
        state.xIsBot = false;
        state.oIsBot = false;
        break;
        case "bb":
        state.xIsBot = true;
        state.oIsBot = true;
        break;
        case "bp":
        state.xIsBot = true;
        state.oIsBot = false;
        break;
        default:
        state.xIsBot = false;
        state.oIsBot = true;
    }
    state.board = new Array(9),
    state.rows = new Array(3).fill(0).map(e => new XO()),
    state.cols = new Array(3).fill(0).map(e => new XO()),
    state.axes = new Array(2).fill(0).map(e => new XO()),
    state.xIsNext = true,
    state.winner = undefined
    updateGame();
    if(isBotNext()) botPlay();
}

function createBoard() {
    let html = "";
    for(let i = 0; i < 9; i++) {
        html += "<div class='tile' id='" + i + "'></div>";
    }
    id("board").innerHTML = html;
}

function updateGame() {
    const tiles = cl("tile");
    for(let i = 0; i < 9; i++) {
        if(state.board[i]) {
            tiles[i].innerHTML = state.board[i];
        } else {
            tiles[i].innerHTML = "";
        }
    }
    id("status").innerHTML = "<b>" + (state.winner ? state.winner + " won!" : isEnd() ? "Tie!" : (state.xIsNext ? "x" : "o") + " is next!") + "</b>";
}

function handleClick(e) {
    if(isBotNext()) return;
    const elem = e.target;
    if(elem.classList.contains("tile")) {
        const tileId = elem.id;
        makeMove(tileId);
    }
}

function makeMove(i) {
    if(state.winner || isEnd() || state.board[i]) return;
    const you = state.xIsNext ? "x" : "o";
    const opponent = you == "x" ? "o" : "x";
    state.board[i] = you;
    state.rows[~~(i / 3)][you]++;
    state.cols[i % 3][you]++;
    if(i % 4 == 0) state.axes[0][you]++;
    if(i == 2 || i == 4 || i == 6) state.axes[1][you]++;
    state.winner = checkWinner();
    state.xIsNext = !state.xIsNext;
    updateGame();
    if(isBotNext()) botPlay();
}

function isBotNext() {
    return !state.winner && !isEnd() && ((state.xIsNext && state.xIsBot) || (!state.xIsNext && state.oIsBot));
}

function botPlayMinMax() {
    
}

function botPlay() {
    let best = -1;
    let val = 0;
    const you = state.xIsNext ? "x" : "o";
    const opponent = you == "x" ? "o" : "x";
    for(let i = 0; i < state.board.length; i++) {
        if(state.board[i]) continue;
        let curVal = 1;
        const curRow = state.rows[~~(i / 3)];
        const curCol = state.cols[(i % 3)];
        const axe0 = i % 4 == 0;
        const axe1 = (i == 2 || i == 4 || i == 6);
        
        if(curCol[you] == 2 || curRow[you] == 2 || (axe0 && state.axes[0][you] == 2) || (axe1 && state.axes[1][you] == 2)) {
            best = i;
            break;
        }
        if(curCol[opponent] == 2) curVal += 50;
        if(curRow[opponent] == 2) curVal += 50;
        if(axe0 && state.axes[0][opponent] == 2) curVal += 50;
        if(axe1 && state.axes[1][opponent] == 2) curVal += 50;
        if(curCol[you] == 1 && curCol[opponent] == 0) curVal += 10;
        if(curRow[you] == 1 && curRow[opponent] == 0) curVal += 10;
        if(axe0 && state.axes[0][you] == 1 && state.axes[0][opponent] == 0) curVal += 10;
        if(axe1 && state.axes[1][you] == 1 && state.axes[1][opponent] == 0) curVal += 10;
        if(curCol[opponent] == 1) curVal += 2;
        if(curRow[opponent] == 1) curVal += 2;
        if(axe0 && state.axes[0][opponent] == 1) curVal += 2;
        if(axe1 && state.axes[1][opponent] == 1) curVal += 2;
        if(i % 2 == 0) curVal += 1;
        if(i == 4) curVal += 1;
        
        if(curVal > val) {
            val = curVal;
            best = i;
        }
    }
    if(best != -1) {
        t = setTimeout(() => makeMove(best), 1000);
    }
}

function isEnd() {
    return state.board.filter(e => e).length == 9;
}

function checkWinner() {
    const lines = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];
    for(let i = 0; i < lines.length; i++) {
        const [a,b,c] = lines[i];
        if(state.board[a] && state.board[b] == state.board[a] && state.board[c] == state.board[a]) {
            return state.board[a];
        }
    }
    return undefined;
}
