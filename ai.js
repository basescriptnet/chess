let positionCount = 0;
function minimax(game, alpha, beta, depth, isMaximizingPlayer, sum, color)
{
    positionCount++; 
    // if (positionCount > 1_000) return;
    var children = game.moves(color);
    
    // Sort moves randomly, so the same move isn't always picked on ties
    children.sort(function(a, b){return 0.5 - Math.random()});
    
    var currMove;
    // Maximum depth exceeded or node is a terminal node (no children)
    if (depth === 0 || children.length === 0)
    {
        return [null, sum]
    }

    // Find maximum/minimum from list of 'children' (possible moves)
    var maxValue = Number.NEGATIVE_INFINITY;
    var minValue = Number.POSITIVE_INFINITY;
    var bestMove;
    let AIBoard;
    for (var j = 0; j < children.length; j++)
    {
        currMove = children[j];
        let i = currMove

        // Note: in our case, the 'children' are simply modified game states
        // var currPrettyMove = game.ugly_move(currMove);

        // let current = game.history.set[game.history.set.length-1];
        current = game.stringify()
        let copy = current;
        current &&= current.split('/')
        // let current = history.set[history.index].split('/');
        let from = current[i.from[0]].split('');
        // debugger;
        from[i.from[1]] = '*';
        current[i.from[0]] = from.join('');
        let l = i.piece == 'knight' ? 'N' : i.piece[0].toUpperCase();
        let to = current[i.to[0]].split('');
        to[i.to[1]] = l;
        current[i.to[0]] = to.join('');
        // console.log(i.to[1] == '51')
        // if (positionCount == 122) debugger;
        AIBoard = new Board(current.join('/'), true);
        
        // var newSum = evaluateBoard(currPrettyMove, sum, color);
        
        let [childBestMove, childValue] = minimax(AIBoard, alpha, beta, depth - 1, !isMaximizingPlayer, AIBoard.values(color), color);
        // console.log(1)
        AIBoard = new Board(copy, true);
        // AIBoard.undo()
        // game.undo();
    
        if (isMaximizingPlayer)
        {
            if (childValue > maxValue)
            {
                maxValue = childValue;
                bestMove = currMove;
            }
            // alpha ??= childValue;
            if (childValue > alpha) {
                alpha = childValue;
            }
        }

        else
        {
            if (childValue < minValue)
            {
                minValue = childValue;
                bestMove = currMove;
            }
            // beta ??= childValue;
            if (childValue < beta) {
                beta = childValue
            }
        }
        if (alpha >= beta) {
            break;
        }
    }

    if (isMaximizingPlayer)
    {
        return [bestMove, maxValue]
    }
    else
    {
        return [bestMove, minValue];
    }
}
function AI (who2Move = 1, game = board, depth, isMaximizingPlayer) {
    if (turn != who2Move
        || isMate || history.isUndo
    ) return;
    
    if (depth === 0) {
        return [game.values(who2Move), null];
    };

    let best = -9999;
    let arrBestMoves = [];
    let chosen = null;

    var bestMoveValue = isMaximizingPlayer ? Number.NEGATIVE_INFINITY
                                           : Number.POSITIVE_INFINITY;
    let bestMove = null;
    game.findAllMoves()
    moves = game.moves(game.turn);
    moves.sort(function(a, b){return 0.5 - Math.random()})
    // console.log(moves)
    // debugger
    for (let i of moves) {
        let current = game.history.set[game.history.set.length-1];
        current &&= current.split('/')
        // let current = history.set[history.index].split('/');
        let from = current[i.from[0]].split('');
        // debugger;
        from[i.from[1]] = '*';
        current[i.from[0]] = from.join('');
        let l = i.piece == 'knight' ? 'N' : i.piece[0].toUpperCase();
        let to = current[i.to[0]].split('');
        to[i.to[1]] = l;
        current[i.to[0]] = to.join('');
        let AIBoard = new Board(current.join('/'), true);
        let value = AIBoard.values(1);
        if (AIBoard.isMate) {
            game.capture(game.findPiece(i.from), game.findPiece(i.to))
            return;
        }
        // value = AI(who2Move, AIBoard, depth-1, !isMaximizingPlayer)
        // console.log(isMaximizingPlayer ? 'Max: ' : 'Min: ', 'depth: '+depth, i, value,
        //         bestMove, bestMoveValue);
        best = Math.max(best, value);
        // console.log(best, value)
        // // console.log(AIBoard.values(1))
        if (best == value) {
            arrBestMoves.push(i);
            // chosen = i;
        }
        else if (best > value) {
            arrBestMoves = [i];
            chosen = i;
        }
        if (isMaximizingPlayer) {
            // Look for moves that maximize position
            // debugger;
            if (value && value[0] > bestMoveValue) {
                bestMoveValue = value;
                bestMove = i;
            }
        } else {
            // Look for moves that minimize position
            if (value && value[0] < bestMoveValue) {
                // debugger;
                bestMoveValue = value;
                bestMove = i;
            }
        }
    }
    let res = chosen ? chosen : arrBestMoves[~~(Math.random()*arrBestMoves.length)];
    // console.log(arrBestMoves, res, best, chosen)
    // debugger
    res && game.capture(game.findPiece(res.from), game.findPiece(res.to))
    return [bestMoveValue, bestMove]// || res]
}