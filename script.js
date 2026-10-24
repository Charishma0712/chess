const board=document.getElementById("board");
const gameState={
    a8: "black-rook",
    b8: "black-knight",
    c8: "black-bishop",
    f8: "black-bishop",
    d8: "black-queen",
    e8: "black-king",
    g8: "black-knight",
    h8: "black-rook",
    a7: "black-pawn",
    b7: "black-pawn",
    c7: "black-pawn",
    d7: "black-pawn",
    e7: "black-pawn",
    f7: "black-pawn",
    g7: "black-pawn",
    h7: "black-pawn",
    a1: "white-rook",
    b1: "white-knight",
    c1: "white-bishop",
    f1: "white-bishop",
    d1: "white-queen",
    e1: "white-king",
    g1: "white-knight",
    h1: "white-rook",
    a2: "white-pawn",
    b2: "white-pawn",
    c2: "white-pawn",
    d2: "white-pawn",
    e2: "white-pawn",
    f2: "white-pawn",
    g2: "white-pawn",
    h2: "white-pawn"
};

const pieceSymbols = {
    "black-king": "\u265A",
    "black-queen": "\u265B",
    "black-rook": "\u265C",
    "black-bishop": "\u265D",
    "black-knight": "\u265E",
    "black-pawn": "\u265F",
    "white-king": "\u2654",
    "white-queen": "\u2655",
    "white-rook": "\u2656",
    "white-bishop": "\u2657",
    "white-knight": "\u2658",
    "white-pawn": "\u2659"
};

const letter="abcdefgh";
for(let row=0;row<8;row++){
    for(let col=0;col<8;col++){
        const square=document.createElement("div");
        square.classList.add("square");
        const name=letter[col]+(8-row);
        square.id=name;
        const pieceName = gameState[name];
        if(pieceName){
            const piece = document.createElement("span");
            piece.classList.add("piece");
            if(pieceName.startsWith("black")){
                piece.classList.add("black-piece");
            } 
            else{
                piece.classList.add("white-piece");
            }
            piece.textContent = pieceSymbols[pieceName];
            square.appendChild(piece);
        }
        board.appendChild(square);
    }
}

let selectedPiece = null;
let currentTurn = "white";
const statusText = document.querySelector(".status-text");

board.addEventListener("click", (event) => {
    const square = event.target.closest(".square");
    if (!square) return;
    const piece = square.querySelector(".piece");
    if (!selectedPiece) {
        if (piece && gameState[square.id].startsWith(currentTurn)) {
            selectedPiece = piece;
            selectedPiece.classList.add("selected");
        }
        return;
    }
    // Deselect if the same piece is clicked again
    if (piece === selectedPiece) {
        selectedPiece.classList.remove("selected");
        selectedPiece = null;
        return;
    }
    // Select another piece of the same color
    if (piece && piece.classList.contains("white-piece") === selectedPiece.classList.contains("white-piece")) {
        selectedPiece.classList.remove("selected");
        selectedPiece = piece;
        selectedPiece.classList.add("selected");
        return;
    }
    // Reject illegal moves before changing the board.
    const fromPosition = selectedPiece.parentElement.id;
    const pieceName = gameState[fromPosition];
    if (!pieceName.startsWith(currentTurn) || !isLegalMove(fromPosition, square.id)) {
        return;
    }
    // Capture an opponent's piece, if present
    if(piece) {
        piece.remove();
    }
    // Move the selected piece
    delete gameState[fromPosition];
    gameState[square.id] = pieceName;
    square.appendChild(selectedPiece);
    selectedPiece.classList.remove("selected");
    selectedPiece = null;
    currentTurn = currentTurn === "white" ? "black" : "white";
    statusText.textContent = `${currentTurn === "white" ? "White" : "Black"} to move`;
});

// Movement rules for individual pieces. Check/checkmate and special moves
// (castling, en passant, and promotion) are not handled yet.
function getPosition(position) {
    if (typeof position !== "string" || !/^[a-h][1-8]$/.test(position)) {
        return null;
    }

    return {
        file: position.charCodeAt(0) - "a".charCodeAt(0),
        rank: Number(position[1])
    };
}

function isPathClear(from, to) {
    const fromPosition = getPosition(from);
    const toPosition = getPosition(to);
    if (!fromPosition || !toPosition) {
        return false;
    }

    const fileStep = Math.sign(toPosition.file - fromPosition.file);
    const rankStep = Math.sign(toPosition.rank - fromPosition.rank);
    let file = fromPosition.file + fileStep;
    let rank = fromPosition.rank + rankStep;

    while (file !== toPosition.file || rank !== toPosition.rank) {
        const position = `${String.fromCharCode(file + "a".charCodeAt(0))}${rank}`;
        if (gameState[position]) {
            return false;
        }
        file += fileStep;
        rank += rankStep;
    }

    return true;
}

function isLegalRookMove(from, to) {
    const start = getPosition(from);
    const end = getPosition(to);
    return Boolean(
        start &&
        end &&
        from !== to &&
        (start.file === end.file || start.rank === end.rank) &&
        isPathClear(from, to)
    );
}

function isLegalBishopMove(from, to) {
    const start = getPosition(from);
    const end = getPosition(to);
    return Boolean(
        start &&
        end &&
        from !== to &&
        Math.abs(start.file - end.file) === Math.abs(start.rank - end.rank) &&
        isPathClear(from, to)
    );
}

function isLegalQueenMove(from, to) {
    return isLegalRookMove(from, to) || isLegalBishopMove(from, to);
}

function isLegalKnightMove(from, to) {
    const start = getPosition(from);
    const end = getPosition(to);
    if (!start || !end) {
        return false;
    }

    const fileDistance = Math.abs(start.file - end.file);
    const rankDistance = Math.abs(start.rank - end.rank);
    return (fileDistance === 2 && rankDistance === 1) ||
        (fileDistance === 1 && rankDistance === 2);
}

function isLegalKingMove(from, to) {
    const start = getPosition(from);
    const end = getPosition(to);
    return Boolean(
        start &&
        end &&
        from !== to &&
        Math.abs(start.file - end.file) <= 1 &&
        Math.abs(start.rank - end.rank) <= 1
    );
}

function isLegalPawnMove(from, to) {
    const start = getPosition(from);
    const end = getPosition(to);
    const pawn = gameState[from];
    if (!start || !end || !pawn?.endsWith("-pawn")) {
        return false;
    }

    const color = pawn.startsWith("white") ? "white" : "black";
    const direction = color === "white" ? 1 : -1;
    const rankDistance = end.rank - start.rank;
    const fileDistance = Math.abs(end.file - start.file);
    const targetPiece = gameState[to];

    if (fileDistance === 0 && !targetPiece) {
        if (rankDistance === direction) {
            return true;
        }
        const startingRank = color === "white" ? 2 : 7;
        return start.rank === startingRank &&
            rankDistance === direction * 2 &&
            isPathClear(from, to);
    }

    return fileDistance === 1 &&
        rankDistance === direction &&
        Boolean(targetPiece) &&
        !targetPiece.startsWith(color);
}

function isLegalMove(from, to) {
    const piece = gameState[from];
    const start = getPosition(from);
    const end = getPosition(to);
    if (!piece || !start || !end || from === to) {
        return false;
    }

    const targetPiece = gameState[to];
    if (targetPiece && targetPiece.startsWith(piece.split("-")[0])) {
        return false;
    }

    switch (piece.split("-")[1]) {
        case "rook":
            return isLegalRookMove(from, to);
        case "bishop":
            return isLegalBishopMove(from, to);
        case "queen":
            return isLegalQueenMove(from, to);
        case "knight":
            return isLegalKnightMove(from, to);
        case "king":
            return isLegalKingMove(from, to);
        case "pawn":
            return isLegalPawnMove(from, to);
        default:
            return false;
    }
}
