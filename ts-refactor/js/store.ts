import type {gameState, player , game} from "./types";



const initialValue = {
    currentGameMoves: [],
    history: {
        currentRoundGames: [],
        allGames: [],
    }
};

type SaveStateCb = (prevState : gameState) => gameState

export default class store extends EventTarget {
    #state = initialValue;

    constructor(
        private readonly storageKey : string,
        private readonly players : player[]) {
        super();
    }

    get status() {
        const state = this.#getState();
        return {
            playerWithStat: this.players.map(player => {
                const wins = state.history.currentRoundGames.filter
                ((game: { status: { winner: { id: number; }; }; }) => {
                    return game.status.winner?.id === player.id;
                }).length;

                return {
                    ...player,
                    wins
                }
            }),
            ties: state.history.currentRoundGames.filter((game : game) =>
                game.status.winner === null).length,

        };
    }

    get game() {
        const state = this.#getState();
        const currentPLayer = this.players[state.currentGameMoves.length % 2];

        const winningPatterns = [
            [1, 2, 3],
            [1, 5, 9],
            [1, 4, 7],
            [2, 5, 8],
            [3, 5, 7],
            [3, 6, 9],
            [4, 5, 6],
            [7, 8, 9],
        ]
        let winner = null;

        for (let player of this.players) {
            const selectedSquareIds = state.currentGameMoves.filter
            ((move: { player: { id: number; }; }) => move.player.id === player.id).map
            ((currentGameMoves: { squareId: number; }) => currentGameMoves.squareId);

            for (let pattern of winningPatterns) {
                if (pattern.every(v => selectedSquareIds.includes(v))) {
                    winner = player;
                }
            }
        }

        return {
            currentPLayer,
            moves: state.currentGameMoves,
            status: {
                isComplete: winner != null || state.currentGameMoves.length === 9,
                winner,
            }
        };

    }

    playerMove(squareId : Number) {
        const stateClone = structuredClone(this.#getState());
        stateClone.currentGameMoves.push({
            squareId,
            player: this.game.currentPLayer,
        })

        this.#saveState(stateClone);
    }

    reset() {
        const stateClone = structuredClone(this.#getState());
        const {status, moves} = this.game;

        if (this.game.status.isComplete) {
            stateClone.history.currentRoundGames.push({
                moves,
                status,
            })
        }
        stateClone.currentGameMoves = [];
        this.#saveState(stateClone);
    }

    #getState() {
        const item = window.localStorage.getItem(this.storageKey);
        return item ? JSON.parse(item) : initialValue;
    }

    newRound() {
        this.reset();
        const stateClone = structuredClone(this.#getState()) as gameState;
        stateClone.history.allGames.push(...stateClone.history.currentRoundGames);
        stateClone.history.currentRoundGames = [];
        this.#saveState(stateClone);
    }

    #saveState(stateOrFun : gameState | SaveStateCb ) {
        const prevState = this.#getState();
        let newState
        switch (typeof stateOrFun) {
            case "function":
                newState = stateOrFun(prevState);
                break;
            case "object":
                newState = stateOrFun;
                break;
            default:
                throw new Error('invalid argument passed to saveState');
        }
        window.localStorage.setItem(this.storageKey, JSON.stringify(newState));
        this.dispatchEvent(new Event('statechange'));
    }

}