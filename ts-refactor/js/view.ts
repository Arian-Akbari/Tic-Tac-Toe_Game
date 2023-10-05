import store from "./store";
import {game, move, player} from "./types";

export default class View {
    $: Record<string, Element> = {};
    $$: Record<string, NodeListOf<Element>> = {};

    constructor() {

        this.$.menu = this.#qs('[data-id="menu"]');
        this.$.playerIcon = this.#qs('[data-id="player-icon"]');
        this.$.menuBtn = this.#qs('[data-id="menu-btn"]');
        this.$.turn = this.#qs('[data-id="player-turn"]');
        this.$.menuItems = this.#qs('[data-id="menu-items"]');
        this.$.resetBtn = this.#qs('[data-id="reset-btn"]');
        this.$.newRoundBtn = this.#qs('[data-id="new-round-btn"]');
        this.$.result = this.#qs('[data-id="result"]');
        this.$.resultText = this.#qs('[data-id="result-text"]');
        this.$.resultBtn = this.#qs('[data-id="result-button"]');
        this.$.p1Wins = this.#qs('[data-id="p1-score"]');
        this.$.p2Wins = this.#qs('[data-id="p2-score"]');
        this.$.ties = this.#qs('[data-id="ties"]');
        this.$.grid = this.#qs('[data-id="grid"]');

        this.$$.square = this.#qsAll('[data-id="square"]');

        this.$.menuBtn.addEventListener("click", (event) => {
            this.#toggleMenu()
        });
    }


    render(game: store['game'], stats: store['status']) {
        const {playerWithStat, ties} = stats;
        const {
            currentPLayer,
            moves,
            status: {isComplete, winner}
        } = game;
        this.closeAll();
        this.clearMoves();
        this.#updateScoreboard(
            playerWithStat[0].wins,
            playerWithStat[1].wins,
            ties);
        this.initializeMoves(moves);

        if (isComplete) {
            this.openResult(winner ? `${winner.name} wins!` : 'Tie!')
        }

        this.setTurnIndicator(currentPLayer);

    }

    #updateScoreboard(p1Wins: number, p2Wins: number, ties: number) {
        this.$.p1Wins.textContent = `${p1Wins} wins`;
        this.$.p2Wins.textContent = `${p2Wins} wins`;
        this.$.ties.textContent = `${ties}`;
    }

    gameResetEvent(handler: EventListener) {
        this.$.resetBtn.addEventListener("click", handler);
        this.$.resultBtn.addEventListener("click", handler);
    }

    openResult(message: string) {
        this.$.result.classList.remove('hidden');
        this.$.resultText.textContent = message;
    }

    #closeResult() {
        this.$.result.classList.add("hidden");
    }

    closeAll() {
        this.#closeResult();
        this.#closeMenu();
    }

    #closeMenu() {
        this.$.menuItems.classList.add("hidden");
        this.$.menuBtn.classList.remove("border");
        // const icon = this.$.menuBtn.querySelector('i');
        const icon = this.#qs('i', this.$.menuBtn);
        icon.classList.remove("fa-chevron-up");
        icon.classList.add("fa-chevron-down");
    }

    clearMoves() {
        this.$$.square.forEach((square => {
            square.replaceChildren();
        }))
    }

    initializeMoves(moves: move[]) {
        this.$$.square.forEach(square => {
            const existingMoves = moves.find((move) => move.squareId === +square.id);
            if (existingMoves) {
                this.handlePlayerMove(square, existingMoves.player)
            }
        })
    }

    newRoundEvent(handler: EventListener) {
        this.$.newRoundBtn.addEventListener("click", handler);
    }

    playerMoveEvent(handler: (el: Element) => void) {
        this.#delegate(this.$.grid,
            '[data-id="square"]',
            'click',
            handler);
        // this.$$.square.forEach(square => {
        //     square.addEventListener("click", () => handler(square));
        // })
    }

    //helper methods
    handlePlayerMove(squareEl: Element, player: player) {
        const icon = document.createElement('i');
        icon.classList.add(player.colorClass, player.iconType, player.iconClass);
        squareEl.replaceChildren(icon);
    }

    setTurnIndicator(player: player) {
        const icon = document.createElement('i');
        const label = document.createElement('p');

        icon.classList.add(player.colorClass, player.iconType, player.iconClass);
        label.classList.add(player.colorClass);

        label.innerText = `${player.name}, you\`re up!`;

        this.$.turn.replaceChildren(icon, label);

    }


    #toggleMenu() {
        this.$.menuItems.classList.toggle("hidden");
        this.$.menuBtn.classList.toggle("border");
        // const icon = this.$.menuBtn.querySelector('i');
        const icon = this.#qs('i', this.$.menuBtn);
        icon.classList.toggle("fa-chevron-up");
        icon.classList.toggle("fa-chevron-down");
    }

    #qs(selector: string, parent?: Element) {
        const el = parent ? parent.querySelector(selector)
            : document.querySelector(selector);
        if (!el) throw new Error("could not find element");
        return (el);
    }

    #qsAll(selector: string) {
        const elList = document.querySelectorAll(selector);
        if (!elList) throw new Error("could not find element");
        return (elList);
    }

    #delegate(el: Element,
              selector: string,
              eventKey: string,
              handler: (el: Element) => void) {

        el.addEventListener(eventKey, (event) => {

            if (!(event.target instanceof Element)) {
                throw new Error('Event target not found');
            }

            if (event.target.matches(selector)) {
                handler(event.target);
            }
        })
    }
}