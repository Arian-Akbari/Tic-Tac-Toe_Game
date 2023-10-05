export type gameState = {
    currentGameMoves: move[],
    history: {
        currentRoundGames: game[],
        allGames: game[],
    }
}
export type game ={
    moves : move[],
    status: gameStatus,
}
export type gameStatus ={
    isComplete: boolean,
    winner : player,
}
export type player = {
    id: number,
    name: string,
    iconType: string,
    iconClass: string,
    colorClass: string,
}
export type move ={
    squareId : number,
    player: player,
}