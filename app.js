// State
let transactions = JSON.parse(localStorage.getItem('dompetku_transactions')) || [];
let oldBudget = JSON.parse(localStorage.getItem('dompetku_budget'));
let budgetCash = JSON.parse(localStorage.getItem('dompetku_budget_cash')) || 0;
let budgetMandiri = JSON.parse(localStorage.getItem('dompetku_budget_mandiri')) || 0;
let budgetBni = JSON.parse(localStorage.getItem('dompetku_budget_bni')) || 0;
let budgetDana = JSON.parse(localStorage.getItem('dompetku_budget_dana')) || 0;
let budgetShopeepay = JSON.parse(localStorage.getItem('dompetku_budget_shopeepay')) || 0;

// Savings State
let totalSavings = JSON.parse(localStorage.getItem('dompetku_savings')) || 0;
let savingsHistory = JSON.parse(localStorage.getItem('dompetku_savings_history')) || [];
let savingsUsageHistory = JSON.parse(localStorage.getItem('dompetku_savings_usage_history')) || [];

if (oldBudget !== null) {
    budgetCash = oldBudget;
    localStorage.setItem('dompetku_budget_cash', JSON.stringify(budgetCash));
    localStorage.removeItem('dompetku_budget');
}

let oldQris = JSON.parse(localStorage.getItem('dompetku_budget_qris'));
if (oldQris !== null) {
    budgetMandiri += oldQris;
    localStorage.setItem('dompetku_budget_mandiri', JSON.stringify(budgetMandiri));
    localStorage.removeItem('dompetku_budget_qris');
}

let budgetHistory = JSON.parse(localStorage.getItem('dompetku_budget_history')) || [];
let expenseChartInstance = null;
let barChartInstance = null;

// DOM Elements
const balanceAmount = document.getElementById('balanceAmount');
const budgetAmount = document.getElementById('budgetAmount');
const expenseAmount = document.getElementById('expenseAmount');
const budgetProgress = document.getElementById('budgetProgress');
const balanceCash = document.getElementById('balanceCash');
const balanceMandiri = document.getElementById('balanceMandiri');
const balanceBni = document.getElementById('balanceBni');
const balanceDana = document.getElementById('balanceDana');
const balanceShopeepay = document.getElementById('balanceShopeepay');
const budgetTotalCash = document.getElementById('budgetTotalCash');
const budgetTotalMandiri = document.getElementById('budgetTotalMandiri');
const budgetTotalBni = document.getElementById('budgetTotalBni');
const budgetTotalDana = document.getElementById('budgetTotalDana');
const budgetTotalShopeepay = document.getElementById('budgetTotalShopeepay');
const transactionForm = document.getElementById('transactionForm');
const transactionList = document.getElementById('transactionList');
const emptyState = document.getElementById('emptyState');
const filterMonth = document.getElementById('filterMonth');

const budgetModal = document.getElementById('budgetModal');
const setBudgetBtn = document.getElementById('setBudgetBtn');
const closeModalBtn = document.getElementById('closeModal');
const budgetForm = document.getElementById('budgetForm');

const addBudgetModal = document.getElementById('addBudgetModal');
const addBudgetBtn = document.getElementById('addBudgetBtn');
const closeAddBudgetModalBtn = document.getElementById('closeAddBudgetModal');
const addBudgetForm = document.getElementById('addBudgetForm');
const budgetHistoryList = document.getElementById('budgetHistoryList');
const emptyBudgetHistory = document.getElementById('emptyBudgetHistory');

const transferModal = document.getElementById('transferModal');
const transferBtn = document.getElementById('transferBtn');
const closeTransferModalBtn = document.getElementById('closeTransferModal');
const transferForm = document.getElementById('transferForm');

// Savings Elements
const settingsBtn = document.getElementById('setBudgetBtn');
const savingsModal = document.getElementById('savingsModal');
const addSavingsBtn = document.getElementById('addSavingsBtn');
const closeSavingsModalBtn = document.getElementById('closeSavingsModal');
const savingsForm = document.getElementById('savingsForm');

const useSavingsModal = document.getElementById('useSavingsModal');
const useSavingsBtn = document.getElementById('useSavingsBtn');
const closeUseSavingsModalBtn = document.getElementById('closeUseSavingsModal');
const useSavingsForm = document.getElementById('useSavingsForm');

const totalSavingsAmount = document.getElementById('totalSavingsAmount');
const savingsHistoryList = document.getElementById('savingsHistoryList');
const emptySavingsState = document.getElementById('emptySavingsState');
const savingsUsageHistoryList = document.getElementById('savingsUsageHistoryList');
const emptyUsageState = document.getElementById('emptyUsageState');

// Navigation Elements
const navItems = document.querySelectorAll('.nav-item');
const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
const pages = document.querySelectorAll('.page');

// Initialization
function init() {
    // Populate month filter
    populateMonthFilter();
    
    // Set date input to today by default
    document.getElementById('date').valueAsDate = new Date();

    // Event Listeners
    transactionForm.addEventListener('submit', addTransaction);
    budgetForm.addEventListener('submit', setBudget);
    setBudgetBtn.addEventListener('click', () => {
        document.getElementById('budgetCashInput').value = budgetCash;
        document.getElementById('budgetMandiriInput').value = budgetMandiri;
        document.getElementById('budgetBniInput').value = budgetBni;
        document.getElementById('budgetDanaInput').value = budgetDana;
        document.getElementById('budgetShopeepayInput').value = budgetShopeepay;
        budgetModal.classList.add('active');
    });
    closeModalBtn.addEventListener('click', () => budgetModal.classList.remove('active'));
    
    addBudgetForm.addEventListener('submit', addAdditionalBudget);
    addBudgetBtn.addEventListener('click', () => addBudgetModal.classList.add('active'));
    closeAddBudgetModalBtn.addEventListener('click', () => addBudgetModal.classList.remove('active'));

    transferForm.addEventListener('submit', transferBudget);
    transferBtn.addEventListener('click', () => transferModal.classList.add('active'));
    closeTransferModalBtn.addEventListener('click', () => transferModal.classList.remove('active'));

    // Savings Listeners
    savingsForm.addEventListener('submit', handleSavings);
    if(addSavingsBtn) addSavingsBtn.addEventListener('click', () => savingsModal.classList.add('active'));
    if(closeSavingsModalBtn) closeSavingsModalBtn.addEventListener('click', () => savingsModal.classList.remove('active'));

    useSavingsForm.addEventListener('submit', handleUseSavings);
    if(useSavingsBtn) useSavingsBtn.addEventListener('click', () => useSavingsModal.classList.add('active'));
    if(closeUseSavingsModalBtn) closeUseSavingsModalBtn.addEventListener('click', () => useSavingsModal.classList.remove('active'));

    // Navigation Listeners
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-target');
            switchPage(target);
        });
    });

    mobileNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-target');
            switchPage(target);
        });
    });

    filterMonth.addEventListener('change', updateUI);

    renderBudgetHistory();
    updateSavingsUI();
    updateUI();

    // Hide Splash Screen
    window.addEventListener('load', () => {
        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.classList.add('hidden');
            }
        }, 1500); // 1.5 second delay for premium feel
    });
}

function switchPage(pageId) {
    // Update Nav
    navItems.forEach(nav => {
        if(nav.getAttribute('data-target') === pageId) nav.classList.add('active');
        else nav.classList.remove('active');
    });

    // Update Mobile Nav
    mobileNavItems.forEach(nav => {
        if(nav.getAttribute('data-target') === pageId) nav.classList.add('active');
        else nav.classList.remove('active');
    });

    // Update Pages
    pages.forEach(page => {
        if(page.id === pageId) page.classList.add('active');
        else page.classList.remove('active');
    });

    if(pageId === 'dashboard-page') {
        updateUI();
    } else if(pageId === 'savings-page') {
        updateSavingsUI();
    }
}

// Format Currency IDR
function formatIDR(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Populate Month Filter Based on Transactions + Current Month
function populateMonthFilter() {
    const months = new Set();
    const currentDate = new Date();
    const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    months.add(currentMonthKey);
    
    transactions.forEach(t => {
        const date = new Date(t.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(key);
    });

    // Sort descending
    const sortedMonths = Array.from(months).sort((a, b) => b.localeCompare(a));
    
    filterMonth.innerHTML = '';
    
    const optionAll = document.createElement('option');
    optionAll.value = 'all';
    optionAll.textContent = 'Semua Waktu';
    filterMonth.appendChild(optionAll);

    sortedMonths.forEach(m => {
        const [year, month] = m.split('-');
        const date = new Date(year, parseInt(month) - 1, 1);
        const monthName = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        
        const option = document.createElement('option');
        option.value = m;
        option.textContent = monthName;
        if(m === currentMonthKey) option.selected = true;
        filterMonth.appendChild(option);
    });
}

// Update the whole UI based on selected month
function updateUI() {
    const selectedMonth = filterMonth.value;
    
    // Filter transactions for selected month
    const filteredTransactions = selectedMonth === 'all' ? transactions : transactions.filter(t => {
        const date = new Date(t.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return key === selectedMonth;
    });

    // Calculate totals
    const expenses = { Cash: 0, Mandiri: 0, BNI: 0, DANA: 0, ShopeePay: 0 };
    filteredTransactions.forEach(t => {
        const method = t.paymentMethod || 'Cash';
        if (method === 'QRIS') expenses['Mandiri'] += t.amount;
        else if (expenses[method] !== undefined) expenses[method] += t.amount;
        else expenses['Cash'] += t.amount;
    });

    const totalExpense = Object.values(expenses).reduce((a, b) => a + b, 0);
    const totalBudget = budgetCash + budgetMandiri + budgetBni + budgetDana + budgetShopeepay;
    const balance = totalBudget - totalExpense;
    
    // Update Dashboard DOM
    budgetAmount.innerText = formatIDR(totalBudget);
    expenseAmount.innerText = formatIDR(totalExpense);
    balanceAmount.innerText = formatIDR(balance);
    
    balanceCash.innerText = formatIDR(budgetCash - expenses.Cash);
    balanceMandiri.innerText = formatIDR(budgetMandiri - expenses.Mandiri);
    balanceBni.innerText = formatIDR(budgetBni - expenses.BNI);
    balanceDana.innerText = formatIDR(budgetDana - expenses.DANA);
    balanceShopeepay.innerText = formatIDR(budgetShopeepay - expenses.ShopeePay);

    budgetTotalCash.innerText = formatIDR(budgetCash);
    budgetTotalMandiri.innerText = formatIDR(budgetMandiri);
    budgetTotalBni.innerText = formatIDR(budgetBni);
    budgetTotalDana.innerText = formatIDR(budgetDana);
    budgetTotalShopeepay.innerText = formatIDR(budgetShopeepay);

    // Color balance depending on positive/negative
    if(balance < 0) {
        balanceAmount.classList.remove('positive');
        balanceAmount.classList.add('negative');
    } else {
        balanceAmount.classList.remove('negative');
        balanceAmount.classList.add('positive');
    }

    // Update Progress Bar
    if(totalBudget > 0) {
        const percentage = Math.min((totalExpense / totalBudget) * 100, 100);
        budgetProgress.style.width = percentage + '%';
        
        if(percentage > 90) {
            budgetProgress.style.backgroundColor = 'var(--danger)';
        } else if(percentage > 70) {
            budgetProgress.style.backgroundColor = 'var(--warning)';
        } else {
            budgetProgress.style.backgroundColor = 'var(--success)';
        }
    } else {
        budgetProgress.style.width = '0%';
    }

    // Render Transaction List
    renderTransactions(filteredTransactions);
    
    // Render Chart
    updateChart(filteredTransactions);

    // Update Summary
    updateSummary(filteredTransactions, totalExpense, selectedMonth);
}

// Render Transactions to DOM
function renderTransactions(transactionsList) {
    transactionList.innerHTML = '';
    
    if(transactionsList.length === 0) {
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        
        // Sort by date newest first
        const sorted = [...transactionsList].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sorted.forEach(t => {
            const li = document.createElement('li');
            li.classList.add('transaction-item');
            
            const iconMap = {
                'Makanan': '<i class="fa-solid fa-utensils" style="color: #f59e0b"></i>',
                'Transportasi': '<i class="fa-solid fa-car" style="color: #3b82f6"></i>',
                'Belanja': '<i class="fa-solid fa-cart-shopping" style="color: #ec4899"></i>',
                'Hiburan': '<i class="fa-solid fa-gamepad" style="color: #8b5cf6"></i>',
                'Tagihan': '<i class="fa-solid fa-file-invoice" style="color: #10b981"></i>',
                'Lainnya': '<i class="fa-solid fa-ellipsis" style="color: #94a3b8"></i>'
            };

            li.innerHTML = `
                <div class="trans-left">
                    <div class="trans-icon">
                        ${iconMap[t.category] || iconMap['Lainnya']}
                    </div>
                    <div class="trans-info">
                        <h4>${t.desc} <span class="trans-badge">${
                            (t.paymentMethod === 'Mandiri' || t.paymentMethod === 'BNI') ? `<i class="fa-solid fa-building-columns"></i> ${t.paymentMethod}` : 
                            (t.paymentMethod === 'ShopeePay') ? `<i class="fa-solid fa-bag-shopping"></i> ShopeePay` : 
                            (t.paymentMethod === 'DANA') ? `<i class="fa-solid fa-wallet"></i> DANA` : 
                            (t.paymentMethod === 'QRIS') ? `<i class="fa-solid fa-building-columns"></i> Mandiri (Ex-QRIS)` :
                            `<i class="fa-solid fa-money-bill"></i> Cash`
                        }</span></h4>
                        <p>${new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • ${t.category}</p>
                    </div>
                </div>
                <div class="trans-right">
                    <span class="trans-amount negative">- ${formatIDR(t.amount)}</span>
                    <button class="delete-btn" onclick="deleteTransaction(${t.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            transactionList.appendChild(li);
        });
    }
}

// Add Transaction
function addTransaction(e) {
    e.preventDefault();
    
    const desc = document.getElementById('desc').value;
    const amount = Number(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const category = document.querySelector('input[name="category"]:checked').value;
    const paymentMethodElem = document.querySelector('input[name="paymentOption"]:checked');
    const paymentMethod = paymentMethodElem ? paymentMethodElem.value : 'Cash';

    if(!desc || !amount || !date) return;

    const transaction = {
        id: generateID(),
        desc,
        amount,
        date,
        category,
        paymentMethod
    };

    transactions.push(transaction);
    saveData();
    
    // Check if new month needs to be added to filter
    const dateObj = new Date(date);
    const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    let exists = false;
    for(let option of filterMonth.options) {
        if(option.value === key) exists = true;
    }
    if(!exists) {
        populateMonthFilter();
        filterMonth.value = key; // Switch to the month of the newly added expense
    }

    updateUI();
    
    // Reset form
    document.getElementById('desc').value = '';
    document.getElementById('amount').value = '';
}

// Delete Transaction
window.deleteTransaction = function(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    updateUI();
}

// Set Budget
function setBudget(e) {
    e.preventDefault();
    budgetCash = Number(document.getElementById('budgetCashInput').value);
    budgetMandiri = Number(document.getElementById('budgetMandiriInput').value);
    budgetBni = Number(document.getElementById('budgetBniInput').value);
    budgetDana = Number(document.getElementById('budgetDanaInput').value);
    budgetShopeepay = Number(document.getElementById('budgetShopeepayInput').value);
    
    localStorage.setItem('dompetku_budget_cash', JSON.stringify(budgetCash));
    localStorage.setItem('dompetku_budget_mandiri', JSON.stringify(budgetMandiri));
    localStorage.setItem('dompetku_budget_bni', JSON.stringify(budgetBni));
    localStorage.setItem('dompetku_budget_dana', JSON.stringify(budgetDana));
    localStorage.setItem('dompetku_budget_shopeepay', JSON.stringify(budgetShopeepay));
    
    budgetModal.classList.remove('active');
    updateUI();
}

// Transfer Budget
function transferBudget(e) {
    e.preventDefault();
    const amount = Number(document.getElementById('transferInput').value);
    const from = document.getElementById('transferFrom').value;
    const to = document.getElementById('transferTo').value;
    
    if(amount > 0 && from !== to) {
        if(from === 'Cash') budgetCash -= amount;
        else if(from === 'Mandiri') budgetMandiri -= amount;
        else if(from === 'BNI') budgetBni -= amount;
        else if(from === 'DANA') budgetDana -= amount;
        else if(from === 'ShopeePay') budgetShopeepay -= amount;

        if(to === 'Cash') budgetCash += amount;
        else if(to === 'Mandiri') budgetMandiri += amount;
        else if(to === 'BNI') budgetBni += amount;
        else if(to === 'DANA') budgetDana += amount;
        else if(to === 'ShopeePay') budgetShopeepay += amount;
        
        localStorage.setItem('dompetku_budget_cash', JSON.stringify(budgetCash));
        localStorage.setItem('dompetku_budget_mandiri', JSON.stringify(budgetMandiri));
        localStorage.setItem('dompetku_budget_bni', JSON.stringify(budgetBni));
        localStorage.setItem('dompetku_budget_dana', JSON.stringify(budgetDana));
        localStorage.setItem('dompetku_budget_shopeepay', JSON.stringify(budgetShopeepay));
        
        transferModal.classList.remove('active');
        updateUI();
        document.getElementById('transferInput').value = '';
    }
}

// Add Additional Budget
function addAdditionalBudget(e) {
    e.preventDefault();
    const additionalAmount = Number(document.getElementById('addBudgetInput').value);
    const target = document.getElementById('addBudgetTarget').value;
    
    if(additionalAmount > 0) {
        if(target === 'Cash') budgetCash += additionalAmount;
        else if(target === 'Mandiri') budgetMandiri += additionalAmount;
        else if(target === 'BNI') budgetBni += additionalAmount;
        else if(target === 'DANA') budgetDana += additionalAmount;
        else if(target === 'ShopeePay') budgetShopeepay += additionalAmount;
        
        localStorage.setItem('dompetku_budget_cash', JSON.stringify(budgetCash));
        localStorage.setItem('dompetku_budget_mandiri', JSON.stringify(budgetMandiri));
        localStorage.setItem('dompetku_budget_bni', JSON.stringify(budgetBni));
        localStorage.setItem('dompetku_budget_dana', JSON.stringify(budgetDana));
        localStorage.setItem('dompetku_budget_shopeepay', JSON.stringify(budgetShopeepay));
        
        budgetHistory.push({
            id: generateID(),
            amount: additionalAmount,
            date: new Date().toISOString(),
            target: target
        });
        localStorage.setItem('dompetku_budget_history', JSON.stringify(budgetHistory));
        
        renderBudgetHistory();
        addBudgetModal.classList.remove('active');
        updateUI();
        document.getElementById('addBudgetInput').value = '';
    }
}

// Render Budget History
function renderBudgetHistory() {
    budgetHistoryList.innerHTML = '';
    
    if(budgetHistory.length === 0) {
        emptyBudgetHistory.style.display = 'flex';
    } else {
        emptyBudgetHistory.style.display = 'none';
        
        // Sort by date newest first
        const sorted = [...budgetHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sorted.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('transaction-item');
            li.style.padding = '12px 15px';
            
            li.innerHTML = `
                <div class="trans-left">
                    <div class="trans-icon" style="width: 36px; height: 36px; font-size: 1rem; color: var(--success)">
                        <i class="fa-solid fa-plus"></i>
                    </div>
                    <div class="trans-info">
                        <h4>Top Up Budget <span class="trans-badge">${
                            (item.target === 'Mandiri' || item.target === 'BNI') ? `<i class="fa-solid fa-building-columns"></i> ${item.target}` : 
                            (item.target === 'ShopeePay') ? `<i class="fa-solid fa-bag-shopping"></i> ShopeePay` : 
                            (item.target === 'DANA') ? `<i class="fa-solid fa-wallet"></i> DANA` : 
                            (item.target === 'QRIS') ? `<i class="fa-solid fa-building-columns"></i> Mandiri (Ex-QRIS)` :
                            `<i class="fa-solid fa-money-bill"></i> Cash`
                        }</span></h4>
                        <p style="font-size: 0.75rem;">${new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
                    </div>
                </div>
                <div class="trans-right">
                    <span class="trans-amount positive">+ ${formatIDR(item.amount)}</span>
                    <button class="delete-btn" onclick="deleteBudgetHistory(${item.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            budgetHistoryList.appendChild(li);
        });
    }
}

// Delete Budget History
window.deleteBudgetHistory = function(id) {
    const item = budgetHistory.find(h => h.id === id);
    if(item) {
        const t = item.target === 'QRIS' ? 'Mandiri' : item.target; // handle legacy qris
        if(t === 'Cash') budgetCash = Math.max(0, budgetCash - item.amount);
        else if(t === 'Mandiri') budgetMandiri = Math.max(0, budgetMandiri - item.amount);
        else if(t === 'BNI') budgetBni = Math.max(0, budgetBni - item.amount);
        else if(t === 'DANA') budgetDana = Math.max(0, budgetDana - item.amount);
        else if(t === 'ShopeePay') budgetShopeepay = Math.max(0, budgetShopeepay - item.amount);
        
        localStorage.setItem('dompetku_budget_cash', JSON.stringify(budgetCash));
        localStorage.setItem('dompetku_budget_mandiri', JSON.stringify(budgetMandiri));
        localStorage.setItem('dompetku_budget_bni', JSON.stringify(budgetBni));
        localStorage.setItem('dompetku_budget_dana', JSON.stringify(budgetDana));
        localStorage.setItem('dompetku_budget_shopeepay', JSON.stringify(budgetShopeepay));
        
        budgetHistory = budgetHistory.filter(h => h.id !== id);
        localStorage.setItem('dompetku_budget_history', JSON.stringify(budgetHistory));
        
        renderBudgetHistory();
        updateUI();
    }
}

// Generate Random ID
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Save to LocalStorage
function saveData() {
    localStorage.setItem('dompetku_transactions', JSON.stringify(transactions));
    localStorage.setItem('dompetku_budget_cash', JSON.stringify(budgetCash));
    localStorage.setItem('dompetku_budget_mandiri', JSON.stringify(budgetMandiri));
    localStorage.setItem('dompetku_budget_bni', JSON.stringify(budgetBni));
    localStorage.setItem('dompetku_budget_dana', JSON.stringify(budgetDana));
    localStorage.setItem('dompetku_budget_shopeepay', JSON.stringify(budgetShopeepay));
    localStorage.setItem('dompetku_savings', JSON.stringify(totalSavings));
    localStorage.setItem('dompetku_savings_history', JSON.stringify(savingsHistory));
    localStorage.setItem('dompetku_savings_usage_history', JSON.stringify(savingsUsageHistory));
}

// Savings Functions
function handleSavings(e) {
    e.preventDefault();
    const amount = Number(document.getElementById('savingsInput').value);
    const source = document.getElementById('savingsSource').value;

    if (amount <= 0) return;

    // Deduct from wallet budget
    let canDeduct = false;
    if (source === 'Cash' && budgetCash >= amount) { budgetCash -= amount; canDeduct = true; }
    else if (source === 'Mandiri' && budgetMandiri >= amount) { budgetMandiri -= amount; canDeduct = true; }
    else if (source === 'BNI' && budgetBni >= amount) { budgetBni -= amount; canDeduct = true; }
    else if (source === 'DANA' && budgetDana >= amount) { budgetDana -= amount; canDeduct = true; }
    else if (source === 'ShopeePay' && budgetShopeepay >= amount) { budgetShopeepay -= amount; canDeduct = true; }

    if (!canDeduct) {
        alert('Saldo di dompet ' + source + ' tidak mencukupi untuk ditabung!');
        return;
    }

    // Add to savings
    totalSavings += amount;
    savingsHistory.push({
        id: generateID(),
        amount,
        source,
        date: new Date().toISOString()
    });

    saveData();
    updateUI();
    updateSavingsUI();
    
    // Reset & Close
    document.getElementById('savingsInput').value = '';
    savingsModal.classList.remove('active');
}

function handleUseSavings(e) {
    e.preventDefault();
    const amount = Number(document.getElementById('useSavingsInput').value);
    const target = document.getElementById('useSavingsTarget').value;

    if (amount <= 0) return;
    if (amount > totalSavings) {
        alert('Saldo tabungan tidak mencukupi!');
        return;
    }

    // Add back to wallet budget
    if (target === 'Cash') budgetCash += amount;
    else if (target === 'Mandiri') budgetMandiri += amount;
    else if (target === 'BNI') budgetBni += amount;
    else if (target === 'DANA') budgetDana += amount;
    else if (target === 'ShopeePay') budgetShopeepay += amount;

    // Deduct from savings
    totalSavings -= amount;
    savingsUsageHistory.push({
        id: generateID(),
        amount,
        target,
        date: new Date().toISOString()
    });

    saveData();
    updateUI();
    updateSavingsUI();
    
    // Reset & Close
    document.getElementById('useSavingsInput').value = '';
    useSavingsModal.classList.remove('active');
}

function updateSavingsUI() {
    if(!totalSavingsAmount) return;
    
    totalSavingsAmount.innerText = formatIDR(totalSavings);
    renderSavingsHistory();
    renderSavingsUsageHistory();
}

function renderSavingsHistory() {
    if(!savingsHistoryList) return;
    savingsHistoryList.innerHTML = '';

    if (savingsHistory.length === 0) {
        emptySavingsState.style.display = 'flex';
    } else {
        emptySavingsState.style.display = 'none';
        
        const sorted = [...savingsHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

        sorted.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('transaction-item');
            
            const iconMap = {
                'Mandiri': '<i class="fa-solid fa-building-columns"></i>',
                'BNI': '<i class="fa-solid fa-building-columns"></i>',
                'DANA': '<i class="fa-solid fa-wallet"></i>',
                'ShopeePay': '<i class="fa-solid fa-bag-shopping"></i>',
                'Cash': '<i class="fa-solid fa-money-bill"></i>'
            };

            li.innerHTML = `
                <div class="trans-left">
                    <div class="trans-icon" style="color: var(--success)">
                        <i class="fa-solid fa-piggy-bank"></i>
                    </div>
                    <div class="trans-info">
                        <h4>Menabung <span class="trans-badge">${iconMap[item.source] || ''} ${item.source}</span></h4>
                        <p>${new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
                    </div>
                </div>
                <div class="trans-right">
                    <span class="trans-amount positive">+ ${formatIDR(item.amount)}</span>
                </div>
            `;
            savingsHistoryList.appendChild(li);
        });
    }
}
function renderSavingsUsageHistory() {
    if(!savingsUsageHistoryList) return;
    savingsUsageHistoryList.innerHTML = '';

    if (savingsUsageHistory.length === 0) {
        emptyUsageState.style.display = 'flex';
    } else {
        emptyUsageState.style.display = 'none';
        
        const sorted = [...savingsUsageHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

        sorted.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('transaction-item');
            
            const iconMap = {
                'Mandiri': '<i class="fa-solid fa-building-columns"></i>',
                'BNI': '<i class="fa-solid fa-building-columns"></i>',
                'DANA': '<i class="fa-solid fa-wallet"></i>',
                'ShopeePay': '<i class="fa-solid fa-bag-shopping"></i>',
                'Cash': '<i class="fa-solid fa-money-bill"></i>'
            };

            li.innerHTML = `
                <div class="trans-left">
                    <div class="trans-icon" style="color: var(--danger)">
                        <i class="fa-solid fa-hand-holding-dollar"></i>
                    </div>
                    <div class="trans-info">
                        <h4>Pakai Tabungan <span class="trans-badge">${iconMap[item.target] || ''} ${item.target}</span></h4>
                        <p>${new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
                    </div>
                </div>
                <div class="trans-right">
                    <span class="trans-amount negative">- ${formatIDR(item.amount)}</span>
                </div>
            `;
            savingsUsageHistoryList.appendChild(li);
        });
    }
}

// Update Summary Stats
function updateSummary(filteredTransactions, totalExpense, selectedMonth) {
    const avgDailyElement = document.getElementById('avgDaily');
    const topCategoryElement = document.getElementById('topCategory');
    const topTransactionElement = document.getElementById('topTransaction');
    const safeDailyElement = document.getElementById('safeDaily');

    let daysInMonth = 31;
    let year = new Date().getFullYear();
    let monthIndex = new Date().getMonth();
    
    if (selectedMonth && selectedMonth !== 'all') {
        const parts = selectedMonth.split('-');
        year = parseInt(parts[0]);
        monthIndex = parseInt(parts[1]) - 1;
        daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    }
    
    // Calculate Safe Daily Limit
    const today = new Date();
    const isCurrentMonth = selectedMonth !== 'all' && year === today.getFullYear() && monthIndex === today.getMonth();
    
    if (isCurrentMonth) {
        const todayDate = today.getDate();
        const sisaHari = Math.max(1, daysInMonth - todayDate + 1); // +1 to include today
        const sisaBudget = (budgetCash + budgetMandiri + budgetBni + budgetDana + budgetShopeepay) - totalExpense;
        
        const limit = sisaBudget > 0 ? sisaBudget / sisaHari : 0;
        if (safeDailyElement) safeDailyElement.innerText = formatIDR(limit);
    } else {
        if (safeDailyElement) safeDailyElement.innerText = "-";
    }

    let totalDaysForAvg = daysInMonth;
    if (selectedMonth === 'all' && filteredTransactions.length > 0) {
        const dates = filteredTransactions.map(t => new Date(t.date));
        const minDate = new Date(Math.min(...dates));
        const diffTime = Math.abs(today - minDate);
        totalDaysForAvg = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } else if (selectedMonth === 'all') {
        totalDaysForAvg = 1;
    }

    const avgDaily = totalExpense / totalDaysForAvg;
    avgDailyElement.innerText = formatIDR(avgDaily);

    if (filteredTransactions.length === 0) {
        topCategoryElement.innerText = "-";
        topTransactionElement.innerText = "-";
        return;
    }

    const categoryTotals = {};
    filteredTransactions.forEach(t => {
        if(categoryTotals[t.category]) {
            categoryTotals[t.category] += t.amount;
        } else {
            categoryTotals[t.category] = t.amount;
        }
    });
    
    let topCat = "-";
    let maxCatVal = 0;
    for (let cat in categoryTotals) {
        if (categoryTotals[cat] > maxCatVal) {
            maxCatVal = categoryTotals[cat];
            topCat = cat;
        }
    }
    topCategoryElement.innerText = topCat;

    let topTrans = filteredTransactions[0];
    filteredTransactions.forEach(t => {
        if (t.amount > topTrans.amount) {
            topTrans = t;
        }
    });
    topTransactionElement.innerText = formatIDR(topTrans.amount);
}

// Chart.js Setup
function updateChart(filteredTransactions) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    const totalBudget = budgetCash + budgetMandiri + budgetBni + budgetDana + budgetShopeepay;
    let totalExpense = 0;

    // Aggregate by category
    const categoryTotals = {};
    filteredTransactions.forEach(t => {
        if(categoryTotals[t.category]) {
            categoryTotals[t.category] += t.amount;
        } else {
            categoryTotals[t.category] = t.amount;
        }
        totalExpense += t.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    // Color definitions
    const colorMap = {
        'Makanan': '#f59e0b',
        'Transportasi': '#3b82f6',
        'Belanja': '#ec4899',
        'Hiburan': '#8b5cf6',
        'Tagihan': '#10b981',
        'Lainnya': '#94a3b8'
    };
    
    const backgroundColors = labels.map(label => colorMap[label] || colorMap['Lainnya']);

    if (totalBudget > 0) {
        const sisaBudget = Math.max(0, totalBudget - totalExpense);
        if (sisaBudget > 0) {
            labels.push('Sisa Budget');
            data.push(sisaBudget);
            backgroundColors.push('rgba(255, 255, 255, 0.15)'); // Gray color for unspent budget
        }
    }

    if(expenseChartInstance) {
        expenseChartInstance.destroy();
    }

    // Default configuration for Chart.js text styling
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    expenseChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#f8fafc',
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f8fafc',
                    bodyColor: '#f8fafc',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += formatIDR(context.parsed);
                                if (totalBudget > 0) {
                                    const percentage = ((context.parsed / totalBudget) * 100).toFixed(1);
                                    label += ` (${percentage}%)`;
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            cutout: '75%'
        }
    });

    // --- BAR CHART SETUP (Daily Trend) ---
    const barCtx = document.getElementById('barChart').getContext('2d');
    
    const dailyTotals = {};
    const selectedMonth = filterMonth.value; 
    
    if (selectedMonth === 'all') {
        // Group by Month if All Time
        filteredTransactions.forEach(t => {
            const d = new Date(t.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if(dailyTotals[key]) dailyTotals[key] += t.amount;
            else dailyTotals[key] = t.amount;
        });
        
        var barLabels = Object.keys(dailyTotals).sort();
        var barData = barLabels.map(k => dailyTotals[k]);
    } else {
        let daysInMonth = 31;
        let year = new Date().getFullYear();
        let monthIndex = new Date().getMonth();
        
        if (selectedMonth) {
            const parts = selectedMonth.split('-');
            year = parseInt(parts[0]);
            monthIndex = parseInt(parts[1]) - 1;
            daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        }
        
        for(let i = 1; i <= daysInMonth; i++) {
            const dayStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            dailyTotals[dayStr] = 0;
        }

        filteredTransactions.forEach(t => {
            const dateStr = t.date; 
            if(dailyTotals[dateStr] !== undefined) {
                dailyTotals[dateStr] += t.amount;
            } else {
                dailyTotals[dateStr] = t.amount;
            }
        });

        var barLabels = Object.keys(dailyTotals).map(date => {
            return parseInt(date.split('-')[2]).toString(); 
        });
        var barData = Object.values(dailyTotals);
    }

    if(barChartInstance) {
        barChartInstance.destroy();
    }

    barChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: barLabels,
            datasets: [{
                label: 'Pengeluaran',
                data: barData,
                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                borderColor: '#8b5cf6',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value === 0) return '0';
                            if (value >= 1000000) return 'Rp ' + (value / 1000000) + 'jt';
                            return 'Rp ' + (value / 1000) + 'k';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f8fafc',
                    bodyColor: '#f8fafc',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        title: function(context) {
                            if (document.getElementById('filterMonth').value === 'all') {
                                const parts = context[0].label.split('-');
                                const d = new Date(parts[0], parseInt(parts[1]) - 1, 1);
                                return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                            }
                            const day = context[0].label;
                            let monthName = "";
                            if (document.getElementById('filterMonth').options.length > 0) {
                                monthName = document.getElementById('filterMonth').options[document.getElementById('filterMonth').selectedIndex].text;
                            } else {
                                monthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                            }
                            return `${day} ${monthName}`;
                        },
                        label: function(context) {
                            return ' ' + formatIDR(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

// Start Application
init();
