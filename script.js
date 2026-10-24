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
let lastMove = null;
const castlingRights = {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true
};

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

    let promotedPiece = null;
    const destinationRank = square.id[1];
    if (pieceName.endsWith("-pawn") && (destinationRank === "1" || destinationRank === "8")) {
        const choice = window.prompt("Promote pawn to queen, rook, bishop, or knight:", "queen");
        if (choice === null) {
            return;
        }
        const selectedPromotion = choice.trim().toLowerCase();
        if (!["queen", "rook", "bishop", "knight"].includes(selectedPromotion)) {
            statusText.textContent = "Choose queen, rook, bishop, or knight to promote.";
            return;
        }
        promotedPiece = `${currentTurn}-${selectedPromotion}`;
    }

    const toPosition = square.id;
    const isCastling = pieceName.endsWith("-king") &&
        Math.abs(fromPosition.charCodeAt(0) - toPosition.charCodeAt(0)) === 2;
    const isEnPassant = pieceName.endsWith("-pawn") &&
        fromPosition[0] !== toPosition[0] &&
        !gameState[toPosition];
    const capturedPosition = isEnPassant
        ? `${toPosition[0]}${fromPosition[1]}`
        : toPosition;
    const capturedPiece = gameState[capturedPosition];

    updateCastlingRights(fromPosition, pieceName, capturedPosition, capturedPiece);
    delete gameState[fromPosition];
    if (capturedPiece) {
        delete gameState[capturedPosition];
        document.getElementById(capturedPosition).querySelector(".piece")?.remove();
    }

    if (isCastling) {
        const rank = fromPosition[1];
        const kingSide = toPosition[0] > fromPosition[0];
        const rookFrom = `${kingSide ? "h" : "a"}${rank}`;
        const rookTo = `${kingSide ? "f" : "d"}${rank}`;
        const rook = document.getElementById(rookFrom).querySelector(".piece");
        gameState[rookTo] = gameState[rookFrom];
        delete gameState[rookFrom];
        document.getElementById(rookTo).appendChild(rook);
    }

    gameState[toPosition] = promotedPiece || pieceName;
    square.appendChild(selectedPiece);
    if (promotedPiece) {
        selectedPiece.textContent = pieceSymbols[promotedPiece];
    }
    selectedPiece.classList.remove("selected");
    selectedPiece = null;
    lastMove = { from: fromPosition, to: toPosition, piece: pieceName };
    currentTurn = currentTurn === "white" ? "black" : "white";
    statusText.textContent = `${currentTurn === "white" ? "White" : "Black"} to move`;
});

function updateCastlingRights(from, piece, capturedPosition, capturedPiece) {
    if (piece === "white-king") {
        castlingRights.whiteKingSide = false;
        castlingRights.whiteQueenSide = false;
    } else if (piece === "black-king") {
        castlingRights.blackKingSide = false;
        castlingRights.blackQueenSide = false;
    } else if (piece === "white-rook" && from === "h1") {
        castlingRights.whiteKingSide = false;
    } else if (piece === "white-rook" && from === "a1") {
        castlingRights.whiteQueenSide = false;
    } else if (piece === "black-rook" && from === "h8") {
        castlingRights.blackKingSide = false;
    } else if (piece === "black-rook" && from === "a8") {
        castlingRights.blackQueenSide = false;
    }

    if (capturedPiece === "white-rook" && capturedPosition === "h1") {
        castlingRights.whiteKingSide = false;
    } else if (capturedPiece === "white-rook" && capturedPosition === "a1") {
        castlingRights.whiteQueenSide = false;
    } else if (capturedPiece === "black-rook" && capturedPosition === "h8") {
        castlingRights.blackKingSide = false;
    } else if (capturedPiece === "black-rook" && capturedPosition === "a8") {
        castlingRights.blackQueenSide = false;
    }
}

// Movement rules for individual pieces and special moves. Check/checkmate
// handling is separate from move validation.
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

function isSquareAttacked(position, byColor) {
    const target = getPosition(position);
    if (!target) {
        return false;
    }

    return Object.entries(gameState).some(([from, piece]) => {
        if (!piece.startsWith(byColor)) {
            return false;
        }

        const start = getPosition(from);
        const fileDistance = Math.abs(start.file - target.file);
        const rankDistance = Math.abs(start.rank - target.rank);
        const pieceType = piece.split("-")[1];

        switch (pieceType) {
            case "pawn": {
                const direction = byColor === "white" ? 1 : -1;
                return fileDistance === 1 && target.rank - start.rank === direction;
            }
            case "knight":
                return (fileDistance === 2 && rankDistance === 1) ||
                    (fileDistance === 1 && rankDistance === 2);
            case "king":
                return fileDistance <= 1 && rankDistance <= 1;
            case "rook":
                return (start.file === target.file || start.rank === target.rank) &&
                    isPathClear(from, position);
            case "bishop":
                return fileDistance === rankDistance && fileDistance > 0 &&
                    isPathClear(from, position);
            case "queen":
                return (
                    start.file === target.file ||
                    start.rank === target.rank ||
                    (fileDistance === rankDistance && fileDistance > 0)
                ) && isPathClear(from, position);
            default:
                return false;
        }
    });
}

function isLegalCastle(from, to) {
    const king = gameState[from];
    const color = king?.split("-")[0];
    const rank = color === "white" ? "1" : "8";
    const opponent = color === "white" ? "black" : "white";
    const kingSide = to[0] === "g";
    const rookFrom = `${kingSide ? "h" : "a"}${rank}`;
    const rightsKey = `${color}${kingSide ? "KingSide" : "QueenSide"}`;
    const path = kingSide
        ? [`f${rank}`, `g${rank}`]
        : [`d${rank}`, `c${rank}`, `b${rank}`];
    const kingPath = kingSide ? [`f${rank}`, `g${rank}`] : [`d${rank}`, `c${rank}`];

    return king === `${color}-king` &&
        from === `e${rank}` &&
        to === `${kingSide ? "g" : "c"}${rank}` &&
        castlingRights[rightsKey] &&
        gameState[rookFrom] === `${color}-rook` &&
        path.every((position) => !gameState[position]) &&
        !isSquareAttacked(from, opponent) &&
        kingPath.every((position) => !isSquareAttacked(position, opponent));
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

    if (fileDistance !== 1 || rankDistance !== direction) {
        return false;
    }

    if (targetPiece) {
        return !targetPiece.startsWith(color);
    }

    const capturedPosition = `${to[0]}${from[1]}`;
    if (
        lastMove?.piece !== `${color === "white" ? "black" : "white"}-pawn` ||
        lastMove.to !== capturedPosition ||
        Math.abs(Number(lastMove.to[1]) - Number(lastMove.from[1])) !== 2 ||
        gameState[capturedPosition] !== lastMove.piece
    ) {
        return false;
    }

    delete gameState[from];
    delete gameState[capturedPosition];
    gameState[to] = pawn;
    const exposesKing = isKingInCheck(color);
    delete gameState[to];
    gameState[from] = pawn;
    gameState[capturedPosition] = lastMove.piece;
    return !exposesKing;
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
            return isLegalKingMove(from, to) ||
                (Math.abs(start.file - end.file) === 2 && isLegalCastle(from, to));
        case "pawn":
            return isLegalPawnMove(from, to);
        default:
            return false;
    }
}

function isKingInCheck(color) {
    const kingPosition = Object.keys(gameState).find(
        (position) => gameState[position] === `${color}-king`
    );

    if (!kingPosition) {
        return false;
    }

    const opponentColor = color === "white" ? "black" : "white";
    return Object.keys(gameState).some((position) => {
        const piece = gameState[position];
        return piece.startsWith(opponentColor) && isLegalMove(position, kingPosition);
    });
}

function isCheckmate(color) {
    if (!isKingInCheck(color)) {
        return false;
    }

    const kingPosition = Object.keys(gameState).find(
        (position) => gameState[position] === `${color}-king`
    );

    if (!kingPosition) {
        return false;
    }

    const kingMoves = [
        { file: 0, rank: 1 },
        { file: 1, rank: 1 },
        { file: 1, rank: 0 },
        { file: 1, rank: -1 },
        { file: 0, rank: -1 },
        { file: -1, rank: -1 },
        { file: -1, rank: 0 },
        { file: -1, rank: 1 }
    ];

    for (const move of kingMoves) {
        const newFile = String.fromCharCode(kingPosition.charCodeAt(0) + move.file);
        const newRank = Number(kingPosition[1]) + move.rank;
        const newPosition = `${newFile}${newRank}`;
        if (newFile >= 'a' && newFile <= 'h' && newRank >= 1 && newRank <= 8) {
            if (!gameState[newPosition] || !gameState[newPosition].startsWith(color)) {
                if (!isKingInCheck(color)) {
                    return false;
                }
            }
        }
    }

    return true;
}

function isStalemate(color) {
    if (isKingInCheck(color)) {
        return false;
    }

    const allPositions = Object.keys(gameState);
    for (const from of allPositions) {
        if (!gameState[from].startsWith(color)) {
            continue;
        }
        for (let file = 0; file < 8; file++) {
            for (let rank = 1; rank <= 8; rank++) {
                const to = `${String.fromCharCode(file + "a".charCodeAt(0))}${rank}`;
                if (isLegalMove(from, to)) {
                    const originalPiece = gameState[to];
                    gameState[to] = gameState[from];
                    delete gameState[from];

                    const inCheck = isKingInCheck(color);

                    gameState[from] = gameState[to];
                    if (originalPiece) {
                        gameState[to] = originalPiece;
                    } else {
                        delete gameState[to];
                    }

                    if (!inCheck) {
                        return false;
                    }
                }
            }
        }
    }

    return true;
}
