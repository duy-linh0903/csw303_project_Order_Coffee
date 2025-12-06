// Delivery Tracker - Check for delayed deliveries and create compensation discount codes

function checkDelayedDeliveries() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const currentTime = new Date();
    
    orders.forEach(order => {
        // Only check delivery orders that are not completed or cancelled
        if (order.isDelivery && 
            order.expectedDeliveryTime && 
            order.status !== 'completed' && 
            order.status !== 'cancelled' &&
            !order.compensationGiven) {
            
            const expectedTime = new Date(order.expectedDeliveryTime);
            
            // If current time is past expected delivery time
            if (currentTime > expectedTime) {
                console.log(`Đơn hàng ${order.id} bị trễ! Tạo mã giảm giá đền bù...`);
                
                // Create compensation discount code
                createCompensationCode(order);
                
                // Mark order as compensated
                order.compensationGiven = true;
                order.compensationTime = currentTime.toISOString();
                
                // Save updated orders
                localStorage.setItem('orders', JSON.stringify(orders));
            }
        }
    });
}

function createCompensationCode(order) {
    const customerEmail = order.customerEmail;
    const orderId = order.id;
    
    // Generate unique compensation code
    const codeId = 'SORRY' + Date.now().toString().slice(-6);
    
    // Create discount code object
    const compensationCode = {
        code: codeId,
        discount: 0.1, // 10% discount
        description: `Đền bù giao hàng trễ - Đơn ${orderId}`,
        type: 'compensation',
        orderId: orderId,
        customerEmail: customerEmail,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 30 days
        used: false
    };
    
    // Add to discount codes list
    const discountCodes = JSON.parse(localStorage.getItem('discountCodes') || '[]');
    discountCodes.push(compensationCode);
    localStorage.setItem('discountCodes', JSON.stringify(discountCodes));
    
    // Create notification for user
    if (customerEmail !== 'guest@example.com') {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        
        const notification = {
            id: 'NOTIF' + Date.now(),
            type: 'compensation',
            title: 'Mã giảm giá đền bù',
            message: `Xin lỗi vì đơn hàng ${orderId} giao trễ. Chúng tôi tặng bạn mã giảm giá ${codeId} (10% off) để đền bù!`,
            code: codeId,
            discount: 0.1,
            read: false,
            createdAt: new Date().toISOString(),
            userEmail: customerEmail
        };
        
        notifications.push(notification);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        // Dispatch event to update notification UI
        window.dispatchEvent(new CustomEvent('notificationAdded'));
        
        console.log(`Đã tạo mã giảm giá đền bù ${codeId} cho khách hàng ${customerEmail}`);
    }
    
    // Show notification if user is currently logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.email === customerEmail) {
        if (typeof showNotification === 'function') {
            showNotification(`🎁 Xin lỗi vì giao hàng trễ! Bạn nhận được mã giảm giá ${codeId} (10% off) để đền bù.`);
        }
    }
}

// Start checking every minute
let deliveryCheckInterval;

function startDeliveryTracking() {
    console.log('Delivery Tracker: Started monitoring delayed deliveries...');
    
    // Check immediately
    checkDelayedDeliveries();
    
    // Then check every 1 minute
    deliveryCheckInterval = setInterval(checkDelayedDeliveries, 60000);
}

function stopDeliveryTracking() {
    if (deliveryCheckInterval) {
        clearInterval(deliveryCheckInterval);
        console.log('Delivery Tracker: Stopped monitoring');
    }
}

// Auto-start when page loads
document.addEventListener('DOMContentLoaded', function() {
    startDeliveryTracking();
});

// Update notifications when new one is added
document.addEventListener('notificationAdded', function() {
    if (typeof loadNotifications === 'function') {
        loadNotifications();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    stopDeliveryTracking();
});
