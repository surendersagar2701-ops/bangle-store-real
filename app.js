/* ========================================
   SMART INVENTORY APP v2.0 - WITH SECTIONS
   Firebase Ready
   ======================================== */

// ===== FIREBASE CONFIG =====
const firebaseConfig = {
    apiKey: "AIzaSyCaqe-u5VHqZlxvJ0Zq3aWi9R93m-B93JM",
    authDomain: "smart-inventory-app.firebaseapp.com",
    projectId: "smart-inventory-app",
    storageBucket: "smart-inventory-app.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ===== DATA STORE =====
let products = JSON.parse(localStorage.getItem('products')) || [];
let sections = JSON.parse(localStorage.getItem('sections')) || [];
let bills = JSON.parse(localStorage.getItem('bills')) || [];
let currentUser = localStorage.getItem('userPhone') || '';
let currentBill = [];

// ==========================================
// 1. LOGIN SYSTEM
// ==========================================

function sendOTP() {
    const phone = document.getElementById('phoneNumber').value.trim();
    if (phone.length < 10) {
        alert('Please enter a valid mobile number (10+ digits).');
        return;
    }
    currentUser = phone;
    document.getElementById('phoneStep').classList.add('hidden');
    document.getElementById('otpStep').classList.remove('hidden');
    alert('📱 Demo OTP: 123456\n\n(Real OTP would be sent via Firebase)');
}

function verifyOTP() {
    const otp = document.getElementById('otpInput').value.trim();
    if (otp !== '123456') {
        alert('❌ Invalid OTP. Use: 123456');
        return;
    }
    document.getElementById('otpStep').classList.add('hidden');
    document.getElementById('gmailStep').classList.remove('hidden');
}

function verifyGmail() {
    const email = document.getElementById('gmailInput').value.trim();
    if (!email.includes('@') || !email.includes('.')) {
        alert('Please enter a valid Gmail address.');
        return;
    }
    
    localStorage.setItem('userPhone', currentUser);
    localStorage.setItem('userEmail', email);
    
    // Firebase Auth - Anonymous (for demo)
    auth.signInAnonymously()
        .then(() => {
            console.log('✅ Firebase Auth: Anonymous login success');
        })
        .catch(err => {
            console.log('⚠️ Firebase Auth error:', err.message);
        });
    
    // Show Main App
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('bottomNav').classList.remove('hidden');
    document.getElementById('userDisplay').textContent = currentUser;
    
    updateUI();
    alert('✅ Welcome to Smart Inventory!\n\nPhone: ' + currentUser + '\nEmail: ' + email);
}

function logout() {
    if (!confirm('Are you sure you want to logout?')) return;
    
    // Firebase sign out
    auth.signOut().catch(err => console.log(err));
    
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('bottomNav').classList.add('hidden');
    document.getElementById('phoneStep').classList.remove('hidden');
    document.getElementById('otpStep').classList.add('hidden');
    document.getElementById('gmailStep').classList.add('hidden');
    document.getElementById('phoneNumber').value = '';
    document.getElementById('otpInput').value = '';
    document.getElementById('gmailInput').value = '';
}

// ==========================================
// 2. NAVIGATION
// ==========================================

function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + 'Page').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[onclick="switchPage('${page}')"]`).classList.add('active');
    
    // Refresh data on page switch
    if (page === 'inventory') renderInventory();
    if (page === 'aiSet') updateColorPalette();
    if (page === 'home') updateUI();
    if (page === 'bill') renderBillHistory();
}

// ==========================================
// 3. MODAL SYSTEM
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
                    <input id="sectionNameInput" placeholder="e.g., Bangles, Rings, Necklaces">
                </div>
                <button onclick="addSection()" class="primary-btn">Create Section</button>
            `;
            break;
            
        case 'addProduct':
            const sectionOptions = sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            html = `
                <button class="modal-close" onclick="closeModal()">✕</button>
                <h3 class="modal-title">➕ Add New Product</h3>
                <div class="form-group">
                    <label>Section</label>
                    <select id="productSection">
                        <option value="">Select Section</option>
                        ${sectionOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Product Name</label>
                    <input id="productName" placeholder="Product name">
                </div>
                <div class="form-group">
                    <label>SKU (Unique ID)</label>
                    <input id="productSKU" placeholder="e.g., BGL-001">
                </div>
                <div class="form-group">
                    <label>Color</label>
                    <select id="productColor">
                        <option value="">Select Color</option>
                        <option value="Red">🔴 Red</option>
                        <option value="Blue">🔵 Blue</option>
                        <option value="Gold">🟡 Gold</option>
                        <option value="Green">🟢 Green</option>
                        <option value="Silver">⚪ Silver</option>
                        <option value="Pink">🩷 Pink</option>
                        <option value="Purple">🟣 Purple</option>
                        <option value="Orange">🟠 Orange</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Size</label>
                    <input id="productSize" placeholder="e.g., M, L, XL, 18">
                </div>
                <div class="form-group">
                    <label>Purchase Price (₹)</label>
                    <input id="productPurchase" type="number" placeholder="0">
                </div>
                <div class="form-group">
                    <label>Selling Price (₹)</label>
                    <input id="productPrice" type="number" placeholder="0">
                </div>
                <div class="form-group">
                    <label>Stock Quantity</label>
                    <input id="productStock" type="number" value="0">
                </div>
                <button onclick="addProduct()" class="primary-btn">➕ Add Product</button>
            `;
            break;
            
        case 'bulkAdd':
            html = `
                <button class="modal-close" onclick="closeModal()">✕</button>
                <h3 class="modal-title">📥 Bulk Add Products</h3>
                <p style="color:#6b7280;font-size:13px;margin-bottom:15px">Enter multiple products (one per line) in format: Name,SKU,Color,Size,Price,Stock</p>
                <div class="form-group">
                    <label>Select Section</label>
                    <select id="bulkSection">
                        <option value="">Select Section</option>
                        ${sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Products (one per line)</label>
                    <textarea id="bulkProducts" rows="6" placeholder="Bangle Gold,BGL-001,Gold,M,499,10&#10;Bangle Red,BGL-002,Red,L,399,15" style="width:100%;padding:10px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;font-family:monospace"></textarea>
                </div>
                <button onclick="bulkAdd()" class="primary-btn">📥 Add All Products</button>
            `;
            break;
            
        case 'aiSet':
            html = `
                <button class="modal-close" onclick="closeModal()">✕</button>
                <h3 class="modal-title">🤖 AI Set Maker</h3>
                <p style="color:#6b7280;font-size:13px;margin-bottom:15px">Create bangle sets from available colors</p>
                <div id="modalColorPalette" class="color-palette"></div>
                <button onclick="generateAISetsModal()" class="primary-btn" style="margin-top:10px">⚡ Generate Sets</button>
                <div id="modalGeneratedSets"></div>
            `;
            break;
            
        default:
            html = `<button class="modal-close" onclick="closeModal()">✕</button><p>Unknown action</p>`;
    }
    
    content.innerHTML = html;
    modal.classList.add('show');
    
    // Refresh color palette if AI Set modal
    if (type === 'aiSet') {
        renderModalColorPalette();
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

// ==========================================
// 4. SECTIONS MANAGEMENT
// ==========================================

function addSection() {
    const name = document.getElementById('sectionNameInput').value.trim();
    if (!name) { alert('Please enter a section name'); return; }
    
    const section = {
        id: 'SEC-' + Date.now(),
        name: name,
        created: new Date().toISOString()
    };
    
    sections.push(section);
    localStorage.setItem('sections', JSON.stringify(sections));
    closeModal();
    updateUI();
    alert('✅ Section "' + name + '" created!');
}

function deleteSection(id) {
    if (!confirm('Delete this section and all products in it?')) return;
    
    // Remove products in this section
    products = products.filter(p => p.sectionId !== id);
    sections = sections.filter(s => s.id !== id);
    
    localStorage.setItem('sections', JSON.stringify(sections));
    localStorage.setItem('products', JSON.stringify(products));
    updateUI();
    alert('✅ Section deleted');
}

// ==========================================
// 5. PRODUCTS MANAGEMENT
// ==========================================

function addProduct() {
    const sectionId = document.getElementById('productSection').value;
    const name = document.getElementById('productName').value.trim();
    const sku = document.getElementById('productSKU').value.trim();
    const color = document.getElementById('productColor').value;
    const size = document.getElementById('productSize').value.trim();
    const purchase = parseFloat(document.getElementById('productPurchase').value) || 0;
    const price = parseFloat(document.getElementById('productPrice').value) || 0;
    const stock = parseInt(document.getElementById('productStock').value) || 0;
    
    if (!sectionId) { alert('Please select a section'); return; }
    if (!name) { alert('Please enter product name'); return; }
    if (!sku) { alert('Please enter SKU'); return; }
    
    // Check duplicate SKU
    if (products.some(p => p.sku === sku)) {
        alert('❌ SKU already exists! Use a unique SKU.');
        return;
    }
    
    const product = {
        id: 'PROD-' + Date.now(),
        sectionId: sectionId,
        name: name,
        sku: sku,
        color: color,
        size: size,
        purchase: purchase,
        price: price,
        stock: stock,
        created: new Date().toISOString()
    };
    
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
    closeModal();
    updateUI();
    alert('✅ Product "' + name + '" added to inventory!');
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
            <select id="editSection">${sectionOptions}</select>
        </div>
        <div class="form-group">
            <label>Product Name</label>
            <input id="editName" value="${product.name}">
        </div>
        <div class="form-group">
            <label>SKU</label>
            <input id="editSKU" value="${product.sku}">
        </div>
        <div class="form-group">
            <label>Color</label>
            <select id="editColor">
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
            <input id="editSize" value="${product.size || ''}">
        </div>
        <div class="form-group">
            <label>Selling Price (₹)</label>
            <input id="editPrice" type="number" value="${product.price}">
        </div>
        <div class="form-group">
            <label>Stock</label>
            <input id="editStock" type="number" value="${product.stock}">
        </div>
        <button onclick="saveEditProduct('${id}')" class="primary-btn">💾 Save Changes</button>
        <button onclick="deleteProduct('${id}')" style="margin-top:10px;padding:10px;background:#ef4444;color:#fff;border:none;border-radius:8px;width:100%;cursor:pointer">🗑️ Delete Product</button>
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
    alert('✅ Product deleted');
}

// ==========================================
// 6. BULK ADD
// ==========================================

function bulkAdd() {
    const sectionId = document.getElementById('bulkSection').value;
    const text = document.getElementById('bulkProducts').value;
    
    if (!sectionId) { alert('Please select a section'); return; }
    if (!text.trim()) { alert('Please enter products'); return; }
    
    const lines = text.split('\n').filter(l => l.trim());
    let added = 0;
    let errors = [];
    
    lines.forEach(line => {
        const parts = line.split(',').map(s => s.trim());
        if (parts.length < 4) {
            errors.push('❌ Invalid: ' + line);
            return;
        }
        
        const [name, sku, color, size, price, stock] = parts;
        
        if (products.some(p => p.sku === sku)) {
            errors.push('❌ SKU "' + sku + '" already exists');
            return;
        }
        
        const product = {
            id: 'PROD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
            sectionId: sectionId,
            name: name,
            sku: sku,
            color: color || '',
            size: size || '',
            purchase: 0,
            price: parseFloat(price) || 0,
            stock: parseInt(stock) || 0,
            created: new Date().toISOString()
        };
        
        products.push(product);
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
// 7. AI SET MAKER
// ==========================================

function renderModalColorPalette() {
    const container = document.getElementById('modalColorPalette');
    if (!container) return;
    
    const colors = {};
    products.forEach(p => {
        if (p.color && p.stock > 0) {
            colors[p.color] = (colors[p.color] || 0) + p.stock;
        }
    });
    
    if (Object.keys(colors).length === 0) {
        container.innerHTML = '<p style="color:#6b7280">No colors in inventory. Add products first!</p>';
        return;
    }
    
    container.innerHTML = Object.entries(colors).map(([color, qty]) => `
        <div style="text-align:center">
            <div class="color-chip" style="background:${getColorHex(color)}"></div>
            <div style="font-size:11px;margin-top:4px">${color}<br>${qty}pcs</div>
        </div>
    `).join('');
}

function generateAISetsModal() {
    const container = document.getElementById('modalGeneratedSets');
    if (!container) return;
    
    const colors = {};
    products.forEach(p => {
        if (p.color && p.stock > 0) {
            colors[p.color] = (colors[p.color] || 0) + p.stock;
        }
    });
    
    const colorNames = Object.keys(colors);
    if (colorNames.length < 2) {
        container.innerHTML = '<p style="color:#ef4444">Need at least 2 colors to generate sets!</p>';
        return;
    }
    
    const sets = [];
    // 2-color combos
    for (let i = 0; i < colorNames.length; i++) {
        for (let j = i+1; j < colorNames.length; j++) {
            const minQty = Math.min(colors[colorNames[i]], colors[colorNames[j]]);
            if (minQty >= 2) {
                sets.push({
                    colors: [colorNames[i], colorNames[j]],
                    maxSets: Math.floor(minQty / 2),
                    name: `${colorNames[i]} + ${colorNames[j]}`
                });
            }
        }
    }
    // 3-color combos
    for (let i = 0; i < colorNames.length; i++) {
        for (let j = i+1; j < colorNames.length; j++) {
            for (let k = j+1; k < colorNames.length; k++) {
                const minQty = Math.min(colors[colorNames[i]], colors[colorNames[j]], colors[colorNames[k]]);
                if (minQty >= 2) {
                    sets.push({
                        colors: [colorNames[i], colorNames[j], colorNames[k]],
                        maxSets: Math.floor(minQty / 2),
                        name: `${colorNames[i]} + ${colorNames[j]} + ${colorNames[k]}`
                    });
                }
            }
        }
    }
    
    if (sets.length === 0) {
        container.innerHTML = '<p style="color:#ef4444">Not enough stock to create sets!</p>';
        return;
    }
    
    container.innerHTML = sets.slice(0, 12).map((set, idx) => `
        <div class="set-card">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <h4>${set.name}</h4>
                <span class="badge badge-green">${set.maxSets} sets</span>
            </div>
            <div class="set-colors">
                ${set.colors.map(c => `<span style="background:${getColorHex(c)}"></span>`).join('')}
            </div>
            <button onclick="addSetToInventory(${idx})" style="margin-top:10px;padding:8px 16px;background:#22c55e;color:#fff;border:none;border-radius:6px;cursor:pointer">➕ Add to Inventory</button>
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
    
    // Find or create a section for sets
    let setSection = sections.find(s => s.name === 'AI Sets');
    if (!setSection) {
        setSection = {
            id: 'SEC-AI-' + Date.now(),
            name: 'AI Sets',
            created: new Date().toISOString()
        };
        sections.push(setSection);
        localStorage.setItem('sections', JSON.stringify(sections));
    }
    
    const product = {
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
    };
    
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
    closeModal();
    updateUI();
    alert(`✅ Added "${product.name}" (${set.maxSets} sets)`);
}

// ==========================================
// 8. INVENTORY RENDER
// ==========================================

function renderInventory() {
    const container = document.getElementById('inventorySections');
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filterSection = document.getElementById('filterSection')?.value || '';
    const filterColor = document.getElementById('filterColor')?.value || '';
    
    // Update section filter dropdown
    const filterSelect = document.getElementById('filterSection');
    if (filterSelect) {
        const currentVal = filterSelect.value;
        filterSelect.innerHTML = `<option value="">All Sections</option>` + 
            sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        filterSelect.value = currentVal;
    }
    
    // Filter products
    let filtered = products;
    if (search) filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(search) || 
        p.sku?.toLowerCase().includes(search)
    );
    if (filterSection) filtered = filtered.filter(p => p.sectionId === filterSection);
    if (filterColor) filtered = filtered.filter(p => p.color === filterColor);
    
    if (sections.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align:center;padding:30px">
                <p style="color:#6b7280">No sections created yet.</p>
                <button onclick="openModal('addSection')" class="primary-btn" style="margin-top:10px;width:auto;padding:10px 30px">📁 Create First Section</button>
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
                    <div class="section-products" style="text-align:center;padding:15px;color:#9ca3af;font-size:13px">
                        No products in this section
                    </div>
                </div>
            `;
            return;
        }
        
        if (sectionProducts.length === 0) return;
        
        html += `
            <div class="section-card">
                <div class="section-header">
                    <span class="section-name">📁 ${section.name}</span>
                    <span class="section-count">${sectionProducts.length} products</span>
                    <button onclick="deleteSection('${section.id}')" style="background:#ef4444;color:#fff;border:none;border-radius:4px;padding:2px 8px;cursor:pointer;font-size:11px">✕</button>
                </div>
                <div class="section-products">
                    ${sectionProducts.map(p => `
                        <div class="product-item">
                            <div>
                                <div class="product-name">${p.name}</div>
                                <div class="product-sku">SKU: ${p.sku} • ${p.color || 'No color'} ${p.size ? '• '+p.size : ''}</div>
                            </div>
                            <div style="text-align:right">
                                <div class="product-price">₹${p.price || 0}</div>
                                <div class="product-stock">
                                    <span class="badge ${(p.stock || 0) < 5 ? 'badge-red' : 'badge-green'}">${p.stock || 0}</span>
                                </div>
                                <button onclick="editProduct('${p.id}')" style="background:#3b82f6;color:#fff;border:none;padding:2px 10px;border-radius:4px;cursor:pointer;font-size:11px;margin-top:4px">✏️ Edit</button>
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
// 9. BILL SYSTEM
// ==========================================

function scanBillProduct() {
    const query = prompt('Enter SKU or product name:');
    if (!query) return;
    
    const product = products.find(p => 
        p.sku?.toLowerCase().includes(query.toLowerCase()) || 
        p.name?.toLowerCase().includes(query.toLowerCase())
    );
    
    if (!product) { alert('❌ Product not found!'); return; }
    if ((product.stock || 0) < 1) { alert('❌ Out of stock!'); return; }
    
    const qty = parseInt(prompt('Quantity:', '1')) || 1;
    if (qty > product.stock) { alert('❌ Not enough stock! Available: ' + product.stock); return; }
    
    currentBill.push({
        ...product,
        qty: qty,
        subtotal: product.price * qty
    });
    
    renderBillItems();
}

function renderBillItems() {
    const container = document.getElementById('billItems');
    if (currentBill.length === 0) {
        container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:10px">No items added</p>';
        return;
    }
    
    container.innerHTML = currentBill.map((item, idx) => `
        <div class="product-item">
            <div>
                <div class="product-name">${item.name}</div>
                <div class="product-sku">₹${item.price} × ${item.qty}</div>
            </div>
            <div>
                <span style="font-weight:600">₹${item.subtotal}</span>
                <button onclick="removeBillItem(${idx})" style="margin-left:10px;color:#ef4444;background:none;border:none;cursor:pointer;font-size:18px">✕</button>
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
        subtotal: subtotal,
        discount: discount,
        total: total
    };
    
    // Deduct stock
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
                <div>
                    <span style="font-weight:700">₹${b.total}</span>
                    <div style="font-size:11px;color:#6b7280">${b.customer}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function viewBill(id) {
    const bill = bills.find(b => b.id === id);
    if (!bill) return;
    
    let itemsHtml = bill.items.map(i => 
        `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:13px">
            <span>${i.name} × ${i.qty}</span>
            <span>₹${i.subtotal}</span>
        </div>`
    ).join('');
    
    alert(
        `🧾 BILL DETAILS\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Bill: ${bill.id}\n` +
        `Date: ${bill.date}\n` +
        `Customer: ${bill.customer}\n` +
        `Mobile: ${bill.mobile || 'N/A'}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Items:\n${bill.items.map(i => `  ${i.name} × ${i.qty} = ₹${i.subtotal}`).join('\n')}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Subtotal: ₹${bill.subtotal}\n` +
        `Discount: ₹${bill.discount}\n` +
        `TOTAL: ₹${bill.total}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━`
    );
}

// ==========================================
// 10. UPDATE UI
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
                <p style="color:#6b7280">No sections created.</p>
                <button onclick="openModal('addSection')" class="primary-btn" style="margin-top:10px;width:auto;padding:10px 30px">📁 Create Section</button>
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
    products.forEach(p => {
        if (p.color && p.stock > 0) {
            colors[p.color] = (colors[p.color] || 0) + p.stock;
        }
    });
    
    if (Object.keys(colors).length === 0) {
        container.innerHTML = '<p style="color:#6b7280">No colors available</p>';
        return;
    }
    
    container.innerHTML = Object.entries(colors).map(([color, qty]) => `
        <div style="text-align:center">
            <div class="color-chip" style="background:${getColorHex(color)}"></div>
            <div style="font-size:11px;margin-top:4px">${color}<br>${qty}pcs</div>
        </div>
    `).join('');
}

function generateAISets() {
    updateColorPalette();
    alert('Go to AI Set Maker page or click "Generate Sets" in modal!');
    switchPage('aiSet');
}

// ==========================================
// 11. MORE OPTIONS
// ==========================================

function exportData() {
    const data = {
        products: products,
        sections: sections,
        bills: bills,
        exported: new Date().toISOString()
    };
    
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
    
    products = [];
    sections = [];
    bills = [];
    currentBill = [];
    
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
        '✅ Sections Management\n' +
        '✅ Products by Section\n' +
        '✅ AI Set Maker\n' +
        '✅ Billing System\n' +
        '✅ Firebase Ready\n' +
        '✅ Local Storage\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n' +
        '🔑 Firebase API Key Added\n' +
        '📧 jatinsagar319@gmail.com'
    );
}

// ==========================================
// 12. INITIALIZATION
// ==========================================

// Check if user is already logged in
if (localStorage.getItem('userPhone')) {
    currentUser = localStorage.getItem('userPhone');
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('bottomNav').classList.remove('hidden');
    document.getElementById('userDisplay').textContent = currentUser;
    updateUI();
} else {
    document.getElementById('loginScreen').style.display = 'flex';
}

// Search and filter listeners
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', renderInventory);
    }
    
    const filterSection = document.getElementById('filterSection');
    if (filterSection) {
        filterSection.addEventListener('change', renderInventory);
    }
    
    const filterColor = document.getElementById('filterColor');
    if (filterColor) {
        filterColor.addEventListener('change', renderInventory);
    }
});

console.log('✅ Smart Inventory v2.0 Loaded');
console.log('🔑 Firebase API Key: AIzaSyCaqe-u5VHqZlxvJ0Zq3aWi9R93m-B93JM');
console.log('📦 Sections:', sections.length);
console.log('📦 Products:', products.length);
console.log('🧾 Bills:', bills.length);
