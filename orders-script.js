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
        authLink.onclick = logout;
    } else {
        authText.textContent = 'Sign In';
        authLink.innerHTML = `<i class="fas fa-sign-in-alt"></i><span>Sign In</span>`;
        authLink.onclick = () => window.location.href = 'admin-login.html';
    }
}

// Logout
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
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
                <button class="btn-view-detail">
                    <i class="fas fa-eye"></i> Chi tiết
                </button>
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

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});
