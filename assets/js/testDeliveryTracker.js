// Test helper for Delivery Tracker
// Run this in browser console to create test delayed delivery orders

function createTestDelayedOrder() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Create a test order with delivery time in the past (20 minutes ago)
    const pastTime = new Date(Date.now() - 20 * 60000);
    
    const testOrder = {
        id: 'ORD' + Date.now(),
        customerName: 'Test User',
        customerEmail: localStorage.getItem('currentUser') 
            ? JSON.parse(localStorage.getItem('currentUser')).email 
            : 'test@example.com',
        items: [
            {
                name: 'Cappuccino',
                price: 45000,
                quantity: 2,
                size: 'medium',
                total: 90000
            }
        ],
        subtotal: 90000,
        tax: 9000,
        discount: 0,
        deliveryFee: 23000,
        isDelivery: true,
        total: 122000,
        status: 'pending',
        date: new Date().toISOString(),
        paymentMethod: 'cash',
        expectedDeliveryTime: pastTime.toISOString(),
        deliveryInfo: {
            address: '123 Test Street, Test City',
            deliveryTime: pastTime.toISOString(),
            note: 'Test order for delayed delivery'
        },
        compensationGiven: false
    };
    
    orders.push(testOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    console.log('✅ Created test delayed order:', testOrder.id);
    console.log('Expected delivery:', pastTime.toLocaleString());
    console.log('The system will detect this as delayed and create compensation code in ~1 minute');
    
    return testOrder;
}

function checkCompensationCodes() {
    const codes = JSON.parse(localStorage.getItem('discountCodes') || '[]');
    const compensationCodes = codes.filter(c => c.type === 'compensation');
    
    console.log('\n📋 Compensation Codes:', compensationCodes.length);
    compensationCodes.forEach(code => {
        console.log(`- ${code.code}: ${code.description}`);
        console.log(`  Discount: ${code.discount * 100}%`);
        console.log(`  Created: ${new Date(code.createdAt).toLocaleString()}`);
        console.log(`  Expires: ${new Date(code.expiresAt).toLocaleString()}`);
    });
    
    return compensationCodes;
}

function checkDelayedOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const now = new Date();
    
    const delayedOrders = orders.filter(order => {
        if (order.isDelivery && 
            order.expectedDeliveryTime && 
            order.status !== 'completed' && 
            order.status !== 'cancelled') {
            
            const expectedTime = new Date(order.expectedDeliveryTime);
            return now > expectedTime;
        }
        return false;
    });
    
    console.log('\n⏰ Delayed Delivery Orders:', delayedOrders.length);
    delayedOrders.forEach(order => {
        const expectedTime = new Date(order.expectedDeliveryTime);
        const delayMinutes = Math.floor((now - expectedTime) / 60000);
        
        console.log(`- ${order.id}`);
        console.log(`  Expected: ${expectedTime.toLocaleString()}`);
        console.log(`  Delayed by: ${delayMinutes} minutes`);
        console.log(`  Compensation given: ${order.compensationGiven ? 'Yes ✅' : 'No ❌'}`);
    });
    
    return delayedOrders;
}

function forceCheckDeliveries() {
    console.log('🔄 Forcing delivery check...');
    if (typeof checkDelayedDeliveries === 'function') {
        checkDelayedDeliveries();
        console.log('✅ Check completed!');
    } else {
        console.error('❌ checkDelayedDeliveries function not found. Make sure deliveryTracker.js is loaded.');
    }
}

// Run tests
console.log('=== Delivery Tracker Test Helper ===');
console.log('Available commands:');
console.log('1. createTestDelayedOrder() - Create a test order with past delivery time');
console.log('2. checkDelayedOrders() - Check which orders are delayed');
console.log('3. checkCompensationCodes() - View all compensation codes');
console.log('4. forceCheckDeliveries() - Manually trigger delivery check');
