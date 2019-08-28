const fetch = require("node-fetch");
const debounce = require("lodash/debounce");
const { Observable } = require("rxjs/Observable");
const chalk = require("chalk");

const SHUFFLE_URL =
  "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1";
const getDrawURL = deck_id =>
  `https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=2`;

let drawnCards = {
  SPADES: [],
  CLUBS: [],
  HEARTS: [],
  DIAMONDS: []
};

// Calculate if the script should continue drawing cards.
const getHasFinished = () =>
  Object.values(drawnCards).every(suit => suit.includes("QUEEN"));

// Add the drawn cards to the global object
const setCards = cards =>
  cards.forEach(({ suit, value }) => drawnCards[suit].push(value));

// Log the most recent drawn cards
const logDraw = cards =>
  console.log(
    chalk.gray(
      `Drew ${
        cards[0].value === "QUEEN" ? chalk.green(cards[0].value) : chalk.yellow(cards[0].value)
      } of ${chalk.white(cards[0].suit)} and ${
        cards[1].value === "QUEEN" ? chalk.green(cards[1].value) : chalk.yellow(cards[1].value)
      } of ${chalk.white(cards[1].suit)}`
    )
  );

const setAndLogCards = cards => {
  setCards(cards);
  logDraw(cards);
};

// Log the finished stacks
const logCards = () => {
  console.log(chalk.blue('\nFinished!\n'))
  Object.entries(drawnCards).forEach(([suit, cards]) =>
    console.log(`${suit}: [${cards.join(", ")}]`)
  );
}

const observable = Observable.create(observable => {
  // Draw 2 new cards
  const draw = deck_id => {
    fetch(getDrawURL(deck_id))
      .then(res => res.json())
      .then(({ cards }) => {
        observable.next(cards);
        if (getHasFinished()) {
          observable.complete();
        } else {
          debouncedDraw(deck_id);
        }
      })
      .catch(err => observable.error(err));
  };
  const debouncedDraw = debounce(draw, 1000);

  // Shuffle the deck and start the drawing
  fetch(SHUFFLE_URL)
    .then(res => res.json())
    .then(({ deck_id }) => {
      console.clear();
      console.log(chalk.blue("Started Drawing\n"));
      debouncedDraw(deck_id);
    })
    .catch(err => observable.error(err));
});

observable.subscribe(setAndLogCards, console.error, logCards);
