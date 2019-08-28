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
const draw = async deck_id => {
  const res = await fetch(getDrawURL(deck_id));
  const { cards } = await res.json();
  logDraw(cards);
  setCards(cards);
  if (!getHasFinished()) {
    debouncedDraw(deck_id);
  } else {
    console.log("\nFinished:\n");
    logCards();
  }
};
const debouncedDraw = debounce(draw, 1000);

// Shuffle the deck and start the drawing
const shuffle = async () => {
  console.clear();
  const res = await fetch(SHUFFLE_URL);
  const { deck_id } = await res.json();
  console.log("Started Drawing");
  debouncedDraw(deck_id);
};

shuffle();
