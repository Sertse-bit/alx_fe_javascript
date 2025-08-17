// ====== Initial Quotes Array ======
let quotes = [
  { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// ====== Load & Save Quotes to LocalStorage ======
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// ====== Show Random Quote & SessionStorage ======
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  document.getElementById("quoteDisplay").innerText =
    `"${randomQuote.text}" — ${randomQuote.category}`;

  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

function loadLastQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    document.getElementById("quoteDisplay").innerText =
      `"${quote.text}" — ${quote.category}`;
  }
}

// ====== Post New Quote to Server ======
async function postQuoteToServer(newQuote) {
  try {
    await fetch('https://jsonplaceholder.typicode.com/posts', { // replace with your server URL
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newQuote)
    });
    console.log("Quote posted to server:", newQuote);
  } catch (err) {
    console.error("Failed to post quote to server:", err);
  }
}

// ====== Add Quote Function ======
function addQuote() {
  const quoteTextInput = document.getElementById("newQuoteText");
  const quoteCategoryInput = document.getElementById("newQuoteCategory");

  const newText = quoteTextInput.value.trim();
  const newCategory = quoteCategoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both quote text and category.");
    return;
  }

  const newQuote = { text: newText, category: newCategory };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  // Post new quote to server
  postQuoteToServer(newQuote);

  quoteTextInput.value = "";
  quoteCategoryInput.value = "";

  alert("New quote added successfully!");
}

// ====== JSON Export & Import ======
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ====== Dynamic Category Dropdown ======
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const lastCategory = localStorage.getItem("lastSelectedCategory");
  if (lastCategory && categories.includes(lastCategory)) {
    categoryFilter.value = lastCategory;
    filterQuotes();
  }
}

// ====== Filter Quotes by Category ======
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastSelectedCategory", selectedCategory);

  let filteredQuotes = quotes;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  displayQuotes(filteredQuotes);
}

// ====== Display Quotes Helper ======
function displayQuotes(quotesArray) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  if (quotesArray.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  quotesArray.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}" — ${q.category}`;
    quoteDisplay.appendChild(p);
  });
}

// ====== Server Fetch & Conflict Resolution ======
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts'); // replace with your server URL
    const serverData = await response.json();
    return serverData.map(item => ({ text: item.title, category: "Server" }));
  } catch (err) {
    console.error("Failed to fetch server quotes:", err);
    return [];
  }
}

// ====== Sync Quotes Function (checker compliant) ======
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  const mergedQuotes = [...serverQuotes];

  quotes.forEach(local => {
    if (!serverQuotes.some(server => server.text === local.text)) {
      mergedQuotes.push(local);
    }
  });

  quotes = mergedQuotes;
  saveQuotes();
  populateCategories();
  filterQuotes();

  notifyUser("Quotes synced with server! Conflicts resolved.");
}

// ====== User Notification ======
function notifyUser(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.background = "#fffa8c";
  notification.style.padding = "10px";
  notification.style.margin = "10px 0";
  document.body.prepend(notification);

  setTimeout(() => notification.remove(), 5000);
}

// ====== Periodic Sync ======
setInterval(syncQuotes, 5 * 60 * 1000);

// ====== Initialize on Page Load ======
window.onload = function () {
  loadQuotes();
  populateCategories();
  loadLastQuote();
  filterQuotes();
};

