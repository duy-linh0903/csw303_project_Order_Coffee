// VND Currency Formatter
function formatVND(amount) {
    return amount.toLocaleString('vi-VN') + '₫';
}

// Global State
let currentUser = null;
let allOrders = [];
let filteredOrders = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    loadOrders();
    updateStats();
});

// Check Login Status
function checkLoginStatus() {
    // Check localStorage first, then sessionStorage
    const userFromLocalStorage = localStorage.getItem('currentUser');
    const userFromSessionStorage = sessionStorage.getItem('currentUser');
    
    if (userFromLocalStorage) {
        currentUser = JSON.parse(userFromLocalStorage);
    } else if (userFromSessionStorage) {
        currentUser = JSON.parse(userFromSessionStorage);
    }

    const authLink = document.getElementById('authLink');
    const authText = document.getElementById('authText');

    if (currentUser) {
        authText.textContent = currentUser.name;
        authLink.innerHTML = `<i class="fas fa-user"></i><span>${currentUser.name}</span>`;
        authLink.onclick = showUserMenu;
    } else {
        authText.textContent = 'Sign In';
        authLink.innerHTML = `<i class="fas fa-sign-in-alt"></i><span>Sign In</span>`;
        authLink.onclick = () => window.location.href = 'admin-login.html';
    }
}

// Show User Menu
function showUserMenu(event) {
    event.preventDefault();
    
    // Get button position for dropdown placement
    const authLink = document.getElementById('authLink');
    const rect = authLink.getBoundingClientRect();
    
    const menu = `
        <div class="user-menu-overlay" onclick="this.remove()">
            <div class="user-menu-dropdown" style="top: ${rect.bottom + 10}px; right: 20px;" onclick="event.stopPropagation()">
                <div class="user-menu-header">
                    <div class="user-menu-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="user-menu-info">
                        <p class="user-menu-name">${currentUser.name}</p>
                        <p class="user-menu-email">${currentUser.email}</p>
                    </div>
                </div>
                <div class="user-menu-divider"></div>
                <a href="profile.html" class="user-menu-item">
                    <i class="fas fa-user"></i>
                    <span>Thông tin khách hàng</span>
                    <i class="fas fa-chevron-right"></i>
                </a>
                <a href="index.html#rewards" class="user-menu-item">
                    <i class="fas fa-gift"></i>
                    <span>Điểm thưởng</span>
                    <i class="fas fa-chevron-right"></i>
                </a>
                <a href="membercard.html" class="user-menu-item">
                    <i class="fas fa-id-card"></i>
                    <span>Thẻ thành viên</span>
                    <i class="fas fa-chevron-right"></i>
                </a>
                <div class="user-menu-divider"></div>
                <a href="#" onclick="logout(event)" class="user-menu-item user-menu-logout">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Đăng xuất</span>
                </a>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', menu);
    
    // Animate dropdown
    setTimeout(() => {
        const dropdown = document.querySelector('.user-menu-dropdown');
        if (dropdown) {
            dropdown.style.opacity = '1';
            dropdown.style.transform = 'translateY(0)';
        }
    }, 10);
}

// Logout
function logout(event) {
    if (event) event.preventDefault();
    showLogoutModal();
}

function showLogoutModal() {
    const modal = document.createElement('div');
    modal.id = 'logoutModalOrders';
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
                <h2 style="margin: 0; font-size: 1.5rem;">Xác nhận đăng xuất</h2>
            </div>
            <div style="
                padding: 2rem;
                text-align: center;
                font-size: 1.1rem;
                color: #2c1810;
            ">
                <p>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?</p>
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
                    <i class="fas fa-times"></i> Hủy
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
                    <i class="fas fa-check"></i> Đăng xuất
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
    const modal = document.getElementById('logoutModalOrders');
    if (modal) modal.remove();
}

function confirmLogout() {
    closeLogoutModal();
    showNotification('Đã đăng xuất thành công!');
    
    setTimeout(() => {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }, 1500);
}

// Load Orders
function loadOrders() {
    const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    
    if (currentUser) {
        // Show only current user's orders
        allOrders = userOrders.filter(order => order.userEmail === currentUser.email);
    } else {
        // Show all orders for non-logged in users (they can see their guest orders)
        allOrders = userOrders;
    }

    // Sort orders by date (newest first)
    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredOrders = allOrders;
    renderOrders();
}

// Filter Orders
function filterOrderHistory(status) {
    const buttons = document.querySelectorAll('.orders-filter .filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.filter-btn').classList.add('active');

    if (status === 'all') {
        filteredOrders = allOrders;
    } else {
        filteredOrders = allOrders.filter(order => order.status === status);
    }

    // Sort filtered orders by date (newest first)
    filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderOrders();
}

// Render Orders
function renderOrders() {
    const ordersList = document.getElementById('ordersList');

    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3 style="color: #999;">Chưa có đơn hàng nào</h3>
                <p style="color: #999;">Hãy đặt đơn hàng đầu tiên của bạn!</p>
                <a href="index.html" class="btn-primary" style="margin-top: 1rem; display: inline-block; text-decoration: none;">
                    <i class="fas fa-coffee"></i> Đặt hàng ngay
                </a>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-card" onclick="viewOrderDetail('${order.id}')">
            <div class="order-card-header">
                <div>
                    <h3>#${order.id}</h3>
                    <p class="order-date">
                        <i class="fas fa-calendar"></i> ${new Date(order.date).toLocaleString('vi-VN')}
                    </p>
                </div>
                <div class="order-status">
                    <span class="status-badge status-${order.status}">
                        ${getStatusText(order.status)}
                    </span>
                    ${order.isDelivery ? '<span class="delivery-badge"><i class="fas fa-shipping-fast"></i> Giao hàng</span>' : '<span class="pickup-badge"><i class="fas fa-store"></i> Tại quán</span>'}
                </div>
            </div>
            <div class="order-card-body">
                <div class="order-items-preview">
                    <i class="fas fa-shopping-bag"></i>
                    <span>${order.items.length} món</span>
                    <span class="items-list">
                        ${order.items.slice(0, 3).map(item => item.name).join(', ')}
                        ${order.items.length > 3 ? '...' : ''}
                    </span>
                </div>
                ${order.deliveryInfo ? `
                    <div class="order-delivery-info">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${order.deliveryInfo.address}</span>
                    </div>
                ` : ''}
            </div>
            <div class="order-card-footer">
                <div class="order-total">
                    <span>Tổng tiền:</span>
                    <strong>${formatVND(order.total)}</strong>
                </div>
                <div class="order-actions">
                    <button class="btn-reorder" onclick="event.stopPropagation(); reorderItems('${order.id}');">
                        <i class="fas fa-redo"></i> Đặt lại
                    </button>
                    <button class="btn-view-detail">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Get Status Text
function getStatusText(status) {
    const statusMap = {
        'pending': 'Đang xử lý',
        'preparing': 'Đang pha chế',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

// View Order Detail
function viewOrderDetail(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    const orderDetailContent = document.getElementById('orderDetailContent');
    orderDetailContent.innerHTML = `
        <div class="order-detail-container">
            <div class="order-detail-header">
                <h2>Chi tiết đơn hàng #${order.id}</h2>
                <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>
            </div>

            <div class="order-detail-info-compact">
                <div class="info-row">
                    <div class="info-item">
                        <i class="fas fa-calendar"></i>
                        <span>${new Date(order.date).toLocaleString('vi-VN')}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-user"></i>
                        <span>${order.customerName}</span>
                        ${order.guestInfo ? `<span class="sub-info"><i class="fas fa-phone"></i> ${order.guestInfo.phone}</span>` : ''}
                    </div>
                    <div class="info-item">
                        <i class="fas fa-${order.isDelivery ? 'shipping-fast' : 'store'}"></i>
                        <span>${order.isDelivery ? 'Giao hàng' : 'Nhận tại quán'}</span>
                    </div>
                </div>
                ${order.deliveryInfo ? `
                    <div class="info-row delivery-address-row">
                        <i class="fas fa-map-marker-alt"></i>
                        <div class="delivery-address">
                            <strong>${order.deliveryInfo.address}</strong>
                            ${order.deliveryInfo.note ? `<span class="delivery-note"><i class="fas fa-sticky-note"></i> ${order.deliveryInfo.note}</span>` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>

            <div class="order-items-section">
                <h3><i class="fas fa-coffee"></i> Món đã đặt</h3>
                <div class="order-items-list">
                    ${order.items.map(item => `
                        <div class="order-item-detail-card">
                            <div class="item-info">
                                <h4>${item.name}</h4>
                                ${item.customizations ? `
                                    <div class="item-customizations">
                                        ${item.customizations.size ? `<span><i class="fas fa-coffee"></i> ${item.customizations.size}</span>` : ''}
                                        ${item.customizations.sugar ? `<span><i class="fas fa-cube"></i> ${item.customizations.sugar}</span>` : ''}
                                        ${item.customizations.ice ? `<span><i class="fas fa-snowflake"></i> ${item.customizations.ice}</span>` : ''}
                                        ${item.customizations.milk && item.customizations.milk !== 'Regular' ? `<span><i class="fas fa-glass-whiskey"></i> ${item.customizations.milk}</span>` : ''}
                                        ${item.customizations.extraShots > 0 ? `<span><i class="fas fa-plus-circle"></i> +${item.customizations.extraShots} shot(s)</span>` : ''}
                                    </div>
                                ` : ''}
                                ${item.customizations && item.customizations.notes ? `
                                    <p class="item-note"><i class="fas fa-sticky-note"></i> ${item.customizations.notes}</p>
                                ` : ''}
                            </div>
                            <div class="item-quantity">
                                <span>x ${item.quantity}</span>
                            </div>
                            <div class="item-price">
                                <strong>${formatVND((item.totalPrice || item.price) * item.quantity)}</strong>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="order-summary-section">
                <h3><i class="fas fa-receipt"></i> Tổng kết đơn hàng</h3>
                <div class="summary-details">
                    <div class="summary-row">
                        <span>Tạm tính:</span>
                        <span>${formatVND(order.subtotal)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Thuế (10%):</span>
                        <span>${formatVND(order.tax)}</span>
                    </div>
                    ${order.deliveryFee && order.deliveryFee > 0 ? `
                        <div class="summary-row">
                            <span>Phí giao hàng:</span>
                            <span>${formatVND(order.deliveryFee)}</span>
                        </div>
                    ` : ''}
                    ${order.discount > 0 ? `
                        <div class="summary-row discount">
                            <span>Giảm giá:</span>
                            <span>-${formatVND(order.discount)}</span>
                        </div>
                    ` : ''}
                    <div class="summary-row total">
                        <span>Tổng cộng:</span>
                        <strong>${formatVND(order.total)}</strong>
                    </div>
                    <div class="summary-row payment-method">
                        <span><i class="fas fa-credit-card"></i> Phương thức thanh toán:</span>
                        <span>${getPaymentMethodText(order.paymentMethod)}</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-reorder-modal" onclick="reorderItems('${order.id}'); closeOrderDetail();">
                        <i class="fas fa-redo"></i> Đặt lại đơn hàng này
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('orderDetailModal').style.display = 'block';
}

// Get Payment Method Text
function getPaymentMethodText(method) {
    const methodMap = {
        'card': 'Thẻ tín dụng',
        'paypal': 'PayPal',
        'cash': 'Tiền mặt'
    };
    return methodMap[method] || method;
}

// Close Order Detail
function closeOrderDetail() {
    document.getElementById('orderDetailModal').style.display = 'none';
}

// Update Stats
function updateStats() {
    const totalOrders = allOrders.length;
    const totalSpent = allOrders.reduce((sum, order) => sum + order.total, 0);
    const totalPoints = currentUser ? currentUser.points || 0 : 0;

    document.getElementById('totalOrdersCount').textContent = totalOrders;
    document.getElementById('totalSpent').textContent = formatVND(totalSpent);
    document.getElementById('totalPoints').textContent = totalPoints;
}

// Re-order Items
function reorderItems(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        alert('Đơn hàng không tồn tại!');
        return;
    }

    if (confirm(`Bạn có muốn thêm ${order.items.length} món từ đơn hàng #${order.id} vào giỏ hàng?`)) {
        // Get current cart from localStorage
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Add all items from the order to cart with proper structure
        order.items.forEach(item => {
            const cartItem = {
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                customizations: item.customizations || null,
                totalPrice: item.totalPrice || item.price,
                uniqueId: Date.now() + Math.random() // Generate unique ID for each item
            };
            cart.push(cartItem);
        });
        
        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Show success message
        showReorderNotification(`Đã thêm ${order.items.length} món vào giỏ hàng!`);
        
        // Redirect to menu page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html#menu';
        }, 1500);
    }
}

// Show Reorder Notification
function showReorderNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'reorder-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});
