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

  quotes.push({ text: newText, category: newCategory });
  saveQuotes();          // Save updated quotes
  populateCategories();  // Refresh category dropdown
  filterQuotes();        // Refresh displayed quotes

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

  // Clear old options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  // Get unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  // Add each category as an option
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category
  const lastCategory = localStorage.getItem("lastSelectedCategory");
  if (lastCategory && categories.includes(lastCategory)) {
    categoryFilter.value = lastCategory;
    filterQuotes();
  }
}

// ====== Filter Quotes by Category ======
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;

  // Save selection in localStorage
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

// ====== Initialize on Page Load ======
window.onload = function () {
  loadQuotes();
  populateCategories();
  loadLastQuote();
  filterQuotes();
};
