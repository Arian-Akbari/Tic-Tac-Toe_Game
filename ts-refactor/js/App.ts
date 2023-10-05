import View from './view'
import Store from './store'

const player = [
    {
        id: 1,
        name: 'Player 1',
        iconType: 'fas',
        iconClass: 'fa-times',
        colorClass: 'yellow',
    },
    {
        id: 2,
        name: 'Player 2',
        iconType: 'far',
        iconClass: 'fa-circle',
        colorClass: 'turqoise',
    }
]

function init() {
    const view = new View();
    const store = new Store('live-game-key', player);

    store.addEventListener('statechange', () => {
        view.render(store.game, store.status);
    })

    window.addEventListener('storage', () => {
        console.log('testing');
        view.render(store.game, store.status);
    })
    view.render(store.game, store.status);
    view.gameResetEvent(event => {
        store.reset();
    })
    view.newRoundEvent(event => {
        store.newRound();
    })
    view.playerMoveEvent((square) => {
        const existingMove = store.game.moves.find((move: { squareId: number; }) => move.squareId === +square.id);
        if (existingMove) return;
        view.handlePlayerMove(square, store.game.currentPLayer);
        store.playerMove(+square.id);
    })
}

window.addEventListener("load", init);