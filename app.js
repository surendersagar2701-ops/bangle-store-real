// ============================================
// BANGLE STORE AI - COMPLETE REAL APP
// ============================================

console.log('🏪 Bangle Store AI - Real App Loading...');

// ============================================
// DATA STORAGE
// ============================================
const STORAGE_KEYS = {
    INVENTORY: 'bangle_inventory',
    SECTIONS: 'bangle_sections',
    BILLS: 'bangle_bills',
    DESIGNS: 'bangle_designs',
    SETTINGS: 'bangle_settings'
};

const DEFAULT_SECTIONS = ['24 Pc Box', '12 Pc Box', 'Daily Use 24 Pc Box', 'Other Inventory'];

let state = {
    inventory: [],
    sections: [],
    bills: [],
    designs: [],
    settings: {},
    saleItems: [],
    selectedPayment: null,
    currentScreen: 'homeScreen'
};

// ============================================
// LOAD & SAVE DATA
// ============================================
function loadData() {
    try {
        state.inventory = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY)) || [];
        state.sections = JSON.parse(localStorage.getItem(STORAGE_KEYS.SECTIONS)) || DEFAULT_SECTIONS;
        state.bills = JSON.parse(localStorage.getItem(STORAGE_KEYS.BILLS)) || [];
        state.designs = JSON.parse(localStorage.getItem(STORAGE_KEYS.DESIGNS)) || [];
        state.settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {};
        state.saleItems = [];
        if (state.sections.length === 0) {
            state.sections = DEFAULT_SECTIONS;
            saveSections();
        }
        updateUI();
        console.log('✅ Data loaded:', state.inventory.length, 'products');
    } catch (e) {
        console.error('Load data error:', e);
    }
}

function saveInventory() {
    try {
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(state.inventory));
    } catch (e) {
        console.error('Save inventory error:', e);
    }
}

function saveSections() {
    try {
        localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(state.sections));
    } catch (e) {
        console.error('Save sections error:', e);
    }
}

function saveBills() {
    try {
        localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(state.bills));
    } catch (e) {
        console.error('Save bills error:', e);
    }
}

function saveDesigns() {
    try {
        localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(state.designs));
    } catch (e) {
        console.error('Save designs error:', e);
    }
}

function saveSettings() {
    try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    } catch (e) {
        console.error('Save settings error:', e);
    }
}

// ============================================
// NAVIGATION
// ============================================
function navigateTo(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const navBtn = document.querySelector(`.nav-btn[data-screen="${screenId}"]`);
    if (navBtn) navBtn.classList.add('active');
    
    state.currentScreen = screenId;
    if (screenId === 'homeScreen') updateHome();
    if (screenId === 'inventoryScreen') renderInventory();
    if (screenId === 'addProductScreen') populateSections();
}

// ============================================
// GLOBAL FUNCTIONS (For HTML onclick)
// ============================================
window.navigateTo = navigateTo;

window.showHome = function() { navigateTo('homeScreen'); };
window.showInventory = function() { navigateTo('inventoryScreen'); };
window.showAISetMaker = function() { navigateTo('aiSetMakerScreen'); };
window.showBulkAdd = function() { navigateTo('bulkAddScreen'); };
window.showAddProduct = function() { navigateTo('addProductScreen'); populateSections(); };
window.showNewSale = function() { navigateTo('newSaleScreen'); };
window.showMore = function() { navigateTo('moreScreen'); };

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
        background: #1a1a2e; color: white; padding: 12px 24px;
        border-radius: 12px; font-size: 14px; z-index: 9999;
        max-width: 90%; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        animation: fadeIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
window.showToast = showToast;

// ============================================
// MODAL
// ============================================
function showModal(title, bodyHTML) {
    const modal = document.getElementById('modal');
    const titleEl = document.getElementById('modalTitle');
    const bodyEl = document.getElementById('modalBody');
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = bodyHTML;
    if (modal) modal.classList.add('show');
}
window.showModal = showModal;

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('show');
}
window.closeModal = closeModal;

// ============================================
// HOME SCREEN
// ============================================
function updateHome() {
    const totalProducts = document.getElementById('totalProducts');
    const totalSections = document.getElementById('totalSections');
    const lowStockCount = document.getElementById('lowStockCount');
    const outOfStockCount = document.getElementById('outOfStockCount');
    
    if (totalProducts) totalProducts.textContent = state.inventory.length;
    if (totalSections) totalSections.textContent = state.sections.length;
    if (lowStockCount) lowStockCount.textContent = state.inventory.filter(p => p.quantity > 0 && p.quantity <= 5).length;
    if (outOfStockCount) outOfStockCount.textContent = state.inventory.filter(p => p.quantity <= 0).length;
    
    renderSections();
    renderRecentProducts();
}
window.updateHome = updateHome;

function renderSections() {
    const container = document.getElementById('sectionList');
    if (!container) return;
    if (state.sections.length === 0) {
        container.innerHTML = '<div class="empty-card">No sections added yet</div>';
        return;
    }
    container.innerHTML = state.sections.map(section => `
        <div class="section-item" onclick="showSectionProducts('${section}')">
            <span class="section-name">📦 ${section}</span>
            <span class="section-count">${state.inventory.filter(p => p.section === section).length} items</span>
        </div>
    `).join('');
}
window.renderSections = renderSections;

function showSectionProducts(section) {
    const products = state.inventory.filter(p => p.section === section);
    showModal(`📦 ${section}`, `
        <div style="margin-bottom:12px;">
            ${products.map(p => `
                <div class="product-card">
                    <img src="${p.image || ''}" alt="${p.name}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;background:#dfe6e9;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22%3E%3Crect width=%2248%22 height=%2248%22 fill=%22%23dfe6e9%22/%3E%3Ctext x=%2224%22 y=%2228%22 text-anchor=%22middle%22 fill=%22%23636e72%22 font-size=%2220%22%3E📦%3C/text%3E%3C/svg%3E'">
                    <div class="info"><div class="name">${p.name}</div><div class="details">${p.colour} • ${p.size} • ${p.quantity} pcs</div></div>
                </div>
            `).join('') || '<div class="empty-card">No products in this section</div>'}
        </div>
        <button class="save-btn" onclick="closeModal(); showAddProduct();">➕ Add Product</button>
    `);
}
window.showSectionProducts = showSectionProducts;

function renderRecentProducts() {
    const container = document.getElementById('recentProducts');
    if (!container) return;
    const recent = [...state.inventory].slice(-5).reverse();
    if (recent.length === 0) {
        container.innerHTML = '<div class="empty-card">No products added yet</div>';
        return;
    }
    container.innerHTML = recent.map(p => `
        <div class="recent-item" onclick="showProductDetail('${p.sku}')">
            <img src="${p.image || ''}" alt="${p.name}" style="width:36px;height:36px;border-radius:8px;object-fit:cover;background:#dfe6e9;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2236%22 height=%2236%22%3E%3Crect width=%2236%22 height=%2236%22 fill=%22%23dfe6e9%22/%3E%3Ctext x=%2218%22 y=%2224%22 text-anchor=%22middle%22 fill=%22%23636e72%22 font-size=%2214%22%3E📦%3C/text%3E%3C/svg%3E'">
            <div class="info"><div class="name">${p.name}</div><div class="details">${p.colour} • ${p.size} • ${p.quantity} pcs</div></div>
        </div>
    `).join('');
}
window.renderRecentProducts = renderRecentProducts;

function showProductDetail(sku) {
    const product = state.inventory.find(p => p.sku === sku);
    if (!product) return;
    showModal(`${product.name}`, `
        <div style="text-align:center;margin-bottom:12px;">
            <img src="${product.image || ''}" alt="${product.name}" style="max-width:100%;max-height:200px;border-radius:12px;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23dfe6e9%22/%3E%3Ctext x=%22100%22 y=%22112%22 text-anchor=%22middle%22 fill=%22%23636e72%22 font-size=%2248%22%3E📦%3C/text%3E%3C/svg%3E'">
        </div>
        <div class="form-group"><label>Name</label><div>${product.name}</div></div>
        <div class="form-row"><div class="form-group"><label>Colour</label><div>${product.colour}</div></div><div class="form-group"><label>Size</label><div>${product.size}</div></div></div>
        <div class="form-row"><div class="form-group"><label>SKU</label><div style="font-family:monospace;">${product.sku}</div></div><div class="form-group"><label>Quantity</label><div>${product.quantity} pcs</div></div></div>
        <div class="form-row"><div class="form-group"><label>Purchase Price</label><div>${state.settings.currency || '₹'} ${product.purchasePrice || 0}</div></div><div class="form-group"><label>Selling Price</label><div>${state.settings.currency || '₹'} ${product.sellingPrice || 0}</div></div></div>
        <div style="display:flex;gap:8px;margin-top:12px;">
            <button class="save-btn" onclick="closeModal();editProduct('${product.sku}')" style="flex:1;">✏️ Edit</button>
            <button class="save-btn" onclick="closeModal();deleteProduct('${product.sku}')" style="flex:1;background:#e74c3c;">🗑️ Delete</button>
        </div>
    `);
}
window.showProductDetail = showProductDetail;

function searchProducts(query) {
    if (!query || query.trim() === '') { renderRecentProducts(); return; }
    const q = query.toLowerCase().trim();
    const results = state.inventory.filter(p => p.name.toLowerCase().includes(q) || p.colour.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    const container = document.getElementById('recentProducts');
    if (!container) return;
    if (results.length === 0) { container.innerHTML = '<div class="empty-card">No products found</div>'; return; }
    container.innerHTML = results.map(p => `
        <div class="recent-item" onclick="showProductDetail('${p.sku}')">
            <img src="${p.image || ''}" alt="${p.name}" style="width:36px;height:36px;border-radius:8px;object-fit:cover;background:#dfe6e9;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2236%22 height=%2236%22%3E%3Crect width=%2236%22 height=%2236%22 fill=%22%23dfe6e9%22/%3E%3Ctext x=%2218%22 y=%2224%22 text-anchor=%22middle%22 fill=%22%23636e72%22 font-size=%2214%22%3E📦%3C/text%3E%3C/svg%3E'">
            <div class="info"><div class="name">${p.name}</div><div class="details">${p.colour} • ${p.size} • ${p.quantity} pcs</div></div>
        </div>
    `).join('');
}
window.searchProducts = searchProducts;

// ============================================
// ADD PRODUCT
// ============================================
function populateSections() {
    const select = document.getElementById('productSection');
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = '<option value="">Select Section</option>' + state.sections.map(s => `<option value="${s}">${s}</option>`).join('');
    if (currentValue) select.value = currentValue;
}
window.populateSections = populateSections;

function previewProductImage(input) {
    const preview = document.getElementById('productImagePreview');
    if (!preview || !input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = function(e) { preview.innerHTML = `<img src="${e.target.result}" alt="Product" style="max-width:100%;max-height:150px;border-radius:8px;">`; };
    reader.readAsDataURL(input.files[0]);
}
window.previewProductImage = previewProductImage;

function saveProduct(event) {
    event.preventDefault();
    const name = document.getElementById('productName').value.trim();
    const colour = document.getElementById('productColour').value.trim();
    const size = document.getElementById('productSize').value.trim();
    const sku = document.getElementById('productSKU').value.trim();
    const quantity = parseInt(document.getElementById('productQuantity').value) || 0;
    const purchasePrice = parseFloat(document.getElementById('productPurchasePrice').value) || 0;
    const sellingPrice = parseFloat(document.getElementById('productSellingPrice').value) || 0;
    const section = document.getElementById('productSection').value;
    const notes = document.getElementById('productNotes').value.trim();
    const fileInput = document.getElementById('productImage');
    
    let imageData = null;
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageData = e.target.result;
            saveProductData(name, colour, size, sku, quantity, purchasePrice, sellingPrice, section, notes, imageData);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveProductData(name, colour, size, sku, quantity, purchasePrice, sellingPrice, section, notes, null);
    }
}
window.saveProduct = saveProduct;

function saveProductData(name, colour, size, sku, quantity, purchasePrice, sellingPrice, section, notes, imageData) {
    if (state.inventory.some(p => p.sku === sku)) { showToast('❌ SKU already exists!'); return; }
    const product = {
        name, colour, size,
        sku: sku || generateSKU(name, colour, size),
        quantity, purchasePrice, sellingPrice, section, notes,
        image: imageData,
        createdAt: new Date().toISOString()
    };
    state.inventory.push(product);
    saveInventory();
    showToast('✅ Product added successfully!');
    document.getElementById('productForm').reset();
    document.getElementById('productImagePreview').innerHTML = `<span>📷</span><p>Tap to add image</p>`;
    navigateTo('homeScreen');
    updateUI();
}
window.saveProductData = saveProductData;

function generateSKU(name, colour, size) {
    const prefix = name.substring(0, 2).toUpperCase();
    const colourCode = colour.substring(0, 4).toUpperCase();
    const sizeCode = size.replace('.', '');
    return `${prefix}-${colourCode}-${sizeCode}`;
}
window.generateSKU = generateSKU;

function deleteProduct(sku) {
    if (!confirm('Delete this product?')) return;
    state.inventory = state.inventory.filter(p => p.sku !== sku);
    saveInventory();
    closeModal();
    updateUI();
    showToast('🗑️ Product deleted');
}
window.deleteProduct = deleteProduct;

function editProduct(sku) {
    const product = state.inventory.find(p => p.sku === sku);
    if (!product) return;
    closeModal();
    showAddProduct();
    document.getElementById('productName').value = product.name;
    document.getElementById('productColour').value = product.colour;
    document.getElementById('productSize').value = product.size;
    document.getElementById('productSKU').value = product.sku;
    document.getElementById('productQuantity').value = product.quantity;
    document.getElementById('productPurchasePrice').value = product.purchasePrice || '';
    document.getElementById('productSellingPrice').value = product.sellingPrice || '';
    document.getElementById('productSection').value = product.section;
    document.getElementById('productNotes').value = product.notes || '';
    if (product.image) {
        document.getElementById('productImagePreview').innerHTML = `<img src="${product.image}" alt="Product" style="max-width:100%;max-height:150px;border-radius:8px;">`;
    }
    state.inventory = state.inventory.filter(p => p.sku !== sku);
    saveInventory();
    showToast('✏️ Edit product, then save');
}
window.editProduct = editProduct;

// ============================================
// INVENTORY
// ============================================
function renderInventory() {
    const sectionFilter = document.getElementById('sectionFilter');
    if (sectionFilter) {
        const currentSection = sectionFilter.value;
        sectionFilter.innerHTML = '<option value="">All Sections</option>' + state.sections.map(s => `<option value="${s}">${s}</option>`).join('');
        if (currentSection) sectionFilter.value = currentSection;
    }
    const colourFilter = document.getElementById('colourFilter');
    if (colourFilter) {
        const currentColour = colourFilter.value;
        const colours = [...new Set(state.inventory.map(p => p.colour))];
        colourFilter.innerHTML = '<option value="">All Colours</option>' + colours.map(c => `<option value="${c}">${c}</option>`).join('');
        if (currentColour) colourFilter.value = currentColour;
    }
    filterInventory();
}
window.renderInventory = renderInventory;

function filterInventory() {
    const search = document.getElementById('inventorySearch');
    const section = document.getElementById('sectionFilter');
    const colour = document.getElementById('colourFilter');
    const container = document.getElementById('inventoryList');
    if (!container) return;
    const searchTerm = search ? search.value.toLowerCase().trim() : '';
    const sectionVal = section ? section.value : '';
    const colourVal = colour ? colour.value : '';
    let filtered = state.inventory;
    if (searchTerm) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm) || p.colour.toLowerCase().includes(searchTerm) || p.sku.toLowerCase().includes(searchTerm));
    if (sectionVal) filtered = filtered.filter(p => p.section === sectionVal);
    if (colourVal) filtered = filtered.filter(p => p.colour === colourVal);
    if (filtered.length === 0) { container.innerHTML = '<div class="empty-card">No products found</div>'; return; }
    container.innerHTML = filtered.map(p => `
        <div class="product-card">
            <img src="${p.image || ''}" alt="${p.name}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;background:#dfe6e9;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22%3E%3Crect width=%2248%22 height=%2248%22 fill=%22%23dfe6e9%22/%3E%3Ctext x=%2224%22 y=%2228%22 text-anchor=%22middle%22 fill=%22%23636e72%22 font-size=%2220%22%3E📦%3C/text%3E%3C/svg%3E'">
            <div class="info"><div class="name">${p.name}</div><div class="details">${p.colour} • ${p.size} • ${p.quantity} pcs</div><div class="sku">${p.sku}</div></div>
            <div class="actions">
                <button class="edit-btn" onclick="editProduct('${p.sku}')">✏️</button>
                <button class="stock-in-btn" onclick="stockIn('${p.sku}')">➕</button>
                <button class="stock-out-btn" onclick="stockOut('${p.sku}')">➖</button>
                <button class="delete-btn" onclick="deleteProduct('${p.sku}')">🗑️</button>
            </div>
        </div>
    `).join('');
}
window.filterInventory = filterInventory;

function stockIn(sku) {
    const product = state.inventory.find(p => p.sku === sku);
    if (!product) return;
    showModal('➕ Stock In', `
        <div class="form-group"><label>Product: ${product.name}</label><div style="font-size:12px;color:#636e72;">Current: ${product.quantity} pcs</div></div>
        <div class="form-group"><label>Add Quantity</label><input type="number" id="stockQuantity" min="1" value="1"></div>
        <button class="save-btn" onclick="confirmStockIn('${sku}')">✅ Add Stock</button>
    `);
}
window.stockIn = stockIn;

function confirmStockIn(sku) {
    const quantity = parseInt(document.getElementById('stockQuantity').value) || 1;
    const product = state.inventory.find(p => p.sku === sku);
    if (product) { product.quantity += quantity; saveInventory(); closeModal(); updateUI(); showToast(`✅ Added ${quantity} pcs to ${product.name}`); }
}
window.confirmStockIn = confirmStockIn;

function stockOut(sku) {
    const product = state.inventory.find(p => p.sku === sku);
    if (!product) return;
    showModal('➖ Stock Out', `
        <div class="form-group"><label>Product: ${product.name}</label><div style="font-size:12px;color:#636e72;">Current: ${product.quantity} pcs</div></div>
        <div class="form-group"><label>Remove Quantity</label><input type="number" id="stockQuantityOut" min="1" max="${product.quantity}" value="1"></div>
        <button class="save-btn" onclick="confirmStockOut('${sku}')" style="background:#f39c12;">➖ Remove Stock</button>
    `);
}
window.stockOut = stockOut;

function confirmStockOut(sku) {
    const quantity = parseInt(document.getElementById('stockQuantityOut').value) || 1;
    const product = state.inventory.find(p => p.sku === sku);
    if (product && product.quantity >= quantity) { product.quantity -= quantity; saveInventory(); closeModal(); updateUI(); showToast(`➖ Removed ${quantity} pcs from ${product.name}`); }
    else showToast('❌ Not enough stock!');
}
window.confirmStockOut = confirmStockOut;

// ============================================
// NEW SALE
// ============================================
function searchSaleProducts(query) {
    if (!query || query.trim() === '') { renderSaleItems(); return; }
    const q = query.toLowerCase().trim();
    const results = state.inventory.filter(p => p.name.toLowerCase().includes(q) || p.colour.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    const container = document.getElementById('saleProducts');
    if (!container) return;
    if (results.length === 0) { container.innerHTML = '<div class="empty-card">No products found</div>'; return; }
    container.innerHTML = results.slice(0, 5).map(p => `
        <div class="product-card" onclick="addToSale('${p.sku}', 1)" style="cursor:pointer;">
            <div class="info"><div class="name">${p.name}</div><div class="details">${p.colour} • ${p.size} • ${p.quantity} pcs available</div></div>
            <button class="edit-btn">➕</button>
        </div>
    `).join('');
}
window.searchSaleProducts = searchSaleProducts;

function addToSale(sku, quantity = 1) {
    const product = state.inventory.find(p => p.sku === sku);
    if (!product) { showToast('❌ Product not found'); return; }
    if (product.quantity < quantity) { showToast('❌ Not enough stock!'); return; }
    const existing = state.saleItems.find(p => p.sku === sku);
    if (existing) { existing.quantity += quantity; } else { state.saleItems.push({ ...product, quantity }); }
    document.getElementById('saleSearch').value = '';
    renderSaleItems();
    updateTotal();
}
window.addToSale = addToSale;

function renderSaleItems() {
    const container = document.getElementById('saleProducts');
    if (!container) return;
    if (state.saleItems.length === 0) { container.innerHTML = '<div class="empty-card">Add products to sale</div>'; return; }
    container.innerHTML = state.saleItems.map((p, i) => `
        <div class="sale-item">
            <div class="details"><div class="name">${p.name}</div><div class="meta">${p.colour} • ${p.size}</div></div>
            <div class="qty-control">
                <button onclick="updateSaleQty(${i}, -1)">−</button>
                <span>${p.quantity}</span>
                <button onclick="updateSaleQty(${i}, 1)">+</button>
            </div>
            <div class="price">${state.settings.currency || '₹'}${(p.sellingPrice * p.quantity).toFixed(2)}</div>
            <button onclick="removeFromSale(${i})" class="remove-btn">✕</button>
        </div>
    `).join('');
}
window.renderSaleItems = renderSaleItems;

function updateSaleQty(index, delta) {
    const item = state.saleItems[index];
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) { removeFromSale(index); return; }
    const product = state.inventory.find(p => p.sku === item.sku);
    if (product && newQty > product.quantity) { showToast('❌ Not enough stock!'); return; }
    item.quantity = newQty;
    renderSaleItems();
    updateTotal();
}
window.updateSaleQty = updateSaleQty;

function removeFromSale(index) { state.saleItems.splice(index, 1); renderSaleItems(); updateTotal(); }
window.removeFromSale = removeFromSale;

function resetSale() { state.saleItems = []; renderSaleItems(); updateTotal(); document.getElementById('saleDiscount').value = '0'; document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active')); state.selectedPayment = null; showToast('🔄 Sale reset'); }
window.resetSale = resetSale;

function updateTotal() {
    const subtotal = state.saleItems.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0);
    const discount = parseFloat(document.getElementById('saleDiscount').value) || 0;
    const total = subtotal - discount;
    document.getElementById('subtotal').textContent = `${state.settings.currency || '₹'}${subtotal.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `${state.settings.currency || '₹'}${Math.max(0, total).toFixed(2)}`;
}
window.updateTotal = updateTotal;

function setPayment(method) {
    document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.payment-btn').forEach(b => { if (b.textContent.includes(method) || b.textContent.trim() === method) b.classList.add('active'); });
    state.selectedPayment = method;
}
window.setPayment = setPayment;

function generateBill() {
    if (state.saleItems.length === 0) { showToast('❌ No items in sale!'); return; }
    if (!state.selectedPayment) { showToast('❌ Select payment method!'); return; }
    const subtotal = state.saleItems.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0);
    const discount = parseFloat(document.getElementById('saleDiscount').value) || 0;
    const total = Math.max(0, subtotal - discount);
    const customerName = document.getElementById('customerName').value || 'Guest';
    const customerPhone = document.getElementById('customerPhone').value || '';
    const billNumber = `${state.settings.billPrefix || 'INV-'}${String(state.settings.billStart || 1).padStart(4, '0')}`;
    state.settings.billStart = (state.settings.billStart || 1) + 1;
    saveSettings();
    const bill = { number: billNumber, date: new Date().toISOString(), items: [...state.saleItems], subtotal, discount, total, payment: state.selectedPayment, customer: { name: customerName, phone: customerPhone } };
    state.saleItems.forEach(saleItem => { const product = state.inventory.find(p => p.sku === saleItem.sku); if (product) product.quantity -= saleItem.quantity; });
    saveInventory();
    state.bills.push(bill);
    saveBills();
    showBill(bill);
    state.saleItems = []; renderSaleItems(); updateTotal(); document.getElementById('saleDiscount').value = '0'; document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active')); state.selectedPayment = null;
}
window.generateBill = generateBill;

function showBill(bill) {
    const currency = state.settings.currency || '₹';
    showModal('🧾 Bill', `
        <div style="text-align:center;border-bottom:2px dashed #dfe6e9;padding-bottom:12px;margin-bottom:12px;">
            <h3>${state.settings.shopName || 'Bangle Store'}</h3>
            <p style="font-size:11px;color:#636e72;">${state.settings.shopAddress || ''}</p>
            <div style="margin-top:6px;"><strong>Bill: ${bill.number}</strong><span style="margin-left:12px;font-size:11px;color:#636e72;">${new Date(bill.date).toLocaleString()}</span></div>
        </div>
        ${bill.items.map(p => `<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;border-bottom:1px solid #dfe6e9;"><span>${p.name} × ${p.quantity}</span><span>${currency}${(p.sellingPrice * p.quantity).toFixed(2)}</span></div>`).join('')}
        <div style="margin-top:12px;border-top:2px solid #dfe6e9;padding-top:8px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;"><span>Subtotal</span><span>${currency}${bill.subtotal.toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#f39c12;"><span>Discount</span><span>-${currency}${bill.discount.toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;margin-top:4px;"><span>TOTAL</span><span>${currency}${bill.total.toFixed(2)}</span></div>
        </div>
        <div style="margin-top:8px;font-size:11px;color:#636e72;text-align:center;">Payment: ${bill.payment} • Customer: ${bill.customer.name}</div>
        <div style="margin-top:12px;display:flex;gap:8px;">
            <button class="save-btn" onclick="closeModal()" style="flex:1;background:#636e72;">Done</button>
            <button class="save-btn" onclick="printBill('${bill.number}')" style="flex:1;">🖨️ Print</button>
        </div>
    `);
}
window.showBill = showBill;

function printBill(billNumber) {
    const bill = state.bills.find(b => b.number === billNumber);
    if (!bill) return;
    const currency = state.settings.currency || '₹';
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
        <html><head><title>Bill ${bill.number}</title>
        <style>body{font-family:sans-serif;padding:20px;max-width:400px;margin:auto;}
        .header{text-align:center;border-bottom:2px dashed #ddd;padding-bottom:12px;margin-bottom:12px;}
        .item{display:flex;justify-content:space-between;padding:4px 0;border-bottom
