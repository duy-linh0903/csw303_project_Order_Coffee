// Shop Status Management
function getPendingOrdersCount() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const pendingCount = orders.filter(order => 
        order.status !== 'success' && 
        order.status !== 'cancelled' && 
        order.status !== 'completed'
    ).length;
    console.log('Shop Status - Total orders:', orders.length, 'Pending orders:', pendingCount, 'Orders:', orders.map(o => ({id: o.id, status: o.status})));
    return pendingCount;
}

function getShopStatusMessage() {
    const pendingOrders = getPendingOrdersCount();
    
    if (pendingOrders <= 20) {
        return '';
    } else if (pendingOrders <= 30) {
        return ' Quán hiện đang khá đông, thời gian chờ có thể lâu hơn bình thường.';
    } else {
        return ' Quán hiện đang rất đông, thời gian chờ có thể khá lâu, vui lòng cân nhắc.';
    }
}

function updateShopStatus() {
    const pendingOrders = getPendingOrdersCount();
    
    const banner = document.getElementById('shopStatusBanner');
    const statusText = document.getElementById('shopStatusText');
    const statusDetail = document.getElementById('shopStatusDetail');
    const statusIcon = banner.querySelector('.status-icon');
    
    if (!banner || !statusText || !statusDetail || !statusIcon) return;
    
    // Only show banner when more than 20 pending orders
    console.log('Shop Status - Checking display: pendingOrders =', pendingOrders);
    if (pendingOrders <= 20) {
        console.log('Shop Status - Hiding banner (≤20 orders)');
        banner.style.display = 'none';
        return;
    }
    
    // Show banner
    console.log('Shop Status - Showing banner (>20 orders)');
    banner.style.display = 'block';
    
    // Remove all status classes
    banner.classList.remove('status-available', 'status-busy', 'status-full');
    
    // Determine status based on pending orders (all shown as busy/full since > 20)
    if (pendingOrders <= 30) {
        // Busy - Yellow
        banner.classList.add('status-busy');
        statusIcon.innerHTML = '<i class="fas fa-clock"></i>';
        statusText.innerHTML = '<strong>Quán đang khá đông</strong>';
        statusDetail.textContent = 'Thời gian chờ có thể lâu hơn bình thường';
    } else {
        // Full/Very Busy - Red
        banner.classList.add('status-full');
        statusIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
        statusText.innerHTML = '<strong>Quán đang rất đông</strong>';
        statusDetail.textContent = 'Thời gian chờ có thể khá lâu, vui lòng cân nhắc';
    }
}

// Update status on page load
document.addEventListener('DOMContentLoaded', function() {
    updateShopStatus();
    
    // Auto-refresh status every 30 seconds
    setInterval(updateShopStatus, 30000);
});

// Update payment modal shop status warning
function updatePaymentShopStatusWarning() {
    const warningBox = document.getElementById('paymentShopStatusWarning');
    const warningMessage = document.getElementById('paymentShopStatusMessage');
    
    if (!warningBox || !warningMessage) return;
    
    // Only show for pickup orders (check if isDelivery is false)
    if (typeof isDelivery !== 'undefined' && isDelivery) {
        warningBox.style.display = 'none';
        return;
    }
    
    const pendingOrders = getPendingOrdersCount();
    console.log('Payment Modal - Checking shop status:', pendingOrders, 'pending orders');
    
    // Remove status class
    warningBox.classList.remove('status-full');
    
    if (pendingOrders <= 20) {
        warningBox.style.display = 'none';
    } else if (pendingOrders <= 30) {
        warningBox.style.display = 'flex';
        warningMessage.textContent = 'Quán hiện đang khá đông, thời gian chờ có thể lâu hơn bình thường. Vui lòng cân nhắc.';
    } else {
        warningBox.style.display = 'flex';
        warningBox.classList.add('status-full');
        warningMessage.textContent = 'Quán hiện đang rất đông, thời gian chờ có thể khá lâu. Vui lòng cân nhắc hoặc chọn giao hàng.';
    }
}

// Update status when orders are placed
document.addEventListener('orderPlaced', updateShopStatus);
document.addEventListener('orderUpdated', updateShopStatus);

// Listen for storage changes from other tabs
window.addEventListener('storage', function(e) {
    if (e.key === 'orders') {
        updateShopStatus();
    }
});
