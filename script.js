/* -----------------------------------------
   PAGE NAVIGATION / ROUTING
------------------------------------------*/

// redirect function helper
function goTo(page) {
    window.location.href = page;
}

/* -------- WELCOME PAGE BUTTONS -------- */
const signupBtn = document.getElementById("signup-btn");
if (signupBtn) signupBtn.onclick = () => goTo("signup.html");

const loginBtn = document.getElementById("login-btn");
if (loginBtn) loginBtn.onclick = () => goTo("login.html");

const contactBtn = document.getElementById("contact-btn");
if (contactBtn) contactBtn.onclick = () => goTo("contact.html");


/* -------- BACK BUTTONS (Signup / Login / Contact) -------- */
const backToWelcome = document.getElementById("back-to-welcome");
if (backToWelcome) backToWelcome.onclick = () => goTo("index.html");


/* -----------------------------------------
   USER SIGN-UP
------------------------------------------*/

const signupForm = document.getElementById("signup-form");

if (signupForm) {
    signupForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const fullName = document.getElementById("fullname-input").value.trim();
        const username = document.getElementById("username-input").value.trim();
        const email = document.getElementById("email-input").value.trim();
        const password = document.getElementById("password-input").value.trim();

        if (!fullName || !username || !email || !password) {
            alert("Please fill all fields.");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];

        // check if username taken
        if (users.some(u => u.username === username)) {
            alert("Username already exists. Choose another.");
            return;
        }

        // save user
        users.push({
            fullName,
            username,
            email,
            password
        });

        localStorage.setItem("users", JSON.stringify(users));

        alert("Account created successfully!");
        window.location.href = "login.html";
    });
}


// "Already have account? Login"
const goLogin = document.getElementById("go-login");
if (goLogin) goLogin.onclick = () => goTo("login.html");

/* -----------------------------------------
   USER LOGIN + SESSION
------------------------------------------*/

const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value.trim();
        const errorBox = document.getElementById("login-error-msg");

        let users = JSON.parse(localStorage.getItem("users")) || [];

        const user = users.find(
            u => u.username === username && u.password === password
        );

        if (!user) {
            errorBox.textContent = "Invalid username or password.";
            return;
        }

        // set session
        localStorage.setItem("currentUser", username);

        window.location.href = "dashboard.html";
    });
}

/* -----------------------------------------
   DARK / LIGHT MODE
------------------------------------------*/

const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {
    // load theme
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "☀";
    }

    themeToggle.onclick = () => {
        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            themeToggle.textContent = "☀";
            localStorage.setItem("theme", "dark");
        } else {
            themeToggle.textContent = "☾";
            localStorage.setItem("theme", "light");
        }
    };
}

/* -----------------------------------------
   EXPENSE SYSTEM + ADD EXPENSE MODAL
------------------------------------------*/

const currentUser = localStorage.getItem("currentUser");

// redirect to login if not logged in
if (window.location.pathname.includes("dashboard") && !currentUser) {
    window.location.href = "login.html";
}

/* ----- Open Modal ----- */
const addExpenseBtn = document.getElementById("add-expense-btn");
const addExpenseModal = document.getElementById("add-expense-modal");

if (addExpenseBtn) {
    addExpenseBtn.onclick = () => {
        addExpenseModal.classList.remove("hidden");
    };
}

/* ----- Close Modal ----- */
const modalCancel = document.getElementById("modal-cancel");
if (modalCancel) {
    modalCancel.onclick = () => {
        addExpenseModal.classList.add("hidden");
    };
}


/* ----- Save Expense ----- */
const modalSave = document.getElementById("modal-save");

if (modalSave) {
    modalSave.onclick = () => {

        const title = document.getElementById("expense-title").value.trim();
        const amount = document.getElementById("expense-amount").value.trim();
        const category = document.getElementById("expense-category").value;
        const date = document.getElementById("expense-date").value;
        const time = document.getElementById("expense-time").value;
        const note = document.getElementById("expense-note").value.trim();

        if (!title || !amount || !category || !date) {
            alert("Please fill required fields.");
            return;
        }

        const expense = {
            id: Date.now(),
            title,
            amount: Number(amount),
            category,
            date,
            time: time || "",
            note
        };

        let expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser}`)) || [];
        expenses.push(expense);

        localStorage.setItem(`expenses_${currentUser}`, JSON.stringify(expenses));

        alert("Expense added!");
        addExpenseModal.classList.add("hidden");

        // reload dashboard to update cards + charts + last 5
        window.location.reload();
    };
}


/* ----- CATEGORY OPTIONS ----- */
const expenseCategory = document.getElementById("expense-category");

if (expenseCategory) {
    const categories = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Other"];
    categories.forEach(cat => {
        let opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        expenseCategory.appendChild(opt);
    });
}

/* -----------------------------------------
   DASHBOARD SUMMARY CARDS
------------------------------------------*/

function loadDashboard() {
    if (!window.location.pathname.includes("dashboard")) return;

    const usernameDisplay = document.getElementById("username-display");
    if (usernameDisplay) usernameDisplay.textContent = currentUser;

    let expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser}`)) || [];

    // apply filters if selected
    const month = document.getElementById("month-filter").value;
    const category = document.getElementById("category-filter").value;

    if (month) {
        expenses = expenses.filter(e => e.date.slice(5,7) === month);
    }

    if (category && category !== "All") {
        expenses = expenses.filter(e => e.category === category);
    }

    // summary totals
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const transactions = expenses.length;

    // highest category
    let categoryTotals = {};
    expenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
    });

    let highestCat = "None";
    let highestValue = 0;

    for (let cat in categoryTotals) {
        if (categoryTotals[cat] > highestValue) {
            highestValue = categoryTotals[cat];
            highestCat = cat;
        }
    }

    // display summary
    document.getElementById("summary-total").textContent =
        `Total Spent: ₹${total}`;

    document.getElementById("summary-transactions").textContent =
        `Transactions: ${transactions}`;

    document.getElementById("summary-highest-category").textContent =
        `Highest Category: ${highestCat}`;
}

/* -----------------------------------------
   FILTERS: LOAD MONTHS + CATEGORIES
------------------------------------------*/

// populate month dropdown (01–12)
function loadMonthFilter() {
    const monthFilter = document.getElementById("month-filter");
    if (!monthFilter) return;

    monthFilter.innerHTML = `<option value="">All Months</option>`;

    for (let i = 1; i <= 12; i++) {
        const m = i.toString().padStart(2, '0');
        monthFilter.innerHTML += `<option value="${m}">${m}</option>`;
    }

    monthFilter.onchange = () => loadDashboard();
}

// populate category filter
function loadCategoryFilter() {
    const catFilter = document.getElementById("category-filter");
    if (!catFilter) return;

    const categories = ["All", "Food", "Travel", "Shopping", "Bills", "Entertainment", "Other"];

    categories.forEach(c => {
        let opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        catFilter.appendChild(opt);
    });

    catFilter.onchange = () => loadDashboard();
}

loadMonthFilter();
loadCategoryFilter();

/* -----------------------------------------
   PIE CHART + LINE CHART
------------------------------------------*/

let pieChart, lineChart;

function loadCharts() {
    if (!document.getElementById("pie-chart")) return;

    let expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser}`)) || [];

    const month = document.getElementById("month-filter").value;
    const category = document.getElementById("category-filter").value;

    if (month) expenses = expenses.filter(e => e.date.slice(5,7) === month);
    if (category && category !== "All") expenses = expenses.filter(e => e.category === category);

    /* ----- PIE CHART (Category Distribution) ----- */

    let categoryTotals = {};
    expenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
    });

    const pieLabels = Object.keys(categoryTotals);
    const pieData = Object.values(categoryTotals);

    if (pieChart) pieChart.destroy();

    pieChart = new Chart(document.getElementById("pie-chart"), {
        type: "pie",
        data: {
            labels: pieLabels,
            datasets: [{
                data: pieData,
                backgroundColor: [
                    "#A78BFA", "#c084fc", "#f472b6", "#86efac", "#93c5fd", "#fbcfe8"
                ]
            }]
        }
    });

    /* ----- LINE CHART (Month-wise totals) ----- */

    let monthTotals = Array(12).fill(0);

    JSON.parse(localStorage.getItem(`expenses_${currentUser}`))?.forEach(e => {
        const m = Number(e.date.slice(5,7)) - 1;
        monthTotals[m] += Number(e.amount);
    });

    if (lineChart) lineChart.destroy();

    lineChart = new Chart(document.getElementById("line-chart"), {
        type: "line",
        data: {
            labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
            datasets: [{
                label: "Monthly Spending",
                data: monthTotals,
                borderColor: "#A78BFA",
                backgroundColor: "rgba(167,139,250,0.3)",
                tension: 0.3
            }]
        }
    });
}

/* -----------------------------------------
   LAST 5 TRANSACTIONS
------------------------------------------*/

function loadLastFive() {
    const table = document.getElementById("last5-table");
    if (!table) return;

    let expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser}`)) || [];

    expenses.sort((a, b) => b.id - a.id);

    let lastFive = expenses.slice(0, 5);

    table.innerHTML = `
        <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Date</th>
        </tr>
    `;

    lastFive.forEach(e => {
        table.innerHTML += `
            <tr>
                <td>${e.title}</td>
                <td>₹${e.amount}</td>
                <td>${e.category}</td>
                <td>${e.date}</td>
            </tr>
        `;
    });
}

/* -----------------------------------------
   ALL EXPENSES PAGE
------------------------------------------*/

function loadExpensesPage() {
    if (!window.location.pathname.includes("expenses.html")) return;

    const monthFilter = document.getElementById("all-month-filter");
    const catFilter = document.getElementById("all-category-filter");
    const tableBody = document.querySelector("#expenses-table tbody");
    const totalBox = document.getElementById("month-total");

    // populate filters
    if (monthFilter.innerHTML === "") {
        monthFilter.innerHTML = `<option value="">All Months</option>`;
        for (let i = 1; i <= 12; i++) {
            let m = i.toString().padStart(2, "0");
            monthFilter.innerHTML += `<option value="${m}">${m}</option>`;
        }
    }

    if (catFilter.innerHTML === "") {
        ["All", "Food", "Travel", "Shopping", "Bills", "Entertainment", "Other"]
        .forEach(c => {
            let op = document.createElement("option");
            op.value = c;
            op.textContent = c;
            catFilter.appendChild(op);
        });
    }

    let expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser}`)) || [];

    // apply filters
    const mo = monthFilter.value;
    const ca = catFilter.value;

    if (mo) expenses = expenses.filter(e => e.date.slice(5,7) === mo);
    if (ca && ca !== "All") expenses = expenses.filter(e => e.category === ca);

    tableBody.innerHTML = "";

    let total = 0;

    expenses.forEach(e => {
        total += Number(e.amount);

        let row = `
            <tr>
                <td>${e.title}</td>
                <td>₹${e.amount}</td>
                <td>${e.category}</td>
                <td>${e.date}</td>
                <td><button onclick="deleteExpense(${e.id})">🗑</button></td>
            </tr>
        `;

        tableBody.innerHTML += row;
    });

    totalBox.textContent = `₹${total}`;
    
    monthFilter.onchange = loadExpensesPage;
    catFilter.onchange = loadExpensesPage;
}


/* ----- DELETE EXPENSE ----- */
function deleteExpense(id) {
    let expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser}`)) || [];
    expenses = expenses.filter(e => e.id !== id);
    localStorage.setItem(`expenses_${currentUser}`, JSON.stringify(expenses));

    loadExpensesPage();
    alert("Expense deleted.");
}

/* ---------------------------
   CLIENT: Backup -> Google Sheets
----------------------------*/
const BACKUP_ENDPOINT = "/api/backup.js"; // replace

async function backupToGoogleSheets() {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) { alert("Please log in to backup."); return; }

  const expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser}`)) || [];

  if (!expenses.length) {
    alert("No expenses to backup.");
    return;
  }

  const payload = {
    username: currentUser,
    expenses: expenses
  };

  try {
    const res = await fetch(BACKUP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data && data.status === "success") {
      alert("Backup successful! " + (data.rows_added ? `${data.rows_added} rows added.` : ""));
    } else {
      alert("Backup failed. Try again later.");
      console.error("Backup error:", data);
    }
  } catch (err) {
    console.error(err);
    alert("Backup request failed. Check your internet connection or endpoint.");
  }
}

/* ---------------------------
   CLIENT: Contact form -> Google Sheets
----------------------------*/
const CONTACT_ENDPOINT = "https://script.google.com/macros/s/AKfycbzfw0PYI_x3WJZQniBNcwLhBYCUPF6H30X8RxlSy055BkO_JLV3zdI0CSOhBcAuSJT3rQ/exec"; // replace

async function sendContactMessage(e) {
  // e is optional if you call directly; otherwise handle from form submit
  if (e && e.preventDefault) e.preventDefault();

  const name = document.getElementById("contact-name").value?.trim();
  const email = document.getElementById("contact-email").value?.trim();
  const message = document.getElementById("contact-message").value?.trim();
  const successMsg = document.getElementById("contact-success-msg");

  if (!name || !email || !message) {
    alert("Please fill all fields.");
    return;
  }

  const payload = { full_name: name, email, message };

  try {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data && data.status === "success") {
      successMsg.textContent = "Message sent — thank you!";
      // clear form
      document.getElementById("contact-form").reset();
      setTimeout(() => successMsg.textContent = "", 3500);
    } else {
      alert("Failed to send message. Try again later.");
      console.error("Contact error:", data);
    }
  } catch (err) {
    console.error(err);
    alert("Contact request failed. Check your internet connection or endpoint.");
  }
}

// Hook contact form submit (if not already)
const contactForm = document.getElementById("contact-form");
if (contactForm) contactForm.addEventListener("submit", sendContactMessage);

// Hook backup button (if not already)
const backupBtn = document.getElementById("backup-btn");
if (backupBtn) backupBtn.addEventListener("click", backupToGoogleSheets);


// auto-run features on page load
window.onload = function() {
    loadDashboard();
    loadCharts();
    loadLastFive();
    loadExpensesPage();
};


/* -------------------------------------------------------
   FINAL FIX: ENSURE LOGOUT + MODAL CANCEL ALWAYS WORK
---------------------------------------------------------*/

document.addEventListener("DOMContentLoaded", () => {

    /* ----- LOGOUT BUTTON FIX ----- */
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        };
    }

    /* ----- MODAL CANCEL FIX ----- */
    const modal = document.getElementById("add-expense-modal");
    const cancelBtn = document.getElementById("modal-cancel");

    if (modal && cancelBtn) {
        cancelBtn.onclick = () => {
            modal.classList.add("hidden");
        };
    }

});
