canvas.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    let x = ~~(e.offsetX / 64);
    let y = ~~(e.offsetY / 64);
    let slot = board.slots[y][x];

    console.trace(slot)
});
canvas.addEventListener('click', function (e) {
    let x = ~~(e.offsetX / 64);
    let y = ~~(e.offsetY / 64);
    let slot = board.slots[y][x];
    setTimeout(function () {
        selectedElement.innerText = `${selected?.type}, ${selected?.row}${selected?.col}`
        draw(board)
    }, 300)
    // fix of the unnecessarry highlights
    if (selected.canGo && selected.canGo.has(''+y+x) == false) {
        selected = {};
        draw(board);
        // return;
    }
    if (!selected.row && slot.color !== board.turn) {
        selected = {};
        return;
    }
    if (!selected && !selected.color && slot.color != board.turn) return;
    if (slot == selected) return;
    else if (!selected.row) {
        selected = slot;
    }
    if (selected.row && board.turn != selected.color) {
        selected = {};
        return;
    }
    if (slot.color == selected.color && slot != selected) {
        selected = slot;
    }
    else if (!slot.isPiece && !selected.row) {
        selected = {};
        return;
    }

    if (selected && selected.canGo && selected.canGo.size > 0) {
        for (let i of selected.canGo) {
            if (i[0] == slot.row && i[1] == slot.col) {
                // console.log(i[0], slot.row, i[1], slot.col)
                // debugger
                // if (history.set.length-1 == history.index) {
                //     // debugger;
                //     history.add([selected, slot]);
                //     // history.index = history.set.length-1;
                // } else {
                //     history.set = history.set.slice(0, history.index);
                //     history.add([selected, slot]);
                // }
                // console.log()
                board.capture(selected, slot, x, y, true)
                // board.turn = +!board.turn;
                draw(board)
                whoMoves.innerHTML = board.turn == 0 ? 'White' : 'Black';
                let notations = '';
                let notesArray = [...board.history.notes, ...board.history.futureNotes];
                let n = 0//~~(notesArray.length / 2);
                // debugger
                for (let i in notesArray) {
                    if (+i % 2 == 0) notations += ` ${++n})`;
                    notations += ` ${notesArray[i].indexOf('#') != -1 ? '<span style="color: red; font-weight="bold;">'+notesArray[i]+'</span>' : notesArray[i]}`;
                }
                document.querySelector('aside span').innerHTML = notations;
                // setTimeout(function () {
                //     if (board.turn == 1) {
                //         let a = minimax(board, -Infinity, Infinity, 3, true, board.values(1), 1);
                //         console.log(a)
                //         console.log(`${a[0].piece.toUpperCase()} from ${readable(a[0].from)} to ${readable(a[0].to)}`)
                //     }
                //     // capture(findPiece(a[1].from, slots), findPiece(a[1].to, slots))
                // }, 300)
                selected = {};
                break;
            }            
        }
    } else {
        selected = slot;
    }
    
    requestAnimationFrame(() => draw(board));
})
function readable (string) {
    return String.fromCharCode(65+~~string[1]) +''+Math.abs(+string[0]-8)
}
function switchVersion () {
    if (!board.isChaturanga) {
        board = new Board('chaturanga', false);
    } else {
        board = new Board();
    }
    draw(board)
}