function flipTheBoard() {
    flipBoard = !flipBoard
    if (flipBoard) {
        flipBlack = true
        flipWhite = true
    } else {
        flipBlack = false
        flipWhite = false
    }
    canvas.classList.toggle('flipped')
    document.querySelector('.board').classList.toggle('reversed')
}

function emptySlot(slot, x, y) {
    // slots[slot.row][slot.col] = {
    //     col: slot.col,
    //     row: slot.row
    // }
    // console.log(slots[slot.row][slot.col]);
    delete slot.isPiece
    delete slot.color
    delete slot.type
    delete slot.highlight
    delete slot.isCassleShort
    delete slot.isCassleLong
    delete slot.moved
}
let whoMoves = document.getElementById('whoMoves');
function draw (game) {
    ctx.clearRect(0, 0, 512, 512)
    // Background
    for (let row = 0; row < 8; row++) {
        let n = 0;
        if (row % 2 == 0) n = 1;
        for (let col = 0; col < 8; col++) {
            ctx.fillStyle = n == 0 ? '#777' : '#fff';
            ctx.fillRect(64*col, 64*row, 64, 64);
            n = +!n
        }
    }
    // console.log(game)
    for (let row in game.slots) {
        for (let col in game.slots[row]) {
            let slot = game.slots[row][col];
            if (slot.isPiece) {
                if (game.isCheck) {
                    // debugger
                    if (slot.type == 'king' && slot.color == game.check.to) {
                        // ctx.lineWidth = 10;
                        ctx.fillStyle = 'rgba(175, 0, 0, .6)';
                        ctx.fillRect(64*slot.col, 64*slot.row, 64, 64)
                        // ctx.lineWidth = 4;
                    }
                }
                // console.log(64*row, 64*col)
                if (flipBlack == true && slot.color == 1 || flipWhite == true && slot.color == 0) {
                    ctx.save()
                    ctx.translate(64*col+32, 64*row+32)
                    ctx.rotate(180*Math.PI/180)
                    ctx.drawImage(eval(`${slot.type}_${slot.color == 0 ? 'white' : 'black'}`), -32, -32, 64, 64)
                    ctx.restore()
                } else {
                    ctx.drawImage(eval(`${slot.type}_${slot.color == 0 ? 'white' : 'black'}`), 64*col, 64*row, 64, 64)
                }
                if (selected) {
                    if (selected && selected.canGo && selected.canGo.size > 0) {
                        ctx.lineWidth = 5
                        ctx.strokeStyle = 'dodgerblue'
                        for (let i of selected.canGo) {
                            ctx.strokeRect(64*i[1], 64*i[0], 64, 64)
                        }
                        ctx.strokeStyle = 'lime'
                        ctx.strokeRect(64*selected.col, 64*selected.row, 64, 64)
                    }
                }
            }
        }
    }
}
// let index = -1;
// function undo() {
//     if (emptyArray.length == 0) return;
//     let c = emptyArray[index]
//     console.log(c)
//     c.action == 'capture' && console.log(c.capturedSlot)
//     let s = board.slots
//     s[c.fromN[0]][c.fromN[1]] = c.piece
//     s[c.toN[0]][c.toN[1]] = c.capturedSlot
//     board.turn = +!board.turn
//     board.findAllMoves()
//     draw(board)
// }
requestAnimationFrame(() => draw(board));