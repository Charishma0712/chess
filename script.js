const board=document.getElementById("board");
const piecesByPosition={
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
        const pieceName = piecesByPosition[name];
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

board.addEventListener("click", (event) => {
    const square = event.target.closest(".square");
    if (!square) return;
    const piece = square.querySelector(".piece");
    if (!selectedPiece) {
        if (piece) {
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
    if (piece &&piece.classList.contains("white-piece") ===selectedPiece.classList.contains("white-piece")) {
        selectedPiece.classList.remove("selected");
        selectedPiece = piece;
        selectedPiece.classList.add("selected");
        return;
    }
    // Capture an opponent's piece, if present
    if(piece) {
        piece.remove();
    }
    // Move the selected piece
    square.appendChild(selectedPiece);
    selectedPiece.classList.remove("selected");
    selectedPiece = null;
});

