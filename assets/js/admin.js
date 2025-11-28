// Admin Dashboard Script

// VND Currency Formatter
function formatVND(amount) {
    return amount.toLocaleString('vi-VN') + '₫';
}

// Sample Data
let orders = [];
let customers = [];
let menuItems = [];
let currentAdmin = null;

// Load menu items from localStorage or use default
function initializeMenuItems() {
    const savedMenuItems = localStorage.getItem('menuItems');
    if (savedMenuItems) {
        menuItems = JSON.parse(savedMenuItems);
    } else {
        // Default menu items (same as in script.js)
        menuItems = [
            { id: 1, name: 'Espresso', price: 87500, description: 'Rich and bold espresso shot', category: 'hot', image: 'linear-gradient(135deg, #6f4e37, #8B4513)' },
            { id: 2, name: 'Cappuccino', price: 112500, description: 'Espresso with steamed milk foam', category: 'hot', image: 'linear-gradient(135deg, #8B4513, #A0522D)' },
            { id: 3, name: 'Latte', price: 118750, description: 'Smooth espresso with steamed milk', category: 'hot', image: 'linear-gradient(135deg, #D2691E, #CD853F)' },
            { id: 4, name: 'Americano', price: 93750, description: 'Espresso with hot water', category: 'hot', image: 'linear-gradient(135deg, #4B3621, #6F4E37)' },
            { id: 5, name: 'Iced Coffee', price: 100000, description: 'Refreshing cold brewed coffee', category: 'iced', image: 'linear-gradient(135deg, #4682B4, #5F9EA0)' },
            { id: 6, name: 'Iced Latte', price: 125000, description: 'Cold espresso with milk and ice', category: 'iced', image: 'linear-gradient(135deg, #87CEEB, #B0E0E6)' },
            { id: 7, name: 'Cold Brew', price: 112500, description: 'Smooth cold brewed coffee', category: 'iced', image: 'linear-gradient(135deg, #2C3E50, #34495E)' },
            { id: 8, name: 'Frappe', price: 137500, description: 'Blended iced coffee drink', category: 'iced', image: 'linear-gradient(135deg, #D4A574, #E8C39E)' },
            { id: 9, name: 'Caramel Macchiato', price: 143750, description: 'Vanilla and caramel latte', category: 'special', image: 'linear-gradient(135deg, #D2691E, #F4A460)' },
            { id: 10, name: 'Mocha', price: 131250, description: 'Chocolate and espresso blend', category: 'special', image: 'linear-gradient(135deg, #3E2723, #5D4037)' },
            { id: 11, name: 'Vanilla Latte', price: 125000, description: 'Latte with vanilla syrup', category: 'special', image: 'linear-gradient(135deg, #F5DEB3, #FFE4B5)' },
            { id: 12, name: 'Pumpkin Spice', price: 150000, description: 'Seasonal pumpkin spice latte', category: 'special', image: 'linear-gradient(135deg, #FF8C00, #FFA500)' }
        ];
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
    }
}

// Check Authentication
function checkAuth() {
    const adminSession = localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession');
    
    if (!adminSession) {
        // Not logged in, redirect to login page
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        currentAdmin = JSON.parse(adminSession);
        
        // Update UI with admin info
        document.getElementById('adminName').textContent = currentAdmin.name;
        document.getElementById('adminRoleName').textContent = currentAdmin.role;
        
        // Update avatar
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentAdmin.name)}&background=6f4e37&color=fff`;
        document.getElementById('adminAvatar').src = avatarUrl;
        
        return true;
    } catch (e) {
        // Invalid session, redirect to login
        localStorage.removeItem('adminSession');
        sessionStorage.removeItem('adminSession');
        window.location.href = 'login.html';
        return false;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAuth()) {
        return;
    }
    
    initializeMenuItems();
    loadData();
    updateDashboard();
    setupEventListeners();
    loadOrders();
    loadCustomers();
    loadMenuItems();
});

// Load Data from localStorage
function loadData() {
    // Load orders from 'orders' key (where cart.js saves them)
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }

    // Load customers
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        customers = JSON.parse(savedUsers);
    }

    // Menu items are already loaded by initializeMenuItems()
    // Don't override them here!
}

// Update Dashboard Stats
function updateDashboard() {
    // Calculate stats
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const totalCustomers = customers.length;

    // Update UI
    document.getElementById('totalRevenue').textContent = formatVND(totalRevenue);
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('totalCustomers').textContent = totalCustomers;
    document.getElementById('orderBadge').textContent = pendingOrders;

    // Update recent orders
    updateRecentOrders();
    updateTopSelling();
}

// Update Recent Orders
function updateRecentOrders() {
    const recentOrdersList = document.getElementById('recentOrdersList');
    const recentOrders = orders.slice(-5).reverse();

    if (recentOrders.length === 0) {
        recentOrdersList.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">No orders yet</p>';
        return;
    }

    recentOrdersList.innerHTML = recentOrders.map(order => `
        <div class="order-item-compact">
            <div>
                <strong>#${order.id}</strong>
                <p style="color: #666; font-size: 0.85rem;">${order.customerName}</p>
            </div>
            <div style="text-align: right;">
                <strong style="color: var(--accent-color);">${formatVND(order.total)}</strong>
                <p><span class="status-badge status-${order.status}">${order.status}</span></p>
            </div>
        </div>
    `).join('');
}

// Update Top Selling
function updateTopSelling() {
    const topSellingList = document.getElementById('topSellingList');
    
    // Calculate item sales
    const itemSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!itemSales[item.name]) {
                itemSales[item.name] = { count: 0, revenue: 0 };
            }
            itemSales[item.name].count += item.quantity;
            itemSales[item.name].revenue += (item.totalPrice || item.price) * item.quantity;
        });
    });

    // Sort by count
    const sortedItems = Object.entries(itemSales)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5);

    if (sortedItems.length === 0) {
        topSellingList.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">No sales data yet</p>';
        return;
    }

    topSellingList.innerHTML = sortedItems.map(([name, data]) => `
        <div class="order-item-compact">
            <div>
                <strong>${name}</strong>
                <p style="color: #666; font-size: 0.85rem;">${data.count} sold</p>
            </div>
            <div style="text-align: right;">
                <strong style="color: var(--primary-color);">${formatVND(data.revenue)}</strong>
            </div>
        </div>
    `).join('');
}

// Show Section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Add active to clicked nav item
    event.target.closest('.nav-item').classList.add('active');
}

// Load Orders
function loadOrders() {
    const ordersTableBody = document.getElementById('ordersTableBody');
    
    if (orders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #999;">No orders yet</td></tr>';
        return;
    }

    ordersTableBody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>#${order.id}</strong></td>
            <td>${order.customerName}</td>
            <td>${order.items.length} items</td>
            <td><strong>${formatVND(order.total)}</strong></td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-action btn-view" onclick="viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="updateOrderStatus('${order.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteOrder('${order.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter Orders
function filterOrders(status) {
    const buttons = document.querySelectorAll('.order-filters .filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const filteredOrders = status === 'all' 
        ? orders 
        : orders.filter(o => o.status === status);

    const ordersTableBody = document.getElementById('ordersTableBody');
    
    if (filteredOrders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #999;">No orders found</td></tr>';
        return;
    }

    ordersTableBody.innerHTML = filteredOrders.map(order => `
        <tr>
            <td><strong>#${order.id}</strong></td>
            <td>${order.customerName}</td>
            <td>${order.items.length} items</td>
            <td><strong>$${order.total.toFixed(2)}</strong></td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-action btn-view" onclick="viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="updateOrderStatus('${order.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteOrder('${order.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// View Order Details
function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const orderDetailContent = document.getElementById('orderDetailContent');
    orderDetailContent.innerHTML = `
        <div style="display: grid; gap: 1.5rem;">
            <div style="background: var(--light-color); padding: 1.5rem; border-radius: 10px;">
                <h3 style="color: var(--primary-color); margin-bottom: 1rem;">
                    Order #${order.id}
                    ${order.isDelivery ? '<span style="background: #4CAF50; color: white; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; margin-left: 8px;"><i class="fas fa-shipping-fast"></i> GIAO HÀNG</span>' : '<span style="background: #2196F3; color: white; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; margin-left: 8px;"><i class="fas fa-store"></i> TẠI QUÁN</span>'}
                </h3>
                <p><strong>Customer:</strong> ${order.customerName} ${order.isGuest ? '<span style="background: #ff9800; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 5px;">GUEST</span>' : ''}</p>
                ${order.guestInfo ? `
                    <div style="margin-top: 1rem; padding: 1rem; background: white; border-radius: 8px; border-left: 4px solid var(--accent-color);">
                        <p style="margin: 0.3rem 0;"><strong><i class="fas fa-user"></i> Tên:</strong> ${order.guestInfo.name}</p>
                        <p style="margin: 0.3rem 0;"><strong><i class="fas fa-phone"></i> SĐT:</strong> ${order.guestInfo.phone}</p>
                    </div>
                ` : ''}
                ${order.deliveryInfo ? `
                    <div style="margin-top: 1rem; padding: 1rem; background: #e8f5e9; border-radius: 8px; border-left: 4px solid #4CAF50;">
                        <h4 style="color: #2e7d32; margin-bottom: 0.5rem;"><i class="fas fa-map-marker-alt"></i> Thông tin giao hàng</h4>
                        <p style="margin: 0.3rem 0;"><strong>Địa chỉ:</strong> ${order.deliveryInfo.address}</p>
                        ${order.deliveryInfo.note ? `<p style="margin: 0.3rem 0;"><strong>Ghi chú:</strong> ${order.deliveryInfo.note}</p>` : ''}
                    </div>
                ` : ''}
                <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
            </div>
            
            <div>
                <h4 style="color: var(--primary-color); margin-bottom: 1rem;">Order Items:</h4>
                ${order.items.map(item => `
                    <div style="background: var(--light-color); padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <strong>${item.name}</strong> x ${item.quantity}
                                <p style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">
                                    ${item.customizations ? `
                                        Size: ${item.customizations.size}<br>
                                        Sugar: ${item.customizations.sugar}<br>
                                        ${item.customizations.ice ? `Ice: ${item.customizations.ice}<br>` : ''}
                                        ${item.customizations.milk !== 'Regular' ? `Milk: ${item.customizations.milk}<br>` : ''}
                                        ${item.customizations.extraShots > 0 ? `+${item.customizations.extraShots} shot(s)<br>` : ''}
                                        ${item.customizations.notes ? `Note: ${item.customizations.notes}` : ''}
                                    ` : ''}
                                </p>
                            </div>
                            <strong style="color: var(--accent-color);">${formatVND((item.totalPrice || item.price) * item.quantity)}</strong>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="background: var(--primary-color); color: white; padding: 1.5rem; border-radius: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Subtotal:</span>
                    <strong>${formatVND(order.subtotal)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Tax (10%):</span>
                    <strong>${formatVND(order.tax)}</strong>
                </div>
                ${order.deliveryFee && order.deliveryFee > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Phí giao hàng:</span>
                        <strong>${formatVND(order.deliveryFee)}</strong>
                    </div>
                ` : ''}
                ${order.discount > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Discount:</span>
                        <strong>-${formatVND(order.discount)}</strong>
                    </div>
                ` : ''}
                <hr style="margin: 1rem 0; border-color: rgba(255,255,255,0.3);">
                <div style="display: flex; justify-content: space-between; font-size: 1.3rem;">
                    <strong>Total:</strong>
                    <strong>${formatVND(order.total)}</strong>
                </div>
            </div>
        </div>
    `;

    document.getElementById('orderDetailModal').style.display = 'block';
}

// Update Order Status
function updateOrderStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const statuses = ['pending', 'preparing', 'completed', 'cancelled'];
    const currentIndex = statuses.indexOf(order.status);
    const nextIndex = (currentIndex + 1) % statuses.length;

    order.status = statuses[nextIndex];
    saveOrders();
    loadOrders();
    updateDashboard();
    showNotification(`Order #${orderId} status updated to ${order.status}`);
}

// Delete Order
function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) return;

    orders = orders.filter(o => o.id !== orderId);
    saveOrders();
    loadOrders();
    updateDashboard();
    showNotification('Order deleted successfully');
}

// Save Orders
function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Load Customers
function loadCustomers() {
    const customersTableBody = document.getElementById('customersTableBody');
    
    if (customers.length === 0) {
        customersTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #999;">No customers yet</td></tr>';
        return;
    }

    customersTableBody.innerHTML = customers.map(customer => {
        const customerOrders = orders.filter(o => o.customerEmail === customer.email);
        const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);

        return `
            <tr>
                <td><strong>${customer.name}</strong></td>
                <td>${customer.email}</td>
                <td><strong>${customer.points || 0}</strong> pts</td>
                <td>${customerOrders.length}</td>
                <td><strong>${formatVND(totalSpent)}</strong></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-action btn-view" onclick="viewCustomer('${customer.email}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteCustomer('${customer.email}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Load Menu Items
function loadMenuItems() {
    const adminMenuGrid = document.getElementById('adminMenuGrid');
    
    adminMenuGrid.innerHTML = menuItems.map(item => `
        <div class="menu-admin-item">
            <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">${item.name}</h3>
            <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">${item.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <span style="font-size: 1.2rem; font-weight: bold; color: var(--accent-color);">${formatVND(item.price)}</span>
                <span class="status-badge" style="background: var(--secondary-color); color: var(--dark-color);">${item.category}</span>
            </div>
            <div class="action-btns">
                <button class="btn-action btn-edit" onclick="editMenuItem(${item.id})" style="flex: 1;">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-action btn-delete" onclick="deleteMenuItem(${item.id})" style="flex: 1;">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Setup Event Listeners
function setupEventListeners() {
    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Click outside to close modals
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Add menu item form
    document.getElementById('addItemForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addMenuItem();
    });

    // Edit menu item form
    document.getElementById('editItemForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateMenuItem();
    });
}

// Open Add Item Modal
function openAddItemModal() {
    document.getElementById('addItemModal').style.display = 'block';
}

// Add Menu Item
function addMenuItem() {
    const name = document.getElementById('newItemName').value;
    const description = document.getElementById('newItemDescription').value;
    const price = parseFloat(document.getElementById('newItemPrice').value);
    const category = document.getElementById('newItemCategory').value;
    const imageUrl = document.getElementById('newItemImageUrl').value.trim();

    let image;
    if (imageUrl) {
        // Use provided image URL
        image = `url('${imageUrl}')`;
    } else {
        // Generate random gradient for image
        const colors = [
            ['#6f4e37', '#8B4513'], ['#8B4513', '#A0522D'], ['#D2691E', '#CD853F'],
            ['#4B3621', '#6F4E37'], ['#4682B4', '#5F9EA0'], ['#87CEEB', '#B0E0E6'],
            ['#2C3E50', '#34495E'], ['#D4A574', '#E8C39E'], ['#D2691E', '#F4A460'],
            ['#3E2723', '#5D4037'], ['#F5DEB3', '#FFE4B5'], ['#FF8C00', '#FFA500']
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        image = `linear-gradient(135deg, ${randomColor[0]}, ${randomColor[1]})`;
    }

    const newItem = {
        id: menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1,
        name,
        description,
        price,
        category,
        image
    };

    menuItems.push(newItem);
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    loadMenuItems();
    document.getElementById('addItemModal').style.display = 'none';
    document.getElementById('addItemForm').reset();
    showNotification('Menu item added successfully');
}

// Edit Menu Item
function editMenuItem(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    // Fill the edit form with current values
    document.getElementById('editItemId').value = item.id;
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editItemDescription').value = item.description;
    document.getElementById('editItemPrice').value = item.price;
    document.getElementById('editItemCategory').value = item.category;
    
    // Clear image URL field (user can fill if they want to change)
    document.getElementById('editItemImageUrl').value = '';

    // Show the edit modal
    document.getElementById('editItemModal').style.display = 'block';
}

// Update Menu Item
function updateMenuItem() {
    const itemId = parseInt(document.getElementById('editItemId').value);
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    item.name = document.getElementById('editItemName').value;
    item.description = document.getElementById('editItemDescription').value;
    item.price = parseFloat(document.getElementById('editItemPrice').value);
    item.category = document.getElementById('editItemCategory').value;
    
    // Update image only if new URL is provided
    const imageUrl = document.getElementById('editItemImageUrl').value.trim();
    if (imageUrl) {
        item.image = `url('${imageUrl}')`;
    }
    // Otherwise keep existing image

    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    loadMenuItems();
    document.getElementById('editItemModal').style.display = 'none';
    showNotification('Menu item updated successfully');
}

// Delete Menu Item
function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    menuItems = menuItems.filter(i => i.id !== itemId);
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    loadMenuItems();
    showNotification('Menu item deleted successfully');
}

// View Customer
function viewCustomer(email) {
    const customer = customers.find(c => c.email === email);
    if (!customer) return;

    const customerOrders = orders.filter(o => o.customerEmail === email);
    alert(`Customer: ${customer.name}\nEmail: ${email}\nTotal Orders: ${customerOrders.length}\nPoints: ${customer.points || 0}`);
}

// Delete Customer
function deleteCustomer(email) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    customers = customers.filter(c => c.email !== email);
    localStorage.setItem('users', JSON.stringify(customers));
    loadCustomers();
    showNotification('Customer deleted successfully');
}

// Logout
function logout() {
    showLogoutModal();
}

function showLogoutModal() {
    const modal = document.createElement('div');
    modal.id = 'logoutModalAdmin';
    modal.style.cssText = `
        display: block;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
    `;
    
    modal.innerHTML = `
        <div style="
            position: relative;
            background-color: white;
            margin: 15% auto;
            padding: 0;
            width: 90%;
            max-width: 400px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: slideDown 0.3s ease-out;
        ">
            <div style="
                padding: 1.5rem;
                background: linear-gradient(135deg, #ff6b6b, #ff8787);
                color: white;
                border-radius: 15px 15px 0 0;
                text-align: center;
            ">
                <i class="fas fa-sign-out-alt" style="font-size: 3rem; margin-bottom: 0.5rem;"></i>
                <h2 style="margin: 0; font-size: 1.5rem;">Confirm Logout</h2>
            </div>
            <div style="
                padding: 2rem;
                text-align: center;
                font-size: 1.1rem;
                color: #2c1810;
            ">
                <p>Are you sure you want to logout from admin panel?</p>
            </div>
            <div style="
                padding: 1rem 1.5rem 1.5rem;
                display: flex;
                gap: 1rem;
                justify-content: center;
            ">
                <button onclick="closeLogoutModal()" style="
                    padding: 0.75rem 2rem;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    background-color: #e0e0e0;
                    color: #2c1810;
                    transition: all 0.3s;
                ">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button onclick="confirmLogout()" style="
                    padding: 0.75rem 2rem;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    background-color: #ff6b6b;
                    color: white;
                    transition: all 0.3s;
                ">
                    <i class="fas fa-check"></i> Logout
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeLogoutModal();
        }
    };
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModalAdmin');
    if (modal) modal.remove();
}

function confirmLogout() {
    closeLogoutModal();
    showNotification('Logged out successfully!');
    
    setTimeout(() => {
        // Clear admin session
        localStorage.removeItem('adminSession');
        sessionStorage.removeItem('adminSession');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }, 1500);
}


// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 3000;
        animation: slideIn 0.3s;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Generate sample orders (for testing)
function generateSampleOrders() {
    const sampleOrders = [
        {
            id: 'ORD001',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            items: [
                { name: 'Espresso', quantity: 2, price: 3.50, totalPrice: 3.50 },
                { name: 'Cappuccino', quantity: 1, price: 4.50, totalPrice: 4.50 }
            ],
            subtotal: 11.50,
            tax: 1.15,
            discount: 0,
            total: 12.65,
            status: 'pending',
            date: new Date().toISOString()
        },
        {
            id: 'ORD002',
            customerName: 'Jane Smith',
            customerEmail: 'jane@example.com',
            items: [
                { name: 'Iced Latte', quantity: 1, price: 5.00, totalPrice: 5.50 }
            ],
            subtotal: 5.50,
            tax: 0.55,
            discount: 0,
            total: 6.05,
            status: 'preparing',
            date: new Date().toISOString()
        }
    ];

    orders = sampleOrders;
    saveOrders();
    loadOrders();
    updateDashboard();
    showNotification('Sample orders generated');
}
