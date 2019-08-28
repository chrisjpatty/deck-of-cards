const fetch = require("node-fetch");
const debounce = require("lodash/debounce");

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
    `Drew ${cards[0].value} of ${cards[0].suit} and ${cards[1].value} of ${
      cards[1].suit
    }`
  );

// Log the finished stacks
const logCards = () =>
  Object.entries(drawnCards).forEach(([suit, cards]) =>
    console.log(`${suit}: [${cards.join(", ")}]`)
  );

// Draw 2 new cards
const draw = deck_id => {
  fetch(getDrawURL(deck_id))
    .then(res => res.json())
    .then(({ cards }) => {
      logDraw(cards);
      setCards(cards);
      if (!getHasFinished()) {
        debouncedDraw(deck_id);
      } else {
        console.log("\nFinished:\n");
        logCards();
      }
    })
    .catch(err => console.error(err));
};
const debouncedDraw = debounce(draw, 1000);

// Shuffle the deck and start the drawing
fetch(SHUFFLE_URL)
  .then(res => res.json())
  .then(({ deck_id }) => {
    console.log("Started Drawing");
    debouncedDraw(deck_id);
  })
  .catch(err => console.error(err));
