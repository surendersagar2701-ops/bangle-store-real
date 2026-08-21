/* ========================================
   SMART INVENTORY APP v2.0 - 100% REAL
   Beautiful Mobile UI
   ======================================== */

let products = JSON.parse(localStorage.getItem('products')) || [];
let sections = JSON.parse(localStorage.getItem('sections')) || [];
let bills = JSON.parse(localStorage.getItem('bills')) || [];
let currentBill = [];

// ==========================================
// 1. NAVIGATION
// ==========================================

function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + 'Page').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[onclick="switchPage('${page}')"]`).classList.add('active');
    
    if (page === 'inventory') renderInventory();
    if (page === 'aiSet') updateColorPalette();
    if (page === 'home') updateUI();
    if (page === 'bill') renderBillHistory();
}

// ==========================================
// 2. MODAL SYSTEM
// ==========================================

function openModal(type) {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modalContent');
    
    let html = '';
    
    switch(type) {
        case 'addSection':
            html = `
                <button class="modal-close" onclick="closeModal()">✕</button>
                <h3 class="modal-title">📁 Create New Section</h3>
                <div class="form-group">
                    <label>Section Name</label>
                    <input id="sectionNameInput" placeholder="e.g., Bangles, Rings" class="form-input">
                </div>
                <button onclick="addSection()" class="btn-gradient" style="width:100%;padding:14px;font-size:15px">Create Section</button>
            `;
            break;
            
        case 'addProduct':
            const sectionOptions = sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            html = `
                <button class="modal-close" onclick="closeModal()">✕</button>
                <h3 class="modal-title">➕ Add New Product</h3>
                <div class="form-group">
                    <label>Section</label>
                    <select id="productSection" class="form-input">
                        <option value="">Select Section</option>
                        ${sectionOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Product Name</label>
                    <input id="productName" placeholder="Product name" class="form-input">
                </div>
                <div class="form-group">
                    <label>SKU</label>
                    <input id="productSKU" placeholder="e.g., BGL-001" class="form-input">
                </div>
                <div class="form-group">
                    <label>Color</label>
                    <select id="productColor" class="form-input">
                        <option value="">Select Color</option>
                        <option value="Red">🔴 Red</option>
                        <option value="Blue">🔵 Blue</option>
                        <option value="Gold">🟡 Gold</option>
                        <option value="Green">🟢 Green</option>
                        <option value="Silver">⚪ Silver</option>
                        <option value="Pink">🩷 Pink</option>
                        <option value="Purple">🟣 Purple</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Size</label>
                    <input id="productSize" placeholder="e.g., M, L, 18" class="form-input">
                </div>
                <div class="form-group">
                    <label>Selling Price (₹)</label>
                    <input id="productPrice" type="number" placeholder="0" class="form-input">
                </div>
                <div class="form-group">
                    <label>Stock</label>
                    <input id="productStock" type="number" value="0" class="form-input">
                </div>
                <button onclick="addProduct()" class="btn-gradient" style="width:100%;padding:14px;font-size:15px">➕ Add Product</button>
            `;
            break;
            
        case 'bulkAdd':
            html = `
                <button class="modal-close" onclick="closeModal()">✕</button>
                <h3 class="modal-title">📥 Bulk Add Products</h3>
                <p style="color:#6b7280;font-size:13px;margin-bottom:12px">Format: Name,SKU,Color,Size,Price,Stock (one per line)</p>
                <div class="form-group">
                    <label>Section</label>
                    <select id="bulkSection" class="form-input">
                        <option value="">Select Section</option>
                        ${sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Products</label>
                    <textarea id="bulkProducts" rows="6" placeholder="Bangle Gold,BGL-001,Gold,M,499,10&#10;Bangle Red,BGL-002,Red,L,399,15" style="width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:12px;font-size:14px;font-family:monospace;resize:vertical"></textarea>
                </div>
                <button onclick="bulkAdd()" class="btn-gradient" style="width:100%;padding:14px;font-size:15px">📥 Add All Products</button>
            `;
            break;
            
        case 'aiSet':
            html = `
                <button class="modal-close" onclick="closeModal()">✕</button>
                <h3 class="modal-title">🤖 AI Set Maker</h3>
                <p style="color:#6b7280;font-size:13px;margin-bottom:12px">Create bangle sets from available colors</p>
                <div id="modalColorPalette" class="color-palette"></div>
                <button onclick="generateAISetsModal()" class="btn-gradient" style="width:100%;padding:14px;font-size:15px;margin-top:12px">⚡ Generate Sets</button>
                <div id="modalGeneratedSets" style="margin-top:12px"></div>
            `;
            break;
            
        default:
            html = `<button class="modal-close" onclick="closeModal()">✕</button><p>Unknown action</p>`;
    }
    
    content.innerHTML = html;
    modal.classList.add('show');
    
    if (type === 'aiSet') {
        renderModalColorPalette();
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

// ==========================================
// 3. SECTIONS
// ==========================================

function addSection() {
    const name = document.getElementById('sectionNameInput').value.trim();
    if (!name) { alert('Please enter a section name'); return; }
    
    const section = { id: 'SEC-' + Date.now(), name: name, created: new Date().toISOString() };
    sections.push(section);
    localStorage.setItem('sections', JSON.stringify(sections));
    closeModal();
    updateUI();
    alert('✅ Section "' + name + '" created!');
}

function deleteSection(id) {
    if (!confirm('Delete this section and all products in it?')) return;
    products = products.filter(p => p.sectionId !== id);
    sections = sections.filter(s => s.id !== id);
    localStorage.setItem('sections', JSON.stringify(sections));
    localStorage.setItem('products', JSON.stringify(products));
    updateUI();
}

// ==========================================
// 4. PRODUCTS
// ==========================================

function addProduct() {
    const sectionId = document.getElementById('productSection').value;
    const name = document.getElementById('productName').value.trim();
    const sku = document.getElementById('productSKU').value.trim();
    const color = document.getElementById('productColor').value;
    const size = document.getElementById('productSize').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value) || 0;
    const stock = parseInt(document.getElementById('productStock').value) || 0;
    
    if (!sectionId) { alert('Please select a section'); return; }
    if (!name) { alert('Please enter product name'); return; }
    if (!sku) { alert('Please enter SKU'); return; }
    if (products.some(p => p.sku === sku)) { alert('❌ SKU already exists!'); return; }
    
    const product = {
        id: 'PROD-' + Date.now(),
        sectionId, name, sku, color, size,
        purchase: 0, price, stock,
        created: new Date().toISOString()
    };
    
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
    closeModal();
    updateUI();
    alert('✅ Product "' + name + '" added!');
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const sectionOptions = sections.map(s => 
        `<option value="${s.id}" ${s.id === product.sectionId ? 'selected' : ''}>${s.name}</option>`
    ).join('');
    
    const modal = document.getElementById('modal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <button class="modal-close" onclick="closeModal()">✕</button>
        <h3 class="modal-title">✏️ Edit Product</h3>
        <div class="form-group">
            <label>Section</label>
            <select id="editSection" class="form-input">${sectionOptions}</select>
        </div>
        <div class="form-group">
            <label>Name</label>
            <input id="editName" value="${product.name}" class="form-input">
        </div>
        <div class="form-group">
            <label>SKU</label>
            <input id="editSKU" value="${product.sku}" class="form-input">
        </div>
        <div class="form-group">
            <label>Color</label>
            <select id="editColor" class="form-input">
                <option value="">Select</option>
                <option value="Red" ${product.color === 'Red' ? 'selected' : ''}>🔴 Red</option>
                <option value="Blue" ${product.color === 'Blue' ? 'selected' : ''}>🔵 Blue</option>
                <option value="Gold" ${product.color === 'Gold' ? 'selected' : ''}>🟡 Gold</option>
                <option value="Green" ${product.color === 'Green' ? 'selected' : ''}>🟢 Green</option>
                <option value="Silver" ${product.color === 'Silver' ? 'selected' : ''}>⚪ Silver</option>
                <option value="Pink" ${product.color === 'Pink' ? 'selected' : ''}>🩷 Pink</option>
            </select>
        </div>
        <div class="form-group">
            <label>Size</label>
            <input id="editSize" value="${product.size || ''}" class="form-input">
        </div>
        <div class="form-group">
            <label>Price (₹)</label>
            <input id="editPrice" type="number" value="${product.price}" class="form-input">
        </div>
        <div class="form-group">
            <label>Stock</label>
            <input id="editStock" type="number" value="${product.stock}" class="form-input">
        </div>
        <button onclick="saveEditProduct('${id}')" class="btn-gradient" style="width:100%;padding:14px;font-size:15px">💾 Save Changes</button>
        <button onclick="deleteProduct('${id}')" style="width:100%;padding:14px;margin-top:10px;background:#ef4444;color:#fff;border:none;border-radius:12px;font-weight:600;font-size:15px;cursor:pointer">🗑️ Delete</button>
    `;
    
    modal.classList.add('show');
}

function saveEditProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    product.sectionId = document.getElementById('editSection').value;
    product.name = document.getElementById('editName').value.trim();
    product.sku = document.getElementById('editSKU').value.trim();
    product.color = document.getElementById('editColor').value;
    product.size = document.getElementById('editSize').value.trim();
    product.price = parseFloat(document.getElementById('editPrice').value) || 0;
    product.stock = parseInt(document.getElementById('editStock').value) || 0;
    
    localStorage.setItem('products', JSON.stringify(products));
    closeModal();
    updateUI();
    alert('✅ Product updated!');
}

function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    products = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(products));
    closeModal();
    updateUI();
}

// ==========================================
// 5. BULK ADD
// ==========================================

function bulkAdd() {
    const sectionId = document.getElementById('bulkSection').value;
    const text = document.getElementById('bulkProducts').value;
    
    if (!sectionId) { alert('Please select a section'); return; }
    if (!text.trim()) { alert('Please enter products'); return; }
    
    const lines = text.split('\n').filter(l => l.trim());
    let added = 0, errors = [];
    
    lines.forEach(line => {
        const parts = line.split(',').map(s => s.trim());
        if (parts.length < 4) { errors.push('❌ Invalid: ' + line); return; }
        
        const [name, sku, color, size, price, stock] = parts;
        if (products.some(p => p.sku === sku)) { errors.push('❌ SKU "' + sku + '" exists'); return; }
        
        products.push({
            id: 'PROD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
            sectionId, name, sku, color: color || '', size: size || '',
            purchase: 0, price: parseFloat(price) || 0, stock: parseInt(stock) || 0,
            created: new Date().toISOString()
        });
        added++;
    });
    
    localStorage.setItem('products', JSON.stringify(products));
    closeModal();
    updateUI();
    
    let msg = '✅ Added ' + added + ' products!';
    if (errors.length) msg += '\n\nErrors:\n' + errors.join('\n');
    alert(msg);
}

// ==========================================
// 6. AI SET MAKER
// ==========================================

function renderModalColorPalette() {
    const container = document.getElementById('modalColorPalette');
    if (!container) return;
    
    const colors = {};
    products.forEach(p => { if (p.color && p.stock > 0) colors[p.color] = (colors[p.color] || 0) + p.stock; });
    
    if (Object.keys(colors).length === 0) {
        container.innerHTML = '<p style="color:#6b7280;font-size:13px">No colors available</p>';
        return;
    }
    
    container.innerHTML = Object.entries(colors).map(([color, qty]) => `
        <div class="color-item">
            <div class="color-chip" style="background:${getColorHex(color)}"></div>
            <div class="color-label">${color}<br>${qty}</div>
        </div>
    `).join('');
}

function generateAISetsModal() {
    const container = document.getElementById('modalGeneratedSets');
    if (!container) return;
    
    const colors = {};
    products.forEach(p => { if (p.color && p.stock > 0) colors[p.color] = (colors[p.color] || 0) + p.stock; });
    
    const colorNames = Object.keys(colors);
    if (colorNames.length < 2) {
        container.innerHTML = '<p style="color:#ef4444">Need at least 2 colors!</p>';
        return;
    }
    
    const sets = [];
    for (let i = 0; i < colorNames.length; i++) {
        for (let j = i+1; j < colorNames.length; j++) {
            const minQty = Math.min(colors[colorNames[i]], colors[colorNames[j]]);
            if (minQty >= 2) sets.push({ colors: [colorNames[i], colorNames[j]], maxSets: Math.floor(minQty / 2), name: `${colorNames[i]} + ${colorNames[j]}` });
        }
    }
    for (let i = 0; i < colorNames.length; i++) {
        for (let j = i+1; j < colorNames.length; j++) {
            for (let k = j+1; k < colorNames.length; k++) {
                const minQty = Math.min(colors[colorNames[i]], colors[colorNames[j]], colors[colorNames[k]]);
                if (minQty >= 2) sets.push({ colors: [colorNames[i], colorNames[j], colorNames[k]], maxSets: Math.floor(minQty / 2), name: `${colorNames[i]}+${colorNames[j]}+${colorNames[k]}` });
            }
        }
    }
    
    if (sets.length === 0) {
        container.innerHTML = '<p style="color:#ef4444">Not enough stock!</p>';
        return;
    }
    
    container.innerHTML = sets.slice(0, 12).map((set, idx) => `
        <div class="set-card">
            <div class="set-header">
                <span class="set-name">${set.name}</span>
                <span class="set-badge">${set.maxSets} sets</span>
            </div>
            <div class="set-colors">
                ${set.colors.map(c => `<div class="set-color-dot" style="background:${getColorHex(c)}"></div>`).join('')}
            </div>
            <button onclick="addSetToInventory(${idx})" class="btn-add-set">➕ Add to Inventory</button>
        </div>
    `).join('');
    
    window._generatedSets = sets;
}

function getColorHex(color) {
    const map = {
        'Red':'#ef4444','Blue':'#3b82f6','Gold':'#f59e0b',
        'Green':'#22c55e','Silver':'#9ca3af','Pink':'#ec4899',
        'Purple':'#8b5cf6','Orange':'#f97316','Yellow':'#eab308',
        'Black':'#111827','White':'#f3f4f6'
    };
    return map[color] || '#6b7280';
}

function addSetToInventory(idx) {
    const set = window._generatedSets[idx];
    if (!set) return;
    
    let setSection = sections.find(s => s.name === 'AI Sets');
    if (!setSection) {
        setSection = { id: 'SEC-AI-' + Date.now(), name: 'AI Sets', created: new Date().toISOString() };
        sections.push(setSection);
        localStorage.setItem('sections', JSON.stringify(sections));
    }
    
    products.push({
        id: 'SET-' + Date.now(),
        sectionId: setSection.id,
        name: 'Set: ' + set.name,
        sku: 'SET-' + Date.now().toString().slice(-6),
        color: set.colors.join('+'),
        size: 'Set',
        purchase: 0,
        price: 499 + (set.colors.length * 100),
        stock: set.maxSets,
        created: new Date().toISOString(),
        isSet: true
    });
    
    localStorage.setItem('products', JSON.stringify(products));
    closeModal();
    updateUI();
    alert('✅ Added "' + set.name + '" (' + set.maxSets + ' sets)');
}

function generateAISets() {
    updateColorPalette();
    switchPage('aiSet');
}

// ==========================================
// 7. INVENTORY
// ==========================================

function renderInventory() {
    const container = document.getElementById('inventorySections');
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filterSection = document.getElementById('filterSection')?.value || '';
    const filterColor = document.getElementById('filterColor')?.value || '';
    
    const filterSelect = document.getElementById('filterSection');
    if (filterSelect) {
        const currentVal = filterSelect.value;
        filterSelect.innerHTML = `<option value="">All Sections</option>` + sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        filterSelect.value = currentVal;
    }
    
    let filtered = products;
    if (search) filtered = filtered.filter(p => p.name?.toLowerCase().includes(search) || p.sku?.toLowerCase().includes(search));
    if (filterSection) filtered = filtered.filter(p => p.sectionId === filterSection);
    if (filterColor) filtered = filtered.filter(p => p.color === filterColor);
    
    if (sections.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align:center;padding:30px">
                <div style="font-size:48px;margin-bottom:10px">📁</div>
                <p style="color:#6b7280">No sections yet</p>
                <button onclick="openModal('addSection')" class="btn-gradient" style="margin-top:12px;padding:12px 30px;font-size:14px">Create Section</button>
            </div>
        `;
        return;
    }
    
    let html = '';
    sections.forEach(section => {
        const sectionProducts = filtered.filter(p => p.sectionId === section.id);
        if (sectionProducts.length === 0 && !filterSection && !search && !filterColor) {
            html += `
                <div class="section-card">
                    <div class="section-header">
                        <span class="section-name">📁 ${section.name}</span>
                        <span class="section-count">0 products</span>
                    </div>
                    <div style="padding:16px;text-align:center;color:#9ca3af;font-size:13px">No products in this section</div>
                </div>
            `;
            return;
        }
        if (sectionProducts.length === 0) return;
        
        html += `
            <div class="section-card">
                <div class="section-header">
                    <span class="section-name">📁 ${section.name}</span>
                    <span class="section-count">${sectionProducts.length}</span>
                    <button onclick="deleteSection('${section.id}')" style="background:#fee2e2;color:#dc2626;border:none;border-radius:8px;padding:4px 10px;cursor:pointer;font-size:12px;font-weight:600">✕</button>
                </div>
                <div class="section-products">
                    ${sectionProducts.map(p => `
                        <div class="product-item">
                            <div class="product-info">
                                <div class="product-name">${p.name}</div>
                                <div class="product-sku">SKU: ${p.sku} ${p.color ? '• ' + p.color : ''} ${p.size ? '• ' + p.size : ''}</div>
                            </div>
                            <div class="product-right">
                                <div class="product-price">₹${p.price || 0}</div>
                                <span class="product-stock-badge ${(p.stock || 0) < 5 ? 'badge-low' : 'badge-good'}">${p.stock || 0}</span>
                                <button onclick="editProduct('${p.id}')" class="product-edit-btn">✏️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p style="color:#6b7280;text-align:center;padding:30px">No products match your filters</p>';
}

// ==========================================
// 8. BILL SYSTEM
// ==========================================

function scanBillProduct() {
    const query = prompt('Enter SKU or product name:');
    if (!query) return;
    
    const product = products.find(p => p.sku?.toLowerCase().includes(query.toLowerCase()) || p.name?.toLowerCase().includes(query.toLowerCase()));
    if (!product) { alert('❌ Product not found!'); return; }
    if ((product.stock || 0) < 1) { alert('❌ Out of stock!'); return; }
    
    const qty = parseInt(prompt('Quantity:', '1')) || 1;
    if (qty > product.stock) { alert('❌ Not enough stock! Available: ' + product.stock); return; }
    
    currentBill.push({ ...product, qty, subtotal: product.price * qty });
    renderBillItems();
}

function renderBillItems() {
    const container = document.getElementById('billItems');
    if (currentBill.length === 0) {
        container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:12px;font-size:14px">No items added</p>';
        return;
    }
    
    container.innerHTML = currentBill.map((item, idx) => `
        <div class="product-item">
            <div class="product-info">
                <div class="product-name">${item.name}</div>
                <div class="product-sku">₹${item.price} × ${item.qty}</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
                <span style="font-weight:700">₹${item.subtotal}</span>
                <button onclick="removeBillItem(${idx})" style="background:none;border:none;font-size:20px;color:#ef4444;cursor:pointer">✕</button>
            </div>
        </div>
    `).join('');
    calculateBillTotal();
}

function removeBillItem(idx) {
    currentBill.splice(idx, 1);
    renderBillItems();
}

function calculateBillTotal() {
    const subtotal = currentBill.reduce((sum, i) => sum + (i.subtotal || 0), 0);
    const discount = parseInt(document.getElementById('billDiscount').value) || 0;
    document.getElementById('billSubtotal').textContent = '₹' + subtotal;
    document.getElementById('billTotal').textContent = '₹' + Math.max(0, subtotal - discount);
}

function saveBill() {
    if (currentBill.length === 0) { alert('Add items first!'); return; }
    
    const subtotal = currentBill.reduce((sum, i) => sum + (i.subtotal || 0), 0);
    const discount = parseInt(document.getElementById('billDiscount').value) || 0;
    const total = Math.max(0, subtotal - discount);
    
    const bill = {
        id: 'BILL-' + Date.now(),
        date: new Date().toLocaleString(),
        customer: document.getElementById('customerName').value || 'Walk-in',
        mobile: document.getElementById('customerMobile').value || '',
        items: currentBill.map(i => ({...i})),
        subtotal, discount, total
    };
    
    currentBill.forEach(item => {
        const p = products.find(pr => pr.id === item.id);
        if (p) p.stock = (p.stock || 0) - item.qty;
    });
    
    bills.push(bill);
    localStorage.setItem('bills', JSON.stringify(bills));
    localStorage.setItem('products', JSON.stringify(products));
    
    currentBill = [];
    document.getElementById('customerName').value = '';
    document.getElementById('customerMobile').value = '';
    document.getElementById('billDiscount').value = '0';
    
    renderBillItems();
    updateUI();
    renderBillHistory();
    alert('✅ Bill saved!\nTotal: ₹' + total);
}

function renderBillHistory() {
    const container = document.getElementById('billHistory');
    if (bills.length === 0) {
        container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:20px">No bills yet</p>';
        return;
    }
    
    container.innerHTML = bills.slice(-10).reverse().map(b => `
        <div class="card" style="cursor:pointer" onclick="viewBill('${b.id}')">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                    <strong>#${b.id}</strong>
                    <div style="font-size:12px;color:#6b7280">${b.date}</div>
                </div>
                <div style="text-align:right">
                    <span style="font-weight:700;font-size:16px">₹${b.total}</span>
                    <div style="font-size:11px;color:#6b7280">${b.customer}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function viewBill(id) {
    const bill = bills.find(b => b.id === id);
    if (!bill) return;
    
    alert(
        '🧾 BILL DETAILS\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n' +
        'Bill: ' + bill.id + '\n' +
        'Date: ' + bill.date + '\n' +
        'Customer: ' + bill.customer + '\n' +
        'Mobile: ' + (bill.mobile || 'N/A') + '\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n' +
        'Items:\n' + bill.items.map(i => '  ' + i.name + ' × ' + i.qty + ' = ₹' + i.subtotal).join('\n') + '\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n' +
        'Subtotal: ₹' + bill.subtotal + '\n' +
        'Discount: ₹' + bill.discount + '\n' +
        'TOTAL: ₹' + bill.total + '\n' +
        '━━━━━━━━━━━━━━━━━━━━━━'
    );
}

// ==========================================
// 9. UPDATE UI
// ==========================================

function updateUI() {
    document.getElementById('totalSections').textContent = sections.length;
    document.getElementById('totalProducts').textContent = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    document.getElementById('totalStock').textContent = totalStock;
    renderHomeSections();
    renderInventory();
    renderBillHistory();
    updateColorPalette();
}

function renderHomeSections() {
    const container = document.getElementById('homeSections');
    if (sections.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align:center;padding:30px">
                <div style="font-size:48px;margin-bottom:10px">📂</div>
                <p style="color:#6b7280;margin-bottom:12px">No sections created</p>
                <button onclick="openModal('addSection')" class="btn-gradient" style="padding:12px 30px;font-size:14px">Create Section</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = sections.slice(0, 5).map(section => {
        const count = products.filter(p => p.sectionId === section.id).length;
        return `
            <div class="section-card" onclick="switchPage('inventory')" style="cursor:pointer">
                <div class="section-header">
                    <span class="section-name">📁 ${section.name}</span>
                    <span class="section-count">${count} products</span>
                </div>
            </div>
        `;
    }).join('');
}

function updateColorPalette() {
    const container = document.getElementById('availableColors');
    if (!container) return;
    
    const colors = {};
    products.forEach(p => { if (p.color && p.stock > 0) colors[p.color] = (colors[p.color] || 0) + p.stock; });
    
    if (Object.keys(colors).length === 0) {
        container.innerHTML = '<p style="color:#6b7280;font-size:13px">No colors available</p>';
        return;
    }
    
    container.innerHTML = Object.entries(colors).map(([color, qty]) => `
        <div class="color-item">
            <div class="color-chip" style="background:${getColorHex(color)}"></div>
            <div class="color-label">${color}<br>${qty}</div>
        </div>
    `).join('');
}

// ==========================================
// 10. MORE OPTIONS
// ==========================================

function exportData() {
    const data = { products, sections, bills, exported: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart_inventory_backup.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ Data exported successfully!');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                if (data.products) products = data.products;
                if (data.sections) sections = data.sections;
                if (data.bills) bills = data.bills;
                localStorage.setItem('products', JSON.stringify(products));
                localStorage.setItem('sections', JSON.stringify(sections));
                localStorage.setItem('bills', JSON.stringify(bills));
                updateUI();
                alert('✅ Data imported successfully!');
            } catch(err) {
                alert('❌ Invalid file format!');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAllData() {
    if (!confirm('⚠️ Delete ALL data? This cannot be undone!')) return;
    if (!confirm('Are you ABSOLUTELY sure?')) return;
    products = []; sections = []; bills = []; currentBill = [];
    localStorage.removeItem('products');
    localStorage.removeItem('sections');
    localStorage.removeItem('bills');
    updateUI();
    renderBillItems();
    alert('✅ All data cleared!');
}

function aboutApp() {
    alert(
        '📱 Smart Inventory v2.0\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n' +
        '✅ 100% REAL - No Login\n' +
        '✅ Beautiful Mobile UI\n' +
        '✅ Sections + Products\n' +
        '✅ AI Set Maker\n' +
        '✅ Billing System\n' +
        '✅ Local Storage\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n' +
        '🚀 Optimized for Mobile'
    );
}

// ==========================================
// 11. INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', renderInventory);
    
    const filterSection = document.getElementById('filterSection');
    if (filterSection) filterSection.addEventListener('change', renderInventory);
    
    const filterColor = document.getElementById('filterColor');
    if (filterColor) filterColor.addEventListener('change', renderInventory);
});

updateUI();

console.log('✅ Smart Inventory v2.0 - Beautiful UI Loaded!');
console.log('📦 Sections:', sections.length, 'Products:', products.length);
