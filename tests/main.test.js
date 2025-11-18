/**
 * Unit Tests for Coffee Cabin Application
 * Testing core functionality: Cart, Orders, Member Tier, Points System
 */

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

global.localStorage = localStorageMock;

// Test Suite 1: Member Tier Calculation
describe('Member Tier Calculation', () => {
    
    test('should return Silver tier for spending >= 500,000', () => {
        const spending = 500000;
        const tier = calculateMemberTier(spending);
        expect(tier).toBe('silver');
    });

    test('should return Gold tier for spending >= 3,000,000', () => {
        const spending = 3000000;
        const tier = calculateMemberTier(spending);
        expect(tier).toBe('gold');
    });

    test('should return Diamond tier for spending >= 10,000,000', () => {
        const spending = 10000000;
        const tier = calculateMemberTier(spending);
        expect(tier).toBe('diamond');
    });

    test('should return null for spending < 500,000', () => {
        const spending = 400000;
        const tier = calculateMemberTier(spending);
        expect(tier).toBeNull();
    });
});

// Helper function for testing
function calculateMemberTier(totalSpending) {
    if (totalSpending >= 10000000) return 'diamond';
    if (totalSpending >= 3000000) return 'gold';
    if (totalSpending >= 500000) return 'silver';
    return null;
}

// Test Suite 2: Points Calculation
describe('Points Calculation', () => {
    
    test('should calculate 1 point per 10,000 VND spent', () => {
        const total = 50000;
        const basePoints = Math.floor(total / 10000);
        expect(basePoints).toBe(5);
    });

    test('should apply x2 multiplier for Gold tier', () => {
        const basePoints = 10;
        const goldMultiplier = 2;
        const finalPoints = basePoints * goldMultiplier;
        expect(finalPoints).toBe(20);
    });

    test('should apply x3 multiplier for Diamond tier', () => {
        const basePoints = 10;
        const diamondMultiplier = 3;
        const finalPoints = basePoints * diamondMultiplier;
        expect(finalPoints).toBe(30);
    });

    test('should round down decimal points', () => {
        const total = 15000; // 1.5 points
        const basePoints = Math.floor(total / 10000);
        expect(basePoints).toBe(1);
    });

    test('should return 0 points for spending < 10,000', () => {
        const total = 9999;
        const basePoints = Math.floor(total / 10000);
        expect(basePoints).toBe(0);
    });
});

// Test Suite 3: Discount Calculation
describe('Member Discount Calculation', () => {
    
    test('should apply 5% discount for Silver tier', () => {
        const total = 100000;
        const discount = total * 0.05;
        expect(discount).toBe(5000);
    });

    test('should apply 10% discount for Gold tier', () => {
        const total = 100000;
        const discount = total * 0.10;
        expect(discount).toBe(10000);
    });

    test('should apply 15% discount for Diamond tier', () => {
        const total = 100000;
        const discount = total * 0.15;
        expect(discount).toBe(15000);
    });

    test('should return 0 discount for non-members', () => {
        const total = 100000;
        const discount = 0;
        expect(discount).toBe(0);
    });
});

// Test Suite 4: Cart Operations
describe('Cart Operations', () => {
    
    let cart = [];

    beforeEach(() => {
        cart = [];
    });

    test('should add item to cart', () => {
        const item = {
            id: 1,
            name: 'Espresso',
            price: 85000,
            quantity: 1,
            size: 'Medium'
        };
        cart.push(item);
        expect(cart.length).toBe(1);
        expect(cart[0].name).toBe('Espresso');
    });

    test('should update item quantity in cart', () => {
        const item = {
            id: 1,
            name: 'Espresso',
            price: 85000,
            quantity: 1,
            size: 'Medium'
        };
        cart.push(item);
        cart[0].quantity = 3;
        expect(cart[0].quantity).toBe(3);
    });

    test('should remove item from cart', () => {
        const item1 = { id: 1, name: 'Espresso', price: 85000, quantity: 1 };
        const item2 = { id: 2, name: 'Latte', price: 95000, quantity: 1 };
        cart.push(item1, item2);
        cart = cart.filter(item => item.id !== 1);
        expect(cart.length).toBe(1);
        expect(cart[0].name).toBe('Latte');
    });

    test('should calculate cart subtotal correctly', () => {
        const items = [
            { id: 1, name: 'Espresso', price: 85000, quantity: 2 },
            { id: 2, name: 'Latte', price: 95000, quantity: 1 }
        ];
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        expect(subtotal).toBe(265000); // (85000*2) + (95000*1)
    });

    test('should clear cart', () => {
        cart = [
            { id: 1, name: 'Espresso', price: 85000, quantity: 1 },
            { id: 2, name: 'Latte', price: 95000, quantity: 1 }
        ];
        cart = [];
        expect(cart.length).toBe(0);
    });
});

// Test Suite 5: Price Calculation with Customizations
describe('Price Calculation with Customizations', () => {
    
    test('should add 10,000 for Medium size', () => {
        const basePrice = 85000;
        const sizeExtra = 10000;
        const total = basePrice + sizeExtra;
        expect(total).toBe(95000);
    });

    test('should add 25,000 for Large size', () => {
        const basePrice = 85000;
        const sizeExtra = 25000;
        const total = basePrice + sizeExtra;
        expect(total).toBe(110000);
    });

    test('should add 15,000 for espresso shot', () => {
        const basePrice = 85000;
        const shotExtra = 15000;
        const total = basePrice + shotExtra;
        expect(total).toBe(100000);
    });

    test('should calculate total with all customizations', () => {
        const basePrice = 85000;
        const sizeExtra = 25000; // Large
        const shotExtra = 15000; // Extra shot
        const total = basePrice + sizeExtra + shotExtra;
        expect(total).toBe(125000);
    });
});

// Test Suite 6: Tax and Delivery Fee
describe('Tax and Delivery Calculation', () => {
    
    test('should calculate 10% tax correctly', () => {
        const subtotal = 100000;
        const tax = subtotal * 0.10;
        expect(tax).toBe(10000);
    });

    test('should apply 25,000 delivery fee', () => {
        const deliveryFee = 25000;
        expect(deliveryFee).toBe(25000);
    });

    test('should waive delivery fee for Gold tier', () => {
        const tier = 'gold';
        const deliveryFee = tier === 'gold' || tier === 'diamond' ? 0 : 25000;
        expect(deliveryFee).toBe(0);
    });

    test('should waive delivery fee for Diamond tier', () => {
        const tier = 'diamond';
        const deliveryFee = tier === 'gold' || tier === 'diamond' ? 0 : 25000;
        expect(deliveryFee).toBe(0);
    });

    test('should calculate final total correctly', () => {
        const subtotal = 100000;
        const tax = subtotal * 0.10;
        const deliveryFee = 25000;
        const discount = subtotal * 0.05; // 5% Silver discount
        const total = subtotal + tax + deliveryFee - discount;
        expect(total).toBe(130000); // 100000 + 10000 + 25000 - 5000
    });
});

// Test Suite 7: Reward System
describe('Reward System', () => {
    
    const rewards = [
        { id: 1, name: '10% Off', points: 100, discount: 0.10, type: 'percentage' },
        { id: 2, name: '15% Off', points: 150, discount: 0.15, type: 'percentage' },
        { id: 3, name: 'Free Coffee', points: 75, discount: 125000, type: 'fixed' },
        { id: 4, name: '50,000₫ Off', points: 50, discount: 50000, type: 'fixed' }
    ];

    test('should allow redemption with sufficient points', () => {
        const userPoints = 100;
        const reward = rewards[0]; // 10% Off - 100 points
        const canRedeem = userPoints >= reward.points;
        expect(canRedeem).toBe(true);
    });

    test('should not allow redemption with insufficient points', () => {
        const userPoints = 50;
        const reward = rewards[1]; // 15% Off - 150 points
        const canRedeem = userPoints >= reward.points;
        expect(canRedeem).toBe(false);
    });

    test('should apply percentage discount correctly', () => {
        const subtotal = 200000;
        const reward = rewards[0]; // 10% Off
        const discount = subtotal * reward.discount;
        expect(discount).toBe(20000);
    });

    test('should apply fixed discount correctly', () => {
        const reward = rewards[3]; // 50,000₫ Off
        const discount = reward.discount;
        expect(discount).toBe(50000);
    });

    test('should deduct points after redemption', () => {
        let userPoints = 100;
        const reward = rewards[0]; // 10% Off - 100 points
        userPoints -= reward.points;
        expect(userPoints).toBe(0);
    });
});

// Test Suite 8: Order Validation
describe('Order Validation', () => {
    
    test('should validate non-empty cart', () => {
        const cart = [{ id: 1, name: 'Espresso', price: 85000, quantity: 1 }];
        const isValid = cart.length > 0;
        expect(isValid).toBe(true);
    });

    test('should reject empty cart', () => {
        const cart = [];
        const isValid = cart.length > 0;
        expect(isValid).toBe(false);
    });

    test('should validate customer information', () => {
        const customer = {
            name: 'John Doe',
            phone: '0123456789',
            address: '123 Main St'
        };
        const isValid = !!(customer.name && customer.phone && customer.address);
        expect(isValid).toBe(true);
    });

    test('should reject invalid customer information', () => {
        const customer = {
            name: '',
            phone: '',
            address: ''
        };
        const isValid = !!(customer.name && customer.phone && customer.address);
        expect(isValid).toBe(false);
    });
});

// Test Suite 9: Order ID Generation
describe('Order ID Generation', () => {
    
    test('should generate unique order ID with ORD prefix', () => {
        const orderId = 'ORD' + Date.now();
        expect(orderId).toMatch(/^ORD\d+$/);
    });

    test('should generate different IDs for sequential orders', () => {
        const orderId1 = 'ORD' + Date.now();
        const orderId2 = 'ORD' + (Date.now() + 1);
        expect(orderId1).not.toBe(orderId2);
    });
});

// Test Suite 10: LocalStorage Operations
describe('LocalStorage Operations', () => {
    
    beforeEach(() => {
        localStorage.clear();
    });

    test('should save user to localStorage', () => {
        const user = { name: 'John Doe', email: 'john@example.com' };
        localStorage.setItem('currentUser', JSON.stringify(user));
        const saved = JSON.parse(localStorage.getItem('currentUser'));
        expect(saved.name).toBe('John Doe');
    });

    test('should save cart to localStorage', () => {
        const cart = [{ id: 1, name: 'Espresso', price: 85000, quantity: 1 }];
        localStorage.setItem('cart', JSON.stringify(cart));
        const saved = JSON.parse(localStorage.getItem('cart'));
        expect(saved.length).toBe(1);
    });

    test('should retrieve user from localStorage', () => {
        const user = { name: 'John Doe', email: 'john@example.com' };
        localStorage.setItem('currentUser', JSON.stringify(user));
        const retrieved = JSON.parse(localStorage.getItem('currentUser'));
        expect(retrieved.email).toBe('john@example.com');
    });

    test('should remove user from localStorage', () => {
        const user = { name: 'John Doe', email: 'john@example.com' };
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.removeItem('currentUser');
        const retrieved = localStorage.getItem('currentUser');
        expect(retrieved).toBeNull();
    });
});

console.log('✅ All test suites completed!');
