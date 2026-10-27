// ====== ДАННЫЕ ======
const catalog = [
    { id: 1, name: "Ванильный кекс", desc: "Описание первого товара", img: "catalog images/white.png", price: 150 },
    { id: 2, name: "Шоколадный кекс", desc: "Описание второго товара", img: "catalog images/black.png", price: 250 },
    { id: 3, name: "Черничный кекс", desc: "Описание второго товара", img: "catalog images/blue.png", price: 170 },
    { id: 4, name: "Ягодный кекс", desc: "Описание второго товара", img: "catalog images/pink.png", price: 100 }
];

// ====== ПОЛЬЗОВАТЕЛИ ======
const users = {
    admin: { password: "admin", role: "admin" },
    user:  { password: "user",  role: "user"  }
};

// ====== СОСТОЯНИЕ ======
let currentUser = null;
let cart = [];
let catalogEl = null;
let basketItemsEl = null;
let aside = null;
let uploadedImgBase64 = "";

// ====== ЭЛЕМЕНТЫ ======
const authScreen   = document.getElementById("authScreen");
const app          = document.getElementById("app");
const authLogin    = document.getElementById("authLogin");
const authPassword = document.getElementById("authPassword");
const authBtn      = document.getElementById("authBtn");
const authError    = document.getElementById("authError");

const addModal      = document.getElementById("addProductModal");
const newName       = document.getElementById("newName");
const newDesc       = document.getElementById("newDesc");
const newPrice      = document.getElementById("newPrice");
const newImgFile    = document.getElementById("newImgFile");
const newImgPreview = document.getElementById("newImgPreview");
const successModal  = document.getElementById("successModal");

// ====== ВХОД ======
authBtn.addEventListener("click", login);

function login() {
    const loginValue = authLogin.value.trim();
    const password = authPassword.value;

    const user = users[loginValue];
    if (!user || user.password !== password) {
        authError.textContent = "Неверный логин или пароль";
        return;
    }

    currentUser = { login: loginValue, role: user.role };
    authError.textContent = "";

    authScreen.classList.add("hidden");
    app.classList.remove("hidden");

    initApp();
}

// ====== ИНИЦИАЛИЗАЦИЯ ПОСЛЕ ВХОДА ======
function initApp() {
    catalogEl     = document.getElementById("catalog");
    basketItemsEl = document.querySelector(".basket_items");
    aside         = document.querySelector(".aside");

    aside.classList.add("hidden"); 

    const basketToggle = document.getElementById("basketToggle");
    basketToggle.replaceWith(basketToggle.cloneNode(true));
    document.getElementById("basketToggle").addEventListener("click", () => {
        aside.classList.toggle("hidden");
        if (!aside.classList.contains("hidden")) positionAside();
    });

    const accountBtn = document.getElementById("accountBtn");
    accountBtn.replaceWith(accountBtn.cloneNode(true));
    document.getElementById("accountBtn").addEventListener("click", logout);

    cart = [];
    renderCatalog();
    renderCart();
    positionAside();
}

// ====== ВЫХОД ======
function logout() {
    currentUser = null;
    cart = [];

    app.classList.add("hidden");
    authScreen.classList.remove("hidden");

    authLogin.value = "";
    authPassword.value = "";
    authError.textContent = "";

    basketItemsEl.innerHTML = "";
    aside.classList.add("hidden");
}

// ====== РЕНДЕР КАТАЛОГА ======
function renderCatalog() {
    let html = "";

    if (currentUser.role === "admin") {
        html += `<div class="add-card" id="addCard">+</div>`;
    }

    html += catalog.map(item => `
        <div class="product-card" data-id="${item.id}">
            <img src="${item.img.startsWith('data:') ? item.img : 'assets/images/' + item.img}" alt="${item.name}" class="product-img">
            <h3 class="product-title">${item.name}</h3>
            <p class="product-desc">${item.desc}</p>
            <p class="product-price">${item.price} ₽</p>
            <button class="btn-buy" data-id="${item.id}">Добавить в корзину</button>
        </div>
    `).join("");

    catalogEl.innerHTML = html;

    const addCard = document.getElementById("addCard");
    if (addCard) {
        addCard.addEventListener("click", () => addModal.classList.remove("hidden"));
    }
}

// ====== ПОПАП ДОБАВЛЕНИЯ ======
newImgFile.addEventListener("change", () => {
    const file = newImgFile.files[0];
    if (!file) {
        newImgPreview.classList.add("hidden");
        uploadedImgBase64 = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImgBase64 = e.target.result;
        newImgPreview.src = uploadedImgBase64;
        newImgPreview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
});

document.getElementById("addProductDone").addEventListener("click", () => {
    const name  = newName.value.trim();
    const desc  = newDesc.value.trim();
    const price = Number(newPrice.value) || 0;

    if (!name || !uploadedImgBase64) {
        alert("Введите название и выберите фото");
        return;
    }

    const newId = catalog.length ? Math.max(...catalog.map(p => p.id)) + 1 : 1;
    catalog.push({ id: newId, name, desc, price, img: uploadedImgBase64 });

    newName.value = newDesc.value = newPrice.value = "";
    newImgFile.value = "";
    newImgPreview.src = "";
    newImgPreview.classList.add("hidden");
    uploadedImgBase64 = "";

    addModal.classList.add("hidden");
    renderCatalog();
    successModal.classList.remove("hidden");
});

document.getElementById("addProductCancel").addEventListener("click", () => {
    newName.value = newDesc.value = newPrice.value = "";
    newImgFile.value = "";
    newImgPreview.src = "";
    newImgPreview.classList.add("hidden");
    uploadedImgBase64 = "";
    addModal.classList.add("hidden");
});

document.getElementById("successOk").addEventListener("click", () => {
    successModal.classList.add("hidden");
});

// ====== КНОПКА ЗАКАЗАТЬ ======
const checkoutBtn   = document.getElementById("checkoutBtn");
const checkoutModal = document.getElementById("checkoutModal");
const checkoutOk    = document.getElementById("checkoutOk");

checkoutBtn.addEventListener("click", () => {
    // Если корзина пустая, можно не открывать попап (по желанию)
    if (cart.length === 0) {
        alert("Корзина пуста");
        return;
    }
    checkoutModal.classList.remove("hidden");
});

checkoutOk.addEventListener("click", () => {
    checkoutModal.classList.add("hidden");
});

// ====== КОРЗИНА ======
function addToCart(id) {
    const product = catalog.find(p => p.id === id);
    if (!product) return;

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: product.id, name: product.name, img: product.img, qty: 1 });
    }

    renderCart();
    showCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty < 1) item.qty = 1;

    renderCart();
}

function renderCart() {
    if (!basketItemsEl) return;

    if (cart.length === 0) {
        basketItemsEl.innerHTML = '<p class="basket-empty">Корзина пуста</p>';
        updateTotal();
        return;
    }

    basketItemsEl.innerHTML = cart.map(item => `
        <div class="basket-item">
            <img class="basket-img" src="${item.img.startsWith('data:') ? item.img : 'assets/images/' + item.img}" alt="${item.name}">
            <div class="basket-name">${item.name}</div>
            <div class="basket-controls">
                <button class="qty-btn btn-minus" data-id="${item.id}" ${item.qty === 1 ? "disabled" : ""}>−</button>
                <span class="qty-num">${item.qty}</span>
                <button class="qty-btn btn-plus" data-id="${item.id}">+</button>
            </div>
            <button class="btn-remove" data-id="${item.id}">✕</button>
        </div>
    `).join("");

    updateTotal();
}

function updateTotal() {
    const totalEl = document.querySelector(".basket-total");
    if (!totalEl) return;

    let sum = 0;
    cart.forEach(item => {
        const product = catalog.find(p => p.id === item.id);
        if (product) sum += product.price * item.qty;
    });

    totalEl.textContent = `Итого: ${sum} ₽`;
}

function showCart() {
    if (!aside) return;
    aside.classList.remove("hidden");
    positionAside();
}

// ====== ДЕЛЕГИРОВАНИЕ КЛИКОВ ======
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-buy")) {
        addToCart(Number(e.target.dataset.id));
    }
    if (e.target.classList.contains("btn-remove")) {
        removeFromCart(Number(e.target.dataset.id));
    }
    if (e.target.classList.contains("btn-plus")) {
        changeQty(Number(e.target.dataset.id), 1);
    }
    if (e.target.classList.contains("btn-minus")) {
        changeQty(Number(e.target.dataset.id), -1);
    }
});

// ====== ПОЗИЦИОНИРОВАНИЕ ASIDE ======
function positionAside() {
    const main = document.querySelector(".main");
    if (!main || !aside) return;

    const rect = main.getBoundingClientRect();
    const rightEdge = rect.right + 10;
    const viewportW = document.documentElement.clientWidth;
    const asideW = 300;

    if (rightEdge + asideW > viewportW) {
        aside.style.left = "auto";
        aside.style.right = "10px";
    } else {
        aside.style.right = "auto";
        aside.style.left = rightEdge + "px";
    }
}

window.addEventListener("resize", () => {
    if (aside && !aside.classList.contains("hidden")) positionAside();
});