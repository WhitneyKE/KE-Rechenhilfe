let products = [
    { name: 'Mineralwasser', price: 3.00, category: 'Getränke' },
    { name: 'Softgetränke', price: 4.00, category: 'Getränke' },
    { name: 'Pommes Frites', price: 4.50, category: 'Essen' },
    { name: 'Schweinesteak im Brötchen', price: 7.50, category: 'Essen' },
    { name: 'Krautschupfnudeln', price: 7.50, category: 'Essen' },
    { name: 'Käsespätzle mit Röstzw', price: 8.00, category: 'Essen' },
    { name: 'Currwurst mit Brötchen', price: 7.00, category: 'Essen' },
    { name: 'Currywurst mit Pommes', price: 11.00, category: 'Essen' },
    { name: 'Grillwurst im Brötchen', price: 5.00, category: 'Essen' },
    { name: '1/2 Hähnchen mit Brötchen', price: 11.00, category: 'Essen' },
    { name: '1/2 Hähnchen mit Pommes', price: 15.00, category: 'Essen' },
    { name: 'Haxe 300g mit Brötchen', price: 13.50, category: 'Essen' },
    { name: 'Haxe 500g mit Brötchen', price: 17.00, category: 'Essen' },
    { name: 'Haxe 300g mit Kartoffelsalat', price: 19.50, category: 'Essen' },
    { name: 'Haxe 500g mit Kartoffelsalat', price: 23.00, category: 'Essen' },
    { name: 'Pfand Getränke', price: 1.00, category: 'Pfand' },
    { name: 'Pfand Teller', price: 1.00, category: 'Pfand' },
    { name: 'Extra Kartoffelsalat', price: 6.00, category: 'Essen' }
	 { name: 'Extra Pommes', price: 4.00, category: 'Essen' }
];

let order = [];
let wechselValue = '';
let currentEditIndex = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    renderProducts();
    updateTime();
    setInterval(() => updateTime(), 1000);
});

function loadProducts() {
    const saved = localStorage.getItem('klink-products');
    if (saved) {
        products = JSON.parse(saved);
    }
}

function saveProducts() {
    localStorage.setItem('klink-products', JSON.stringify(products));
}

function renderProducts() {
    renderCategory('drinks-buttons', 'Getränke');
    renderCategory('food-buttons', 'Essen');
    renderCategory('pfand-buttons', 'Pfand');
}

function renderCategory(elementId, category) {
    const items = products.filter(p => p.category === category);
    let html = '';
    
    items.forEach(product => {
        const isPfand = category === 'Pfand';
        const btnClass = isPfand ? 'product-btn pfand' : 'product-btn';
        html += `
            <button class="${btnClass}" onclick="addToOrder('${product.name}', ${product.price})">
                <span class="product-name">${product.name}</span>
                <span class="product-price">${product.price.toFixed(2).replace('.', ',')} €</span>
            </button>
        `;
    });
    
    document.getElementById(elementId).innerHTML = html;
}

function addToOrder(name, price) {
    const existing = order.find(item => item.name === name && item.price === price);
    
    if (existing) {
        existing.qty++;
    } else {
        order.push({ name, price, qty: 1 });
    }
    
    renderOrder();
    updateSums();
}

function removeFromOrder(index) {
    if (order[index].qty > 1) {
        order[index].qty--;
    } else {
        order.splice(index, 1);
    }
    renderOrder();
    updateSums();
}

function renderOrder() {
    const list = document.getElementById('receipt-items');
    
    if (order.length === 0) {
        list.innerHTML = '<p class="receipt-empty">Keine Artikel</p>';
        return;
    }
    
    let html = '';
    order.forEach((item, idx) => {
        const total = (item.price * item.qty).toFixed(2).replace('.', ',');
        html += `
            <div class="receipt-item">
                <div class="receipt-item-left">
                    <span class="receipt-item-name">${item.name}</span>
                    <span class="receipt-item-qty">${item.qty}x</span>
                    <span class="receipt-item-price">${total}€</span>
                </div>
                <button class="receipt-item-delete" onclick="removeFromOrder(${idx})">✕</button>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

function openBon() {
    document.getElementById('bon-popup').classList.remove('hidden');
    updateSums();
}

function closeBon() {
    document.getElementById('bon-popup').classList.add('hidden');
}

function openWechsel() {
    document.getElementById('wechsel-popup').classList.remove('hidden');
    wechselValue = '';
    updateWechselDisplay();
    updateWechselSummary();
}

function closeWechsel() {
    document.getElementById('wechsel-popup').classList.add('hidden');
}

function addWechselNumber(num) {
    if (num === ',') {
        if (!wechselValue.includes(',')) {
            wechselValue += ',';
        }
    } else {
        wechselValue += num;
    }
    updateWechselDisplay();
    updateWechselSummary();
}

function deleteWechselNumber() {
    wechselValue = wechselValue.slice(0, -1);
    updateWechselDisplay();
    updateWechselSummary();
}

function updateWechselDisplay() {
    const display = document.getElementById('wechsel-display');
    if (wechselValue === '') {
        display.textContent = '0,00 €';
    } else {
        display.textContent = wechselValue + ' €';
    }
}

function updateWechselSummary() {
    const sum = order.reduce((total, item) => total + (item.price * item.qty), 0);
    const given = parseFloat(wechselValue.replace(',', '.')) || 0;
    const change = given - sum;
    
    document.getElementById('wechsel-sum').textContent = sum.toFixed(2).replace('.', ',') + ' €';
    document.getElementById('wechsel-given').textContent = (wechselValue === '' ? '0,00' : wechselValue) + ' €';
    
    let changeText = '';
    let changeColor = '#c41f38';
    
    if (given === 0) {
        changeText = '0,00 €';
        changeColor = '#c41f38';
    } else if (change < 0) {
        changeText = Math.abs(change).toFixed(2).replace('.', ',') + ' € noch fällig';
        changeColor = '#e74c3c';
    } else if (change === 0) {
        changeText = '0,00 €';
        changeColor = '#27ae60';
    } else {
        changeText = change.toFixed(2).replace('.', ',') + ' €';
        changeColor = '#c41f38';
    }
    
    const changeEl = document.getElementById('wechsel-change');
    changeEl.textContent = changeText;
    changeEl.style.color = changeColor;
}

function confirmWechsel() {
    closeWechsel();
}

function updateSums() {
    const sum = order.reduce((total, item) => total + (item.price * item.qty), 0);
    document.getElementById('total-price').textContent = sum.toFixed(2).replace('.', ',') + ' €';
}

function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('receipt-time').textContent = `${hours}:${minutes}`;
}

function clearAll() {
    if (confirm('Alles löschen?')) {
        order = [];
        wechselValue = '';
        renderOrder();
        updateSums();
    }
}

function printBon() {
    window.print();
}

function openSettings() {
    document.getElementById('settings-modal').classList.remove('hidden');
    renderProductsList();
}

function closeSettings() {
    document.getElementById('settings-modal').classList.add('hidden');
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById('tab-' + tab).classList.add('active');
    event.target.classList.add('active');
}

function renderProductsList() {
    let html = '';
    products.forEach((p, idx) => {
        html += `
            <div class="product-item">
                <div class="product-item-info">
                    <div class="product-item-name">${p.name}</div>
                    <div class="product-item-cat">${p.category}</div>
                </div>
                <span class="product-item-price">${p.price.toFixed(2).replace('.', ',')} €</span>
                <button class="btn-edit" onclick="editProduct(${idx})">✏️</button>
                <button class="btn-delete" onclick="deleteProduct(${idx})">🗑️</button>
            </div>
        `;
    });
    document.getElementById('products-list').innerHTML = html;
}

function addProduct() {
    const name = document.getElementById('new-name').value.trim();
    const price = parseFloat(document.getElementById('new-price').value);
    const category = document.getElementById('new-category').value;
    
    if (!name || isNaN(price) || price < 0) {
        alert('Bitte alle Felder ausfüllen!');
        return;
    }
    
    if (currentEditIndex !== null) {
        products[currentEditIndex] = { name, price, category };
        currentEditIndex = null;
    } else {
        products.push({ name, price, category });
    }
    
    saveProducts();
    renderProducts();
    renderProductsList();
    
    document.getElementById('new-name').value = '';
    document.getElementById('new-price').value = '';
}

function editProduct(idx) {
    const p = products[idx];
    document.getElementById('new-name').value = p.name;
    document.getElementById('new-price').value = p.price;
    document.getElementById('new-category').value = p.category;
    
    currentEditIndex = idx;
    switchTab('add');
}

function deleteProduct(idx) {
    if (confirm('Löschen?')) {
        products.splice(idx, 1);
        saveProducts();
        renderProducts();
        renderProductsList();
    }
}