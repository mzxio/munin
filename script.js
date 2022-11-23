
// daydream of a data model for cards
/*{
  id: "", // number
  text: "", // string, 450 chars max
  title: "", // string, 80 chars max
  pip: "", // string, 3 chars max
  edits: [], // array of dates as strings 
  related: [], // array of id(s) 
  prev: "", // id of parent in chain
  next: "" // id of child in chain 
}*/


// ON STARTUP


// the platonic ideal of a deck object
// not used anywhere
const defaultDeck = {
  id: 1,
  cards: []
};

// initialize deck
// the actual object that gets used
var deck = {};

// check for saved deck in storage and load if found
// otherwise populate an empty deck
if (window.localStorage.getItem("deck")) {
  loadDeck();
} else {
  deck = {
    id: 1,
    cards: []
  };
}


// EVENT LISTENERS


// when textarea changes update text length character counter
document.getElementById("text").addEventListener("input", (event) => {
  //console.log(event)
  // set the counter element to new text length
  let len = document.getElementById("text").value.length;
  let counter = document.getElementById("textLength");
  counter.innerHTML = len;
  // disable button if text length is zero
  if (len > 0) {
    document.getElementById("send").disabled = false;
  } else {
    document.getElementById("send").disabled = true;
  }
})


//  CARD FUNCTIONS


function addCard() {
  let text = document.getElementById("text");

  // check to make sure text is >0 and <=450
  if (text.value.length > 0 && text.value.length <= 450) {
    // debug
    //console.log(text.value)
    // add card to deck
    deck.cards.push({
      id: deck.id,
      text: text.value,
      date: new Date().toISOString()
    })
    // increment database IDs
    deck.id += 1;
    // reset textarea, character counter, and button
    text.value = "";
    document.getElementById("textLength").innerHTML = 0;
    document.getElementById("send").disabled = true;
    // save altered deck
    saveDeck();
    // update cards display
    showAllCards();
  }
}


function editCard(id) {
  let oldCard = {};
  for (i in deck.cards) {
    if (deck.cards[i].id === id) {
      //console.log("edit "+id)
      console.log(deck.cards[i].id)
      console.log(deck.cards[i].text)
      //document.getElementById("text").value = deck.cards[i].text;
      //document.getElementById("textLength").innerHTML = deck.cards[i].text.length;
      break
    } else {
      continue
    }
  }
}


function deleteCard(id) {
  let newCards = [];
  for (i in deck.cards) {
    if (deck.cards[i].id === id) {
      //console.log("delete "+id)
      continue
    } else {
      newCards.push(deck.cards[i]);
    }
  }
  deck.cards = newCards;
  if (newCards.length === 0) {
    deck.id = 1;
  }
  saveDeck();
  showAllCards();
}


// DECK FUNCTIONS

function saveDeck() {
  // stringify current deck
  let save = JSON.stringify(deck);
  // empty local storage
  window.localStorage.clear();
  // save current deck string
  window.localStorage.setItem("deck", save);
}


function loadDeck() {
  // assuming check on local storage already done, grab save
  let save = window.localStorage.getItem("deck");
  // parse saved string and overwrite current deck object
  deck = JSON.parse(save);
  // update cards display
  showAllCards();
}


function clearDeck() {
  window.localStorage.clear()
  deck = {
    id: 1,
    cards: []
  };
  showAllCards();
}


function exportDeck() {
  let save = JSON.stringify(deck);
  console.log(save)
}


// DISPLAY FUNCTIONS

function showAllCards() {
  let field = document.getElementById("cardDeck");
  field.innerHTML = null;

  //for(i in deck.cards) {
  //console.log(cardbox.decks[i]);
  //}

  for (let i = deck.cards.length - 1; i >= 0; --i) {
    // debug
    //console.log(deck.cards[i].text)

    let thisCard = deck.cards[i];
    renderCard(thisCard, field)
  }

}


function renderCard(thisCard, field) {
  // create master card div
  let card = document.createElement("div");
  card.classList.add("card");

  // create text paragraph
  let text = document.createElement("p");
  text.classList.add("text")
  // replace newlines in text string with br html
  let textFilter = thisCard.text.split("");
  for (i in textFilter) {
    if (textFilter[i] === "\n") {
      textFilter[i] = "<br/>"
    } else {
      continue
    }
  }
  textFilter = textFilter.join("");
  text.innerHTML = textFilter;
  // safe old version
  //text.innerHTML = thisCard.text;

  // create timestamp paragraph
  let timestamp = document.createElement("p");
  timestamp.classList.add("timestamp");
  let date = new Date(thisCard.date);
  timestamp.append(date.toLocaleTimeString() + " • " + date.toLocaleDateString());


  // create menu div
  let menu = document.createElement("div");
  menu.classList.add("flexmenu")

  let edit = document.createElement("button");
  edit.innerHTML = "edit";
  edit.id = thisCard.id;
  edit.onclick = function() {
    editCard(thisCard.id)
  };
  let remove = document.createElement("button");
  remove.innerHTML = "remove";
  remove.onclick = function() {
    deleteCard(thisCard.id)
  };

  menu.append(timestamp);
  menu.append(edit);
  menu.append(remove);

  // append elements to card
  card.append(text);

  card.append(menu);

  // append card to field
  field.append(card);
}



