
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


// initialize base objects
var deck = {};
var prefs = {};

// the platonic ideal of a deck object
function defaultDeck() {
  return {
    cards: [],
    id: 1,
    active: null,
    trash: [],
    relations: []
  }
}

// check for saved deck in storage and load if found
// otherwise populate an empty deck
if (window.localStorage.getItem("deck")) {
  loadDeck();
} else {
  deck = defaultDeck();
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
    // cancel button is always enabled
  } else {
    document.getElementById("editSend").disabled = true;
  }
})



// UI FUNCTIONS

// read the menu form state to create a settings object
function menuSettings() {
  let controls = document.getElementById("viewMenu").elements;
  let settings = {
    compose: controls.new.checked,
    meta: controls.meta.checked,
    tools: controls.tools.checked,
    share: controls.share.checked,
    show: controls.show.options[controls.show.options.selectedIndex].innerText,
    sort: controls.sort.options[controls.sort.options.selectedIndex].innerText,
    view: controls.view.options[controls.view.options.selectedIndex].innerText
  };
  return settings;
}

// hotdog menu
function menuToggle() {  
  let controls = document.getElementById("viewMenu").elements;
  let viewMenu = document.getElementById("viewMenu");
  let viewMenuState = viewMenu.style.display;
  //console.log(viewMenuState)

  if (viewMenuState === "none") {
    document.getElementById("viewMenu").style.display = "block";
    document.getElementById("viewMenuToggle").innerHTML = "&check;";
  }
  if (viewMenuState === "block") {
    document.getElementById("viewMenu").style.display = "none";
    document.getElementById("viewMenuToggle").innerHTML = "≡";
  } 

  if (controls.new.checked) {
    document.getElementById("cardComp").style.display = "block";
  } else {
    document.getElementById("cardComp").style.display = "none";
  }
  
  //console.log(viewMenuState)
  prefs = menuSettings();
  showAllCards();
  //document.activeElement.blur();
}

// "X" button in composer
function newCancel() {
  // reset input elements
  document.getElementById("newText").value = "";
  document.getElementById("newTextLength").innerHTML = 0;
  document.getElementById("newSend").disabled = true;
  document.getElementById("newCancel").disabled = true;
}

// "X" button in editor
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
  document.getElementById("deckModal").style.display = "block";
}



// HELPERS

// parse related string
function filterRelated(related) {
  //let filter = related.split("");
  //console.log(related)
  let filter = related.split(", ").filter(element => element);  
  
  //console.log(filter)
  return filter;
}

// parse text string, replace newlines with br html
function filterText(text) {
  let filter = text.split("");
  for (i in filter) {
    if (filter[i] === "\n") {
      filter[i] = "<br/>"
    } else {
      continue
    }
  }
  return filter.join("");  
}



//  CARD FUNCTIONS

// fired by "send it" button click in the composer
function addCard() {

  let text = document.getElementById("newText");
  let title = document.getElementById("newTitle");
  let pip = document.getElementById("newPip");
  let related = document.getElementById("newRelated");

  // check to make sure text is >0 and <=450
  if (text.value.length > 0 && text.value.length <= 450) {
    // debug
    //console.log(text.value)

    let newTitle = "";
    let newPip = "";
    let newRelated = "";

    if (title.value.length > 0) {
      newTitle = title.value;
    }

    if (pip.value.length > 0) {
      newPip = pip.value
    }

    if (related.value.length > 0) {
      newRelated = related.value;
      // todo parse these as tags
      // work a helper into the deck.relations list 
      newRelated = filterRelated(related.value);
    }

    // add card to deck
    deck.cards.push({
      id: deck.id,
      text: text.value,
      title: newTitle,
      pip: newPip,
      related: newRelated,
      prev: "",
      next: "",
      date: new Date().toISOString()
    })

    // increment database IDs
    deck.id += 1;

    // reset textarea, character counter, and button
    text.value = "";
    title.value = "";
    pip.value = "";
    related.value = "";
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
  let title = document.getElementById("editTitle");
  let pip = document.getElementById("editPip");
  let related = document.getElementById("editRelated");

  // check to make sure text is >0 and <=450
  if (text.value.length > 0 && text.value.length <= 450) {

    // overwrite card with edits
    deck.cards[deck.active].text = text.value;
    deck.cards[deck.active].title = title.value;
    deck.cards[deck.active].pip = pip.value;
    // todo more logic on related
    deck.cards[deck.active].related = filterRelated(related.value);
    deck.cards[deck.active].date = new Date().toISOString();

    deck.active = null;

    // reset textarea, character counter, and button
    text.value = "";
    title.value = "";
    pip.value = "";
    related.value = "";
    document.getElementById("editTextLength").innerHTML = 0;
    //document.getElementById("editSend").disabled = true;

    // disable edit modal and return to normal display
    document.getElementById("cardEditModal").style.display = "none";
    document.getElementById("cardComp").style.display = "block";
    document.getElementById("deckModal").style.display = "block";

    // save altered deck
    saveDeck();
    // update cards display
    showAllCards();
  }
}

// fired by "edit" button click in card
function editCard(id) {
  // ? let oldCard = {};
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
      document.getElementById("editTitle").value = deck.cards[i].title;
      document.getElementById("editPip").value = deck.cards[i].pip;
      document.getElementById("editRelated").value = deck.cards[i].related;

      // disable normal display and render edit modal
      document.getElementById("editSend").disabled = false;
      document.getElementById("cardEditModal").style.display = "block";
      //document.getElementById("cardComp").style.display = "none";
      document.getElementById("deckModal").style.display = "none";

      break
    } else {
      continue
    }
  }
}

// fired by "remove" button click in card
function deleteCard(id) {
  let newCards = [];
  let oldCard = {};
  for (i in deck.cards) {
    if (deck.cards[i].id === id) {
      // send deleted cards into the trash
      oldCard = deck.cards[i];
      deck.trash.push(oldCard);
      //continue
    } else {
      newCards.push(deck.cards[i]);
    }
  }
  // set deck to new filtered deck
  deck.cards = newCards;
  // reset ids if all cards deleted
  // disabled because trash uses post ids
  //if (newCards.length === 0) {
  //  deck.id = 1;
  //}
  // save and refresh deck
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
  deck = defaultDeck();
  showAllCards();
}

// export deck as a plain text json file
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

// experimental export deck as a  ???
function exportDeckExp() {

  // old deprecated way of doin it
  //let encode = btoa(JSON.stringify(deck));
  //let decode = atob(encode);
  //return encode;

  let encoder = new TextEncoder();
  let decoder = new TextDecoder();
  let view = encoder.encode(JSON.stringify(deck));
  let reverse = decoder.decode(view)
  return view.toString();

  // even more experimental image conversion
  /*
  let wh = Math.round(Math.sqrt(view.length));

  let canvas = document.getElementById("canvas");
  let ctx = canvas.getContext("2d");
  let imageData = new ImageData(view, wh, wh);
  ctx.putImageData(imageData, 0, 0);
  */
}

function importDeck() {
  alert("sorry not yet")
}



// DISPLAY FUNCTIONS

// render field of cards, newest to oldest
function showAllCards() {
  let field = document.getElementById("deckView");
  field.innerHTML = "";

  for (let i = deck.cards.length - 1; i >= 0; --i) {
    // debug
    //console.log(deck.cards[i].text)

    let thisCard = deck.cards[i];
    renderCard(thisCard, field)
    //renderCardSimple(thisCard, field)
  }

}

// render field of cards, oldest to newest
function showAllCardsOldest() {
  let field = document.getElementById("deckView");
  field.innerHTML = "";

  for(i in deck.cards) {
  //console.log(cardbox.decks[i]);
    let thisCard = deck.cards[i];
    renderCard(thisCard, field)
    //renderCardSimple(thisCard, field)
  }

}

// render individual card elements
function renderCard(thisCard, field) {
  // check view controls, toggles element rendering
  let controls = document.getElementById("viewMenu").elements
  
  // create master card div
  let card = document.createElement("div");
  card.classList.add("card");

  // create menu div
  let menu = document.createElement("div");
  menu.classList.add("flexmenu")

  // create pip paragraph
  if (thisCard.pip && thisCard.pip.length > 0) {
    let pip = document.createElement("p");
    pip.classList.add("pip");
    pip.innerHTML = thisCard.pip;
    card.append(pip);
  }

  // create title paragraph
  if (thisCard.title && thisCard.title.length > 0) {
    let title = document.createElement("p");
    title.classList.add("title");
    title.innerHTML = thisCard.title;
    card.append(title);
  }

  // create text paragraph
  let text = document.createElement("p");
  text.classList.add("text")
  text.innerHTML = filterText(thisCard.text);
  card.append(text);

  if (controls.meta.checked) {
    // create related paragraph
    if (thisCard.related && thisCard.related.length > 0) {
      let related = document.createElement("p");
      related.classList.add("related")
      related.innerHTML = thisCard.related.join(", ");

      card.append(related);
    }
  
    // create timestamp paragraph
    let timestamp = document.createElement("p");
    timestamp.classList.add("timestamp");
    let date = new Date(thisCard.date);
    timestamp.append(date.toLocaleTimeString() + " • " + date.toLocaleDateString());

    menu.append(timestamp);
  }
  
  if (controls.tools.checked) {
    // create edit button
    let edit = document.createElement("button");
    edit.innerHTML = "edit";
    edit.id = thisCard.id;
    edit.onclick = function() {
      editCard(thisCard.id)
    };
  
    // create delete button
    let remove = document.createElement("button");
    remove.classList.add("trash");
    remove.innerHTML = "trash";
    remove.onclick = function() {
      deleteCard(thisCard.id)
    };

    menu.append(remove);
    menu.append(edit);
  }


  // append menu to card
  card.append(menu);

  // append card to field
  field.append(card);
}


