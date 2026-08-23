const button = document.getElementById("main-button");
const readButton = document.getElementById("read-button");
const letter = document.getElementById("letter");
const paper = document.getElementById("paper");
const paperMessage = document.querySelector(".paper-message");
const collectionButton = document.getElementById("collection-button");
const pageCollection = document.getElementById("page-collection");
const collectionList = document.getElementById("collection-list");
const scene = document.querySelector(".scene");

if (!collectionList) {
  console.error('collectionList element not found');
}

let animation = null;

const positions = [
  "0%",
  "100%",
];

const normalMessages = [
  "i love your voice",
  "i love your smile",
  "i love your laugh",
  "i love your eyes",
  "i love your hair",
  "i love your hands",
  "i love your personality",
  "i love your energy",
  "i love your qualities",
  "i love your humor",
  "i love your jokes",
  "i love your kindness",
  "i love your creativity",
  "i love your brilliance",
  "i love your confidence",
  "i love your courage",
  "i love when you talk",
  "i love when you sing",
  "i love when you show your jealous side",
  "you care about me",
  "you are beautiful",
  "you are cute",
  "you are funny",
  "you are attractive",
  "you are hot",
  "you are adorable",
  "you are talented",
  "you are kind",
  "you are brave",
  "you are unique",
  "you are incredible",
  "you are outstanding",
  "you are fascinating",
  "you are gorgeous",
  "you are lovely",
  "you are marvelous",
  "you are nice",
  "you are pretty",
  "you have a contagious laugh",
  "you are a source of inspiration",
  "you are thoughtful",
  "you are passionate",
  "you are admirable",
  "you are dazzling",
  "you are genuine",
  "you are a true ray of sunshine",
  "you are amazing every day",
  "you are refreshing",
  "you are a wonder",
  "you have a beautiful soul",
  "you are irreplaceable",
  "you are precious",
  "you are terrific",
  "you brighten every room",
  "you make life sweeter",
  "you are a gift",
  "you make me smile",
  "you have the kindest heart",
  "you are wonderfully strong",
  "you are simply amazing",
  "you make moments better",
  "you are full of grace",
  "you are a beautiful person inside and outside",
];

const bonusMessages = [
  "you are the most perfect princess the world ever had",
  "you are you",
  "you love me",
];

const messages = [...normalMessages, ...bonusMessages];

const STORAGE_KEY = "infiniteLettersSeenMessages";

function loadSeenMessages() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

function saveSeenMessages(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    // ignore storage errors
  }
}

function createCollectionItem(message, { seen = false, locked = false } = {}) {
  const item = document.createElement("div");
  item.className = "message-collection";
  item.dataset.message = message;
  if (seen) {
    item.classList.add("seen");
  }
  if (locked) {
    item.classList.add("locked");
  }

  const text = document.createElement("div");
  text.className = "message-collection-text";
  text.textContent = locked ? "Locked bonus message" : message;
  item.appendChild(text);

  if (locked) {
    const lock = document.createElement("div");
    lock.className = "message-lock";
    lock.textContent = "locked";
    item.appendChild(lock);
  }

  return item;
}

function createCategorySection(title, items) {
  const section = document.createElement("div");
  section.className = "message-category";

  const label = document.createElement("div");
  label.className = "message-category-label";
  label.textContent = title;

  const list = document.createElement("div");
  list.className = "message-category-list";
  items.forEach((item) => {
    list.appendChild(item);
  });

  section.appendChild(label);
  section.appendChild(list);
  return section;
}

function renderCollection() {
  const seen = new Set(loadSeenMessages().filter((message) => messages.includes(message)));
  const allNormalSeen = normalMessages.every((message) => seen.has(message));

  collectionList.innerHTML = "";

  const normalSeen = normalMessages.filter((message) => seen.has(message));
  if (normalSeen.length > 0) {
    const normalItems = normalSeen.map((message) => createCollectionItem(message, {
      seen: true,
    }));
    collectionList.appendChild(createCategorySection("Messages", normalItems));
  } else {
    const empty = document.createElement("div");
    empty.className = "collection-empty";
    empty.textContent = "No messages have been registered yet.";
    collectionList.appendChild(empty);
  }

  const bonusItems = bonusMessages.map((message) => createCollectionItem(message, {
    seen: seen.has(message),
    locked: !allNormalSeen && !seen.has(message),
  }));
  collectionList.appendChild(createCategorySection("Bonus", bonusItems));
}

function pickRandomMessage() {
  const seen = new Set(loadSeenMessages());
  const unseenNormal = normalMessages.filter((message) => !seen.has(message));
  if (unseenNormal.length > 0) {
    return unseenNormal[Math.floor(Math.random() * unseenNormal.length)];
  }

  const allNormalSeen = normalMessages.every((message) => seen.has(message));
  if (!allNormalSeen) {
    return null;
  }

  const unseenBonus = bonusMessages.filter((message) => !seen.has(message));
  if (unseenBonus.length === 0) {
    return null;
  }
  return unseenBonus[Math.floor(Math.random() * unseenBonus.length)];
}

function hasUnseenMessages() {
  const seen = new Set(loadSeenMessages());
  const normalUnseen = normalMessages.some((message) => !seen.has(message));
  if (normalUnseen) {
    return true;
  }
  return bonusMessages.some((message) => !seen.has(message));
}

function updateMainButtonState() {
  if (hasUnseenMessages()) {
    button.disabled = false;
    button.textContent = "Open it";
  } else {
    button.disabled = true;
    button.textContent = "No more";
  }
}

button.addEventListener("click", () => {
  // Close collection panel if it is open, then continue normally.
  if (pageCollection.classList.contains("show")) {
    pageCollection.classList.remove("show");
  }

  // If the paper is visible, always reset it.
  if (paper.classList.contains("show")) {
    if (animation) {
      clearInterval(animation);
      animation = null;
    }
    letter.style.backgroundPosition = positions[0] + " 0";
    readButton.classList.remove("show");
    readButton.style.display = "none";
    paper.classList.remove("show");
    updateMainButtonState();
    return;
  }

  if (!hasUnseenMessages()) {
    return;
  }

  let frame = 0;
  paper.classList.remove("show");
  readButton.classList.remove("show");
  readButton.style.display = "none";
  animation = setInterval(() => {
    letter.style.backgroundPosition = positions[frame] + " 0";
    frame++;
    if (frame >= positions.length) {
      clearInterval(animation);
      animation = null;
      letter.style.backgroundPosition = positions[positions.length - 1] + " 0";
      readButton.classList.add("show");
      readButton.style.display = "flex";
    }
  }, 120);
});

readButton.addEventListener("click", () => {
  const message = pickRandomMessage();
  if (!message) {
    button.textContent = "No more";
    return;
  }

  const seen = loadSeenMessages();
  seen.push(message);
  saveSeenMessages(seen);
  renderCollection();

  paperMessage.textContent = message;
  paper.classList.add("show");
  readButton.classList.remove("show");
  readButton.style.display = "none";
  button.textContent = "Store it";
});

collectionButton.addEventListener("click", () => {
  if (pageCollection.classList.contains("show")) {
    pageCollection.classList.remove("show");
    return;
  }

  if (paper.classList.contains("show")) {
    if (animation) {
      clearInterval(animation);
      animation = null;
    }

    letter.style.backgroundPosition = positions[0] + " 0";
    readButton.classList.remove("show");
    readButton.style.display = "none";
    paper.classList.remove("show");
    button.textContent = "Open it";
  }

  pageCollection.classList.add("show");
  collectionList.scrollTop = 0;
});

renderCollection();

// allow clicking a collection message to preview it in the paper area
collectionList.addEventListener("click", (e) => {
  const item = e.target.closest(".message-collection");
  if (!item || item.classList.contains("locked")) return;

  const msg = item.dataset.message;
  if (!msg) return;

  paperMessage.textContent = msg;
  paper.classList.add("show");
  pageCollection.classList.remove("show");
  scene.classList.remove("hide");
  button.textContent = "Store it";
});

updateMainButtonState();const button = document.getElementById("main-button");
const readButton = document.getElementById("read-button");
const letter = document.getElementById("letter");
const paper = document.getElementById("paper");
const paperMessage = document.querySelector(".paper-message");
const collectionButton = document.getElementById("collection-button");
const pageCollection = document.getElementById("page-collection");
const collectionList = document.getElementById("collection-list");
const scene = document.querySelector(".scene");

if (!collectionList) {
  console.error('collectionList element not found');
}

let animation = null;

const positions = [
  "0%",
  "100%",
];

const normalMessages = [
  "i love your voice",
  "i love your smile",
  "i love your laugh",
  "i love your eyes",
  "i love your hair",
  "i love your hands",
  "i love your personality",
  "i love your energy",
  "i love your qualities",
  "i love your humor",
  "i love your jokes",
  "i love your kindness",
  "i love your creativity",
  "i love your brilliance",
  "i love your confidence",
  "i love your courage",
  "i love when you talk",
  "i love when you sing",
  "i love when you show your jealous side",
  "you care about me",
  "you are beautiful",
  "you are cute",
  "you are funny",
  "you are attractive",
  "you are hot",
  "you are adorable",
  "you are talented",
  "you are kind",
  "you are brave",
  "you are unique",
  "you are incredible",
  "you are outstanding",
  "you are fascinating",
  "you are gorgeous",
  "you are lovely",
  "you are marvelous",
  "you are nice",
  "you are pretty",
  "you have a contagious laugh",
  "you are a source of inspiration",
  "you are thoughtful",
  "you are passionate",
  "you are admirable",
  "you are dazzling",
  "you are genuine",
  "you are a true ray of sunshine",
  "you are amazing every day",
  "you are refreshing",
  "you are a wonder",
  "you have a beautiful soul",
  "you are irreplaceable",
  "you are precious",
  "you are terrific",
  "you brighten every room",
  "you make life sweeter",
  "you are a gift",
  "you make me smile",
  "you have the kindest heart",
  "you are wonderfully strong",
  "you are simply amazing",
  "you make moments better",
  "you are full of grace",
  "you are a beautiful person inside and outside",
];

const bonusMessages = [
  "you are the most perfect princess the world ever had",
  "you are you",
  "you love me",
];

const messages = [...normalMessages, ...bonusMessages];

const STORAGE_KEY = "infiniteLettersSeenMessages";

function loadSeenMessages() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

function saveSeenMessages(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    // ignore storage errors
  }
}

function createCollectionItem(message, { seen = false, locked = false } = {}) {
  const item = document.createElement("div");
  item.className = "message-collection";
  item.dataset.message = message;
  if (seen) {
    item.classList.add("seen");
  }
  if (locked) {
    item.classList.add("locked");
  }

  const text = document.createElement("div");
  text.className = "message-collection-text";
  text.textContent = locked ? "Locked bonus message" : message;
  item.appendChild(text);

  if (locked) {
    const lock = document.createElement("div");
    lock.className = "message-lock";
    lock.textContent = "locked";
    item.appendChild(lock);
  }

  return item;
}

function createCategorySection(title, items) {
  const section = document.createElement("div");
  section.className = "message-category";

  const label = document.createElement("div");
  label.className = "message-category-label";
  label.textContent = title;

  const list = document.createElement("div");
  list.className = "message-category-list";
  items.forEach((item) => {
    list.appendChild(item);
  });

  section.appendChild(label);
  section.appendChild(list);
  return section;
}

function renderCollection() {
  const seen = new Set(loadSeenMessages().filter((message) => messages.includes(message)));
  const allNormalSeen = normalMessages.every((message) => seen.has(message));

  collectionList.innerHTML = "";

  const normalSeen = normalMessages.filter((message) => seen.has(message));
  if (normalSeen.length > 0) {
    const normalItems = normalSeen.map((message) => createCollectionItem(message, {
      seen: true,
    }));
    collectionList.appendChild(createCategorySection("Messages", normalItems));
  } else {
    const empty = document.createElement("div");
    empty.className = "collection-empty";
    empty.textContent = "No messages have been registered yet.";
    collectionList.appendChild(empty);
  }

  const bonusItems = bonusMessages.map((message) => createCollectionItem(message, {
    seen: seen.has(message),
    locked: !allNormalSeen && !seen.has(message),
  }));
  collectionList.appendChild(createCategorySection("Bonus", bonusItems));
}

function pickRandomMessage() {
  const seen = new Set(loadSeenMessages());
  const unseenNormal = normalMessages.filter((message) => !seen.has(message));
  if (unseenNormal.length > 0) {
    return unseenNormal[Math.floor(Math.random() * unseenNormal.length)];
  }

  const allNormalSeen = normalMessages.every((message) => seen.has(message));
  if (!allNormalSeen) {
    return null;
  }

  const unseenBonus = bonusMessages.filter((message) => !seen.has(message));
  if (unseenBonus.length === 0) {
    return null;
  }
  return unseenBonus[Math.floor(Math.random() * unseenBonus.length)];
}

function hasUnseenMessages() {
  const seen = new Set(loadSeenMessages());
  const normalUnseen = normalMessages.some((message) => !seen.has(message));
  if (normalUnseen) {
    return true;
  }
  return bonusMessages.some((message) => !seen.has(message));
}

function updateMainButtonState() {
  if (hasUnseenMessages()) {
    button.disabled = false;
    button.textContent = "Open it";
  } else {
    button.disabled = true;
    button.textContent = "No more";
  }
}

button.addEventListener("click", () => {
  // Close collection panel if it is open, then continue normally.
  if (pageCollection.classList.contains("show")) {
    pageCollection.classList.remove("show");
  }

  // If the paper is visible, always reset it.
  if (paper.classList.contains("show")) {
    if (animation) {
      clearInterval(animation);
      animation = null;
    }
    letter.style.backgroundPosition = positions[0] + " 0";
    readButton.classList.remove("show");
    readButton.style.display = "none";
    paper.classList.remove("show");
    updateMainButtonState();
    return;
  }

  if (!hasUnseenMessages()) {
    return;
  }

  let frame = 0;
  paper.classList.remove("show");
  readButton.classList.remove("show");
  readButton.style.display = "none";
  animation = setInterval(() => {
    letter.style.backgroundPosition = positions[frame] + " 0";
    frame++;
    if (frame >= positions.length) {
      clearInterval(animation);
      animation = null;
      letter.style.backgroundPosition = positions[positions.length - 1] + " 0";
      readButton.classList.add("show");
      readButton.style.display = "flex";
    }
  }, 120);
});

readButton.addEventListener("click", () => {
  const message = pickRandomMessage();
  if (!message) {
    button.textContent = "No more";
    return;
  }

  const seen = loadSeenMessages();
  seen.push(message);
  saveSeenMessages(seen);
  renderCollection();

  paperMessage.textContent = message;
  paper.classList.add("show");
  readButton.classList.remove("show");
  readButton.style.display = "none";
  button.textContent = "Store it";
});

collectionButton.addEventListener("click", () => {
  if (pageCollection.classList.contains("show")) {
    pageCollection.classList.remove("show");
    return;
  }

  if (paper.classList.contains("show")) {
    if (animation) {
      clearInterval(animation);
      animation = null;
    }

    letter.style.backgroundPosition = positions[0] + " 0";
    readButton.classList.remove("show");
    readButton.style.display = "none";
    paper.classList.remove("show");
    button.textContent = "Open it";
  }

  pageCollection.classList.add("show");
  collectionList.scrollTop = 0;
});

renderCollection();

// allow clicking a collection message to preview it in the paper area
collectionList.addEventListener("click", (e) => {
  const item = e.target.closest(".message-collection");
  if (!item || item.classList.contains("locked")) return;

  const msg = item.dataset.message;
  if (!msg) return;

  paperMessage.textContent = msg;
  paper.classList.add("show");
  pageCollection.classList.remove("show");
  scene.classList.remove("hide");
  button.textContent = "Store it";
});

updateMainButtonState();
