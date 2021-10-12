let create = el => document.createElement(el);
let $ = el => document.querySelector(el);
let board = create('board');
let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
let numbers = [1, 2, 3, 4, 5, 6, 7, 8].reverse();

let pieces = {
    black: {
        pawn: ['a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7']
    },
    white: {
        pawn: ['a2', 'e2']
    }
}
let selected = null;

// add prev character and next, change everything to [[{}]]

function drawBoard () {
    let n = 0;  
    for (let i = 0; i < 64; i++) {
        let cell = create('cell')

        if (i > 7 && i % 8 == 0) {
            n++;
        }
        cell.classList.add(letters[i % 8] + numbers[n])

        if (i % 2 == 0 && [0, 2, 4, 6, 8].includes(n)
            || i % 2 != 0 && [1, 3, 5, 7].includes(n)) {
            cell.classList.add('light')
        } else {
            cell.classList.add('dark')
        }
        cell.addEventListener('click', findAllowedMoves)
        board.append(cell)
    }
}
function nextCharacter(c) {
    if (c == 'a') return c;
    return String.fromCharCode(c.charCodeAt(0) - 1);
}
function findAllowedMoves (e) {
    let el = e.target;
    let classes = [...el.classList];
    if (classes.includes('highlight')) {
        el.classList.remove('piece', 'black', 'white', 'pawn')
        el.classList.add(selected.classList[2], selected.classList[3], selected.classList[4])
        selected.classList.remove('piece', 'black', 'white', 'pawn');
        [...document.querySelectorAll('.highlight')].forEach(i => i.classList.remove('highlight'))
    } else if (classes.includes('piece')) {
        [...document.querySelectorAll('.highlight')].forEach(i => i.classList.remove('highlight'))
        selected = el;
        if (classes.includes('pawn')) {
            let n = 1;
            if (classes.includes('black')) n = -1
            if ($(`.${nextCharacter(classes[0][0])}${+classes[0][1]+n}`).classList.contains('piece')) {
                $(`.${nextCharacter(classes[0][0])}${+classes[0][1]+n}`).classList.add('highlight')
            }
            $(`.${classes[0][0]}${+classes[0][1]+n}`).classList.add('highlight')
        }
    }
}
function createPeace(piece, color, coord) {
    let el = $(`cell.${coord}`);
    el.classList.add(color, 'piece', piece)
}
document.body.append(board)
drawBoard()
createPeace('pawn', 'black', 'c5')
for (let team in pieces) {
    let t = pieces[team]
    for (let type in t) {
        for (let i = 0; i < t[type].length; i++) 
            createPeace(type, team, t[type][i])
    }
}
