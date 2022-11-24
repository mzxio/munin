
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
  active: null,
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
    active: null,
    cards: []
  };
}


// EVENT LISTENERS


// when composer textarea changes update character counter/button
document.getElementById("newText").addEventListener("input", (event) => {
  //console.log(event)

  // set the counter element to new text length
  let len = document.getElementById("newText").value.length;
  let counter = document.getElementById("newTextLength");
  counter.innerHTML = len;

  // disable button if text length is zero
  if (len > 0) {
    document.getElementById("newSend").disabled = false;
    document.getElementById("newCancel").disabled = false;
  } else {
    document.getElementById("newSend").disabled = true;
    document.getElementById("newCancel").disabled = true;
  }
})

// when editor textarea changes update character counter/button
document.getElementById("editText").addEventListener("input", (event) => {
  //console.log(event)

  // set the counter element to new text length
  let len = document.getElementById("editText").value.length;
  let counter = document.getElementById("editTextLength");
  counter.innerHTML = len;

  // disable button if text length is zero
  if (len > 0) {
    document.getElementById("editSend").disabled = false;
  } else {
    document.getElementById("editSend").disabled = true;
  }
})


//  CARD FUNCTIONS


// fired by "send it" button click in the composer
function addCard() {

  let text = document.getElementById("newText");
  let title = document.getElementById("newTitle");
  let pip = document.getElementById("newPip");
  //let related = document.getElementById("newRelated");
  
  // check to make sure text is >0 and <=450
  if (text.value.length > 0 && text.value.length <= 450) {
    // debug
    //console.log(text.value)

    let newTitle = "";
    let newPip = "";

    if (title.value.length > 0) {
      newTitle = title.value;
    }
    
    if (pip.value.length > 0) {
      newPip = pip.value
    }
    
    // add card to deck
    deck.cards.push({
      id: deck.id,
      text: text.value,
      title: newTitle,
      pip: newPip,
      //related: related.value,
      date: new Date().toISOString()
    })

    // increment database IDs
    deck.id += 1;

    // reset textarea, character counter, and button
    text.value = "";
    document.getElementById("newTextLength").innerHTML = 0;
    document.getElementById("newSend").disabled = true;

    // save altered deck
    saveDeck();
    // update cards display
    showAllCards();
  }
}

// fired by "re-send it" button click in the editor
function addCardEdits() {
  //console.log(deck.cards[deck.active])

  let text = document.getElementById("editText");

  // check to make sure text is >0 and <=450
  if (text.value.length > 0 && text.value.length <= 450) {

    // overwrite card with edits
    deck.cards[deck.active].text = text.value;
    deck.cards[deck.active].date = new Date().toISOString();

    deck.active = null;

    // reset textarea, character counter, and button
    text.value = "";
    document.getElementById("editTextLength").innerHTML = 0;
    document.getElementById("editSend").disabled = true;

    document.getElementById("cardEditModal").style.display = "none";
    document.getElementById("cardComp").style.display = "block";
    document.getElementById("cardDeck").style.display = "block";
    // save altered deck
    saveDeck();
    // update cards display
    showAllCards();

  }
}

// fired by "edit" button click in card
function editCard(id) {
  let oldCard = {};
  for (i in deck.cards) {
    if (deck.cards[i].id === id) {
      // debug
      //console.log("edit "+id)
      //console.log(deck.cards[i].id)
      //console.log(deck.cards[i].text)

      // set active id to this card's id
      deck.active = i;

      // transfer contents of card into editor
      document.getElementById("editText").value = deck.cards[i].text;
      document.getElementById("editTextLength").innerHTML = deck.cards[i].text.length;
      //document.getElementById("editSend").disabled = false;

      document.getElementById("cardEditModal").style.display = "block";
      document.getElementById("cardComp").style.display = "none";
      document.getElementById("cardDeck").style.display = "none";

      break
    } else {
      continue
    }
  }
}

// fired by "remove" button click in card
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

// fired by "X" button click in composer
function newCancel() {
  // reset input elements
  document.getElementById("newText").value = "";
  document.getElementById("newTextLength").innerHTML = 0;
  document.getElementById("newSend").disabled = true;
  document.getElementById("newCancel").disabled = true;
}

// fired by "X" button in editor
function editCancel() {
  // clear active card id
  deck.active = null;
  // reset input elements
  document.getElementById("editText").value = "";
  document.getElementById("editTextLength").innerHTML = 0;
  document.getElementById("editSend").disabled = true;
  // switch back to composer view
  document.getElementById("cardEditModal").style.display = "none";
  document.getElementById("cardComp").style.display = "block";
  document.getElementById("cardDeck").style.display = "block";
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
  //console.log(save)

  let filename = "editor-export.json";
  let element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(save));
  element.setAttribute("download", filename);
  element.style.display = "none";

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
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


  // create pip paragraph
  if (thisCard.pip && thisCard.pip.length > 0) {
    let pip = document.createElement("p");
    pip.classList.add("pip");
    pip.innerHTML = thisCard.pip;
    card.append(pip);
  }
  
  // create title heading
  if (thisCard.title && thisCard.title.length > 0) {
    let title = document.createElement("p");
    title.classList.add("title");
    title.innerHTML = thisCard.title;
    card.append(title);
  }

  
  
  
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
  menu.append(remove);
  menu.append(edit);

  // append elements to card
  card.append(text);

  card.append(menu);

  // append card to field
  field.append(card);
}



