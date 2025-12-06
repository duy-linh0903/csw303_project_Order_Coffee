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
                        ${order.deliveryInfo.deliveryTime ? `<p style="margin: 0.3rem 0;"><strong>Thời gian giao:</strong> ${new Date(order.deliveryInfo.deliveryTime).toLocaleString('vi-VN')}</p>` : ''}
                        ${order.deliveryInfo.note ? `<p style="margin: 0.3rem 0;"><strong>Ghi chú:</strong> ${order.deliveryInfo.note}</p>` : ''}
                        ${order.compensationGiven ? `<p style="margin: 0.3rem 0; color: #f57c00;"><strong><i class="fas fa-gift"></i> Đã tặng mã đền bù vì giao trễ</strong></p>` : ''}
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
    
    // Dispatch event for shop status update
    window.dispatchEvent(new CustomEvent('orderUpdated'));
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
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
    const userOrdersList = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const customerUserOrders = userOrdersList.filter(o => o.userEmail === email);
    
    // Calculate member tier
    let tier = 'Chưa có thẻ';
    let tierClass = 'none';
    let tierDiscount = 0;
    let tierIcon = 'fa-user';
    
    if (totalSpent >= 10000000) {
        tier = 'Thẻ Kim Cương';
        tierClass = 'diamond';
        tierDiscount = 15;
        tierIcon = 'fa-gem';
    } else if (totalSpent >= 3000000) {
        tier = 'Thẻ Vàng';
        tierClass = 'gold';
        tierDiscount = 10;
        tierIcon = 'fa-crown';
    } else if (totalSpent >= 500000) {
        tier = 'Thẻ Bạc';
        tierClass = 'silver';
        tierDiscount = 5;
        tierIcon = 'fa-medal';
    }

    // Calculate average order value
    const avgOrderValue = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;

    // Get recent orders (last 5)
    const recentOrders = customerOrders
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    // Calculate points earned
    const totalPointsEarned = customerUserOrders.reduce((sum, o) => sum + (o.pointsEarned || 0), 0);

    // Calculate most ordered items
    const itemCounts = {};
    customerOrders.forEach(order => {
        order.items.forEach(item => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
    });
    
    const favoriteItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const customerDetailContent = document.getElementById('customerDetailContent');
    customerDetailContent.innerHTML = `
        <div style="display: grid; gap: 2rem;">
            <!-- Customer Header -->
            <div class="customer-detail-header">
                <div class="customer-avatar-large">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&size=120&background=6f4e37&color=fff" 
                         alt="${customer.name}">
                </div>
                <div class="customer-info-header">
                    <h2>${customer.name}</h2>
                    <p class="customer-email"><i class="fas fa-envelope"></i> ${email}</p>
                    <div class="customer-tier-badge ${tierClass}">
                        <i class="fas ${tierIcon}"></i> ${tier}
                        ${tierDiscount > 0 ? `<span class="tier-discount">Giảm ${tierDiscount}%</span>` : ''}
                    </div>
                </div>
            </div>

            <!-- Statistics Grid -->
            <div class="customer-stats-grid">
                <div class="customer-stat-card">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${customerOrders.length}</h3>
                        <p>Tổng đơn hàng</p>
                    </div>
                </div>
                <div class="customer-stat-card">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                        <i class="fas fa-dong-sign"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${formatVND(totalSpent)}</h3>
                        <p>Tổng chi tiêu</p>
                    </div>
                </div>
                <div class="customer-stat-card">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${formatVND(avgOrderValue)}</h3>
                        <p>Giá trị TB/đơn</p>
                    </div>
                </div>
                <div class="customer-stat-card">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${customer.points || 0}</h3>
                        <p>Điểm hiện tại</p>
                    </div>
                </div>
            </div>

            <!-- Additional Info -->
            <div class="customer-detail-grid">
                <!-- Favorite Items -->
                <div class="customer-detail-section">
                    <h3><i class="fas fa-heart"></i> Món yêu thích</h3>
                    ${favoriteItems.length > 0 ? `
                        <div class="favorite-items-list">
                            ${favoriteItems.map(([name, count], index) => `
                                <div class="favorite-item">
                                    <div class="favorite-rank">${index + 1}</div>
                                    <div class="favorite-info">
                                        <strong>${name}</strong>
                                        <span>${count} lần đặt</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: #999; text-align: center;">Chưa có dữ liệu</p>'}
                </div>

                <!-- Points History -->
                <div class="customer-detail-section">
                    <h3><i class="fas fa-coins"></i> Lịch sử điểm</h3>
                    <div class="points-summary">
                        <div class="points-item">
                            <span>Tổng điểm đã kiếm:</span>
                            <strong>${totalPointsEarned} điểm</strong>
                        </div>
                        <div class="points-item">
                            <span>Điểm hiện tại:</span>
                            <strong style="color: #4caf50;">${customer.points || 0} điểm</strong>
                        </div>
                        <div class="points-item">
                            <span>Điểm đã dùng:</span>
                            <strong>${totalPointsEarned - (customer.points || 0)} điểm</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Orders -->
            <div class="customer-detail-section">
                <h3><i class="fas fa-history"></i> Đơn hàng gần đây</h3>
                ${recentOrders.length > 0 ? `
                    <div class="customer-orders-list">
                        ${recentOrders.map(order => `
                            <div class="customer-order-item">
                                <div class="order-info">
                                    <strong>#${order.id}</strong>
                                    <span class="order-date">${new Date(order.date).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div class="order-items">
                                    ${order.items.map(item => `<span class="order-item-tag">${item.name} x${item.quantity}</span>`).join('')}
                                </div>
                                <div class="order-status">
                                    <span class="status-badge status-${order.status}">${order.status}</span>
                                    <strong style="color: var(--primary-color);">${formatVND(order.total)}</strong>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: #999; text-align: center;">Chưa có đơn hàng nào</p>'}
            </div>

            <!-- Action Buttons -->
            <div class="customer-actions">
                <button class="btn-action-large btn-primary" onclick="sendEmailToCustomer('${email}')">
                    <i class="fas fa-envelope"></i> Gửi Email
                </button>
                <button class="btn-action-large btn-secondary" onclick="viewAllCustomerOrders('${email}')">
                    <i class="fas fa-list"></i> Xem tất cả đơn hàng
                </button>
            </div>
        </div>
    `;

    document.getElementById('customerDetailModal').style.display = 'block';
}

// Send Email to Customer (placeholder)
function sendEmailToCustomer(email) {
    showNotification(`Đang soạn email cho ${email}...`);
    // In real app, this would open email client or send via API
}

// View All Customer Orders
function viewAllCustomerOrders(email) {
    document.getElementById('customerDetailModal').style.display = 'none';
    showSection('orders');
    
    // Filter orders for this customer
    setTimeout(() => {
        const ordersTableBody = document.getElementById('ordersTableBody');
        const customerOrders = orders.filter(o => o.customerEmail === email);
        
        if (customerOrders.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #999;">Không tìm thấy đơn hàng</td></tr>';
            return;
        }

        ordersTableBody.innerHTML = customerOrders.map(order => `
            <tr style="background: #fffbea;">
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
    }, 100);
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

// ==================== ANALYTICS FUNCTIONS ====================

let analyticsCharts = {};
let analyticsPeriod = 7; // Default 7 days

// Change Analytics Period
function changeAnalyticsPeriod(days) {
    analyticsPeriod = days;
    
    // Update button states
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.period) === days) {
            btn.classList.add('active');
        }
    });
    
    // Reload analytics
    loadAnalytics();
}

// Load Analytics Data
function loadAnalytics() {
    if (!orders || orders.length === 0) {
        showEmptyAnalytics();
        return;
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - analyticsPeriod);
    
    // Filter orders by period
    const periodOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= startDate && orderDate <= endDate;
    });
    
    // Update metrics
    updateAnalyticsMetrics(periodOrders);
    
    // Update charts
    updateRevenueChart(periodOrders);
    updateCategoryChart(periodOrders);
    updateOrderStatusChart(periodOrders);
    updateCustomerTierChart();
    updateTopProducts(periodOrders);
    updateTopCustomers();
    updateHourlyChart(periodOrders);
    updateWeekdayChart(periodOrders);
}

// Show Empty Analytics
function showEmptyAnalytics() {
    const sections = ['revenueChart', 'categoryChart', 'orderStatusChart', 'customerTierChart'];
    sections.forEach(id => {
        const canvas = document.getElementById(id);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#999';
            ctx.textAlign = 'center';
            ctx.fillText('Chưa có dữ liệu', canvas.width / 2, canvas.height / 2);
        }
    });
}

// Update Analytics Metrics
function updateAnalyticsMetrics(periodOrders) {
    const totalRevenue = periodOrders.reduce((sum, order) => sum + order.total, 0);
    const avgRevenue = periodOrders.length > 0 ? totalRevenue / analyticsPeriod : 0;
    const avgOrders = periodOrders.length / analyticsPeriod;
    const avgOrderValue = periodOrders.length > 0 ? totalRevenue / periodOrders.length : 0;
    
    // Count new customers in period
    const customerEmails = new Set(periodOrders.map(o => o.customerEmail));
    const newCustomers = customerEmails.size;
    
    // Update UI
    document.getElementById('avgRevenue').textContent = formatVND(Math.round(avgRevenue));
    document.getElementById('avgOrders').textContent = avgOrders.toFixed(1);
    document.getElementById('avgOrderValue').textContent = formatVND(Math.round(avgOrderValue));
    document.getElementById('newCustomers').textContent = newCustomers;
    
    // Calculate changes (mock data for now - would need historical data)
    updateMetricChange('revenueChange', 12.5);
    updateMetricChange('ordersChange', 8.3);
    updateMetricChange('orderValueChange', 5.7);
    updateMetricChange('customersChange', 15.2);
}

// Update Metric Change
function updateMetricChange(elementId, percentage) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const isPositive = percentage >= 0;
    element.className = `metric-change ${isPositive ? 'positive' : 'negative'}`;
    element.innerHTML = `
        <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i> 
        ${isPositive ? '+' : ''}${percentage.toFixed(1)}%
    `;
}

// Update Revenue Chart
function updateRevenueChart(periodOrders = null) {
    if (!periodOrders) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - analyticsPeriod);
        periodOrders = orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= startDate && orderDate <= endDate;
        });
    }
    
    const chartType = document.getElementById('revenueChartType')?.value || 'daily';
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (analyticsCharts.revenue) {
        analyticsCharts.revenue.destroy();
    }
    
    // Prepare data based on chart type
    let labels = [];
    let data = [];
    
    if (chartType === 'daily') {
        // Group by day
        const dailyData = {};
        for (let i = analyticsPeriod - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dailyData[dateStr] = 0;
        }
        
        periodOrders.forEach(order => {
            const dateStr = new Date(order.date).toISOString().split('T')[0];
            if (dailyData.hasOwnProperty(dateStr)) {
                dailyData[dateStr] += order.total;
            }
        });
        
        labels = Object.keys(dailyData).map(date => {
            const d = new Date(date);
            return `${d.getDate()}/${d.getMonth() + 1}`;
        });
        data = Object.values(dailyData);
    }
    
    // Create chart
    analyticsCharts.revenue = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu (₫)',
                data: data,
                borderColor: '#6f4e37',
                backgroundColor: 'rgba(111, 78, 55, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Doanh thu: ' + formatVND(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatVND(value);
                        }
                    }
                }
            }
        }
    });
}

// Update Category Chart
function updateCategoryChart(periodOrders) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (analyticsCharts.category) {
        analyticsCharts.category.destroy();
    }
    
    // Calculate category sales
    const categoryData = { hot: 0, iced: 0, special: 0 };
    
    periodOrders.forEach(order => {
        order.items.forEach(item => {
            const menuItem = menuItems.find(m => m.name === item.name);
            if (menuItem) {
                categoryData[menuItem.category] += (item.totalPrice || item.price) * item.quantity;
            }
        });
    });
    
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d'];
    const labels = ['Hot Coffee', 'Iced Coffee', 'Special'];
    const data = [categoryData.hot, categoryData.iced, categoryData.special];
    
    // Create chart
    analyticsCharts.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${formatVND(context.parsed)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Update legend
    const legendContainer = document.getElementById('categoryLegend');
    if (legendContainer) {
        legendContainer.innerHTML = labels.map((label, index) => `
            <div class="legend-item">
                <div class="legend-color" style="background: ${colors[index]}"></div>
                <span>${label}</span>
            </div>
        `).join('');
    }
}

// Update Order Status Chart
function updateOrderStatusChart(periodOrders) {
    const ctx = document.getElementById('orderStatusChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (analyticsCharts.orderStatus) {
        analyticsCharts.orderStatus.destroy();
    }
    
    // Count orders by status
    const statusData = {
        pending: 0,
        preparing: 0,
        completed: 0,
        cancelled: 0
    };
    
    periodOrders.forEach(order => {
        if (statusData.hasOwnProperty(order.status)) {
            statusData[order.status]++;
        }
    });
    
    const colors = ['#ff9800', '#2196f3', '#4caf50', '#f44336'];
    const labels = ['Pending', 'Preparing', 'Completed', 'Cancelled'];
    const data = Object.values(statusData);
    
    // Create chart
    analyticsCharts.orderStatus = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update Customer Tier Chart
function updateCustomerTierChart() {
    const ctx = document.getElementById('customerTierChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (analyticsCharts.customerTier) {
        analyticsCharts.customerTier.destroy();
    }
    
    // Calculate tier distribution
    const tierData = { diamond: 0, gold: 0, silver: 0, none: 0 };
    
    customers.forEach(customer => {
        const customerOrders = orders.filter(o => o.customerEmail === customer.email);
        const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
        
        if (totalSpent >= 10000000) tierData.diamond++;
        else if (totalSpent >= 3000000) tierData.gold++;
        else if (totalSpent >= 500000) tierData.silver++;
        else tierData.none++;
    });
    
    const colors = ['#b9f2ff', '#ffd700', '#c0c0c0', '#e0e0e0'];
    const labels = ['Diamond', 'Gold', 'Silver', 'No Tier'];
    const data = Object.values(tierData);
    
    // Create chart
    analyticsCharts.customerTier = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số khách hàng',
                data: data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // Update tier stats
    const tierStats = document.getElementById('tierStats');
    if (tierStats) {
        const tiers = [
            { name: 'Diamond', count: tierData.diamond, class: 'diamond' },
            { name: 'Gold', count: tierData.gold, class: 'gold' },
            { name: 'Silver', count: tierData.silver, class: 'silver' },
            { name: 'No Tier', count: tierData.none, class: 'none' }
        ];
        
        tierStats.innerHTML = tiers.map(tier => `
            <div class="tier-stat-item ${tier.class}">
                <span><strong>${tier.name}</strong></span>
                <span>${tier.count} khách hàng</span>
            </div>
        `).join('');
    }
}

// Update Top Products
function updateTopProducts(periodOrders) {
    const container = document.getElementById('topProductsList');
    if (!container) return;
    
    // Calculate product sales
    const productSales = {};
    
    periodOrders.forEach(order => {
        order.items.forEach(item => {
            if (!productSales[item.name]) {
                productSales[item.name] = { quantity: 0, revenue: 0 };
            }
            productSales[item.name].quantity += item.quantity;
            productSales[item.name].revenue += (item.totalPrice || item.price) * item.quantity;
        });
    });
    
    // Sort by revenue
    const sortedProducts = Object.entries(productSales)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 10);
    
    if (sortedProducts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Chưa có dữ liệu</p>';
        return;
    }
    
    container.innerHTML = sortedProducts.map(([name, data], index) => {
        let rankClass = '';
        if (index === 0) rankClass = 'gold';
        else if (index === 1) rankClass = 'silver';
        else if (index === 2) rankClass = 'bronze';
        
        return `
            <div class="top-list-item">
                <div class="top-list-rank ${rankClass}">${index + 1}</div>
                <div class="top-list-info">
                    <h4>${name}</h4>
                    <p>${data.quantity} đã bán</p>
                </div>
                <div class="top-list-value">
                    <strong>${formatVND(data.revenue)}</strong>
                </div>
            </div>
        `;
    }).join('');
}

// Update Top Customers
function updateTopCustomers() {
    const container = document.getElementById('topCustomersList');
    if (!container) return;
    
    // Calculate customer spending
    const customerSpending = customers.map(customer => {
        const customerOrders = orders.filter(o => o.customerEmail === customer.email);
        const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
        return {
            name: customer.name,
            email: customer.email,
            totalSpent: totalSpent,
            orderCount: customerOrders.length
        };
    });
    
    // Sort by spending
    const sortedCustomers = customerSpending
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);
    
    if (sortedCustomers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Chưa có dữ liệu</p>';
        return;
    }
    
    container.innerHTML = sortedCustomers.map((customer, index) => {
        let rankClass = '';
        if (index === 0) rankClass = 'gold';
        else if (index === 1) rankClass = 'silver';
        else if (index === 2) rankClass = 'bronze';
        
        return `
            <div class="top-list-item">
                <div class="top-list-rank ${rankClass}">${index + 1}</div>
                <div class="top-list-info">
                    <h4>${customer.name}</h4>
                    <p>${customer.orderCount} đơn hàng</p>
                </div>
                <div class="top-list-value">
                    <strong>${formatVND(customer.totalSpent)}</strong>
                </div>
            </div>
        `;
    }).join('');
}

// Update Hourly Chart
function updateHourlyChart(periodOrders) {
    const ctx = document.getElementById('hourlyChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (analyticsCharts.hourly) {
        analyticsCharts.hourly.destroy();
    }
    
    // Count orders by hour
    const hourlyData = new Array(24).fill(0);
    
    periodOrders.forEach(order => {
        const hour = new Date(order.date).getHours();
        hourlyData[hour]++;
    });
    
    const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
    
    // Create chart
    analyticsCharts.hourly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số đơn hàng',
                data: hourlyData,
                backgroundColor: 'rgba(111, 78, 55, 0.6)',
                borderColor: '#6f4e37',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Update Weekday Chart
function updateWeekdayChart(periodOrders) {
    const ctx = document.getElementById('weekdayChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (analyticsCharts.weekday) {
        analyticsCharts.weekday.destroy();
    }
    
    // Count orders by weekday
    const weekdayData = new Array(7).fill(0);
    
    periodOrders.forEach(order => {
        const day = new Date(order.date).getDay();
        weekdayData[day]++;
    });
    
    const labels = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    
    // Create chart
    analyticsCharts.weekday = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số đơn hàng',
                data: weekdayData,
                backgroundColor: [
                    'rgba(255, 107, 107, 0.6)',
                    'rgba(78, 205, 196, 0.6)',
                    'rgba(255, 230, 109, 0.6)',
                    'rgba(132, 94, 247, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ],
                borderColor: [
                    '#ff6b6b',
                    '#4ecdc4',
                    '#ffe66d',
                    '#845ef7',
                    '#ff9f40',
                    '#36a2eb',
                    '#ff6384'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Export Report
function exportReport(format) {
    showNotification(`Đang xuất báo cáo ${format.toUpperCase()}...`);
    
    // In a real app, this would generate and download the report
    setTimeout(() => {
        showNotification(`Báo cáo ${format.toUpperCase()} đã được tải xuống!`);
    }, 2000);
}

// Load analytics when section is shown
const originalShowSection = showSection;
showSection = function(sectionId) {
    originalShowSection.call(this, sectionId);
    
    if (sectionId === 'analytics') {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            loadAnalytics();
        }, 100);
    } else if (sectionId === 'menu-management') {
        // Load customize options when menu management is shown
        loadCustomizeOptionsPreview();
    }
};

// ===========================================
// CUSTOMIZE OPTIONS MANAGEMENT
// ===========================================

// Default customize options
const defaultCustomizeOptions = {
    sizes: [
        { value: 'small', label: 'Small', priceMultiplier: 0.8 },
        { value: 'medium', label: 'Medium', priceMultiplier: 1.0 },
        { value: 'large', label: 'Large', priceMultiplier: 1.2 }
    ],
    sugarLevels: [
        { value: '0', label: '0%' },
        { value: '25', label: '25%' },
        { value: '50', label: '50%' },
        { value: '75', label: '75%' },
        { value: '100', label: '100%' }
    ],
    iceLevels: [
        { value: 'no-ice', label: 'No Ice' },
        { value: 'less-ice', label: 'Less Ice' },
        { value: 'normal-ice', label: 'Normal Ice' }
    ],
    milkTypes: [
        { value: 'no-milk', label: 'No Milk', price: 0 },
        { value: 'regular', label: 'Regular Milk', price: 0 },
        { value: 'soy', label: 'Soy Milk', price: 5000 },
        { value: 'almond', label: 'Almond Milk', price: 8000 },
        { value: 'oat', label: 'Oat Milk', price: 8000 }
    ],
    extraShotPrice: 15000
};

// Get customize options from localStorage
function getCustomizeOptions() {
    const saved = localStorage.getItem('customizeOptions');
    return saved ? JSON.parse(saved) : defaultCustomizeOptions;
}

// Save customize options to localStorage
function saveCustomizeOptionsToStorage(options) {
    localStorage.setItem('customizeOptions', JSON.stringify(options));
}

// Open customize options modal
function openCustomizeOptionsModal() {
    const modal = document.getElementById('customizeOptionsModal');
    modal.style.display = 'block';
    
    loadCustomizeOptionsForm();
}

// Close customize options modal
function closeCustomizeOptionsModal() {
    const modal = document.getElementById('customizeOptionsModal');
    modal.style.display = 'none';
}

// Load customize options into form
function loadCustomizeOptionsForm() {
    const options = getCustomizeOptions();
    
    // Load sizes
    const sizeOptions = document.getElementById('sizeOptions');
    sizeOptions.innerHTML = `
        <div class="option-header">
            <span>Giá trị (value)</span>
            <span>Tên hiển thị</span>
            <span>Hệ số giá (1.0 = 100%)</span>
            <span></span>
        </div>
    ` + options.sizes.map((size, index) => `
        <div class="option-item size-item">
            <input type="text" placeholder="small, medium, large" value="${size.value}" data-type="size" data-index="${index}" data-field="value">
            <input type="text" placeholder="Small, Medium, Large" value="${size.label}" data-type="size" data-index="${index}" data-field="label">
            <input type="number" step="0.1" placeholder="1.0" value="${size.priceMultiplier}" data-type="size" data-index="${index}" data-field="priceMultiplier" title="Ví dụ: 1.0 = 100%, 1.5 = 150%, 0.8 = 80%">
            <button class="btn-delete" onclick="removeOption('size', ${index})" title="Xóa">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    // Load sugar levels
    const sugarOptions = document.getElementById('sugarOptions');
    sugarOptions.innerHTML = `
        <div class="option-header">
            <span>Giá trị (value)</span>
            <span>Tên hiển thị</span>
            <span></span>
        </div>
    ` + options.sugarLevels.map((sugar, index) => `
        <div class="option-item">
            <input type="text" placeholder="0%, 25%, 50%, 75%, 100%" value="${sugar.value}" data-type="sugar" data-index="${index}" data-field="value">
            <input type="text" placeholder="No Sugar, 25%, 50%..." value="${sugar.label}" data-type="sugar" data-index="${index}" data-field="label">
            <button class="btn-delete" onclick="removeOption('sugar', ${index})" title="Xóa">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    // Load ice levels
    const iceOptions = document.getElementById('iceOptions');
    iceOptions.innerHTML = `
        <div class="option-header">
            <span>Giá trị (value)</span>
            <span>Tên hiển thị</span>
            <span></span>
        </div>
    ` + options.iceLevels.map((ice, index) => `
        <div class="option-item">
            <input type="text" placeholder="no-ice, less-ice, normal, extra-ice" value="${ice.value}" data-type="ice" data-index="${index}" data-field="value">
            <input type="text" placeholder="No Ice, Less Ice, Normal..." value="${ice.label}" data-type="ice" data-index="${index}" data-field="label">
            <button class="btn-delete" onclick="removeOption('ice', ${index})" title="Xóa">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    // Load milk types
    const milkOptions = document.getElementById('milkOptions');
    milkOptions.innerHTML = `
        <div class="option-header">
            <span>Giá trị (value)</span>
            <span>Tên hiển thị</span>
            <span>Giá phụ thu (₫)</span>
            <span></span>
        </div>
    ` + options.milkTypes.map((milk, index) => `
        <div class="option-item milk-item">
            <input type="text" placeholder="regular, soy, almond, oat" value="${milk.value}" data-type="milk" data-index="${index}" data-field="value">
            <input type="text" placeholder="Regular, Soy Milk, Almond..." value="${milk.label}" data-type="milk" data-index="${index}" data-field="label">
            <input type="number" step="1000" placeholder="0, 12500, 15000" value="${milk.price}" data-type="milk" data-index="${index}" data-field="price" title="Giá cộng thêm cho loại sữa này (VD: 12500)">
            <button class="btn-delete" onclick="removeOption('milk', ${index})" title="Xóa">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    // Load extra shot price
    document.getElementById('extraShotPrice').value = options.extraShotPrice;
}

// Add new option
function addSizeOption() {
    const options = getCustomizeOptions();
    options.sizes.push({ value: '', label: '', priceMultiplier: 1.0 });
    saveCustomizeOptionsToStorage(options);
    loadCustomizeOptionsForm();
}

function addSugarOption() {
    const options = getCustomizeOptions();
    options.sugarLevels.push({ value: '', label: '' });
    saveCustomizeOptionsToStorage(options);
    loadCustomizeOptionsForm();
}

function addIceOption() {
    const options = getCustomizeOptions();
    options.iceLevels.push({ value: '', label: '' });
    saveCustomizeOptionsToStorage(options);
    loadCustomizeOptionsForm();
}

function addMilkOption() {
    const options = getCustomizeOptions();
    options.milkTypes.push({ value: '', label: '', price: 0 });
    saveCustomizeOptionsToStorage(options);
    loadCustomizeOptionsForm();
}

// Remove option
function removeOption(type, index) {
    const options = getCustomizeOptions();
    
    switch(type) {
        case 'size':
            options.sizes.splice(index, 1);
            break;
        case 'sugar':
            options.sugarLevels.splice(index, 1);
            break;
        case 'ice':
            options.iceLevels.splice(index, 1);
            break;
        case 'milk':
            options.milkTypes.splice(index, 1);
            break;
    }
    
    saveCustomizeOptionsToStorage(options);
    loadCustomizeOptionsForm();
}

// Save customize options
function saveCustomizeOptions() {
    const options = getCustomizeOptions();
    
    // Update sizes
    document.querySelectorAll('[data-type="size"]').forEach(input => {
        const index = parseInt(input.dataset.index);
        const field = input.dataset.field;
        const value = field === 'priceMultiplier' ? parseFloat(input.value) : input.value;
        options.sizes[index][field] = value;
    });
    
    // Update sugar levels
    document.querySelectorAll('[data-type="sugar"]').forEach(input => {
        const index = parseInt(input.dataset.index);
        const field = input.dataset.field;
        options.sugarLevels[index][field] = input.value;
    });
    
    // Update ice levels
    document.querySelectorAll('[data-type="ice"]').forEach(input => {
        const index = parseInt(input.dataset.index);
        const field = input.dataset.field;
        options.iceLevels[index][field] = input.value;
    });
    
    // Update milk types
    document.querySelectorAll('[data-type="milk"]').forEach(input => {
        const index = parseInt(input.dataset.index);
        const field = input.dataset.field;
        const value = field === 'price' ? parseInt(input.value) : input.value;
        options.milkTypes[index][field] = value;
    });
    
    // Update extra shot price
    options.extraShotPrice = parseInt(document.getElementById('extraShotPrice').value);
    
    // Validate data
    let hasErrors = false;
    
    // Check if all sizes have values
    if (options.sizes.some(s => !s.value || !s.label)) {
        showNotification('Please fill in all size fields!', 'error');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    // Save to localStorage
    saveCustomizeOptionsToStorage(options);
    
    // Dispatch event to notify other parts of the app
    window.dispatchEvent(new CustomEvent('customizeOptionsUpdated', { detail: options }));
    
    // Close modal and refresh preview
    closeCustomizeOptionsModal();
    loadCustomizeOptionsPreview();
    
    showNotification('✅ Customize options saved successfully! All menu items will use these options.');
}

// Load customize options preview
function loadCustomizeOptionsPreview() {
    const options = getCustomizeOptions();
    const preview = document.getElementById('customizeOptionsPreview');
    
    if (!preview) return;
    
    preview.innerHTML = `
        <div class="customize-preview-item">
            <h4><i class="fas fa-arrows-alt"></i> Sizes (${options.sizes.length})</h4>
            <div>
                ${options.sizes.map(s => `<span class="badge">${s.label} (x${s.priceMultiplier})</span>`).join('')}
            </div>
        </div>
        <div class="customize-preview-item">
            <h4><i class="fas fa-cube-sugar"></i> Sugar Levels (${options.sugarLevels.length})</h4>
            <div>
                ${options.sugarLevels.map(s => `<span class="badge">${s.label}</span>`).join('')}
            </div>
        </div>
        <div class="customize-preview-item">
            <h4><i class="fas fa-snowflake"></i> Ice Levels (${options.iceLevels.length})</h4>
            <div>
                ${options.iceLevels.map(i => `<span class="badge">${i.label}</span>`).join('')}
            </div>
        </div>
        <div class="customize-preview-item">
            <h4><i class="fas fa-glass-whiskey"></i> Milk Types (${options.milkTypes.length})</h4>
            <div>
                ${options.milkTypes.map(m => `<span class="badge">${m.label}${m.price > 0 ? ' +' + formatVND(m.price) : ''}</span>`).join('')}
            </div>
        </div>
        <div class="customize-preview-item">
            <h4><i class="fas fa-coffee"></i> Extra Shot</h4>
            <div>
                <span class="badge">+${formatVND(options.extraShotPrice)}</span>
            </div>
        </div>
    `;
}
