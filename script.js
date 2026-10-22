const board=document.getElementById("board");

const letter="abcdefgh";
for(let row=0;row<8;row++){
    for(let col=0;col<8;col++){
        const square=document.createElement("div");
        square.classList.add("square");
        const name=letter[col]+(8-row);
        square.id=name;
        board.appendChild(square);
    }
}
