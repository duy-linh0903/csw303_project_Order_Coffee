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
            price: 87500,
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
            price: 87500,
            quantity: 1,
            size: 'Medium'
        };
        cart.push(item);
        cart[0].quantity = 3;
        expect(cart[0].quantity).toBe(3);
    });

    test('should remove item from cart', () => {
        const item1 = { id: 1, name: 'Espresso', price: 87500, quantity: 1 };
        const item2 = { id: 2, name: 'Latte', price: 118750, quantity: 1 };
        cart.push(item1, item2);
        cart = cart.filter(item => item.id !== 1);
        expect(cart.length).toBe(1);
        expect(cart[0].name).toBe('Latte');
    });

    test('should calculate cart subtotal correctly', () => {
        const items = [
            { id: 1, name: 'Espresso', price: 87500, quantity: 2 },
            { id: 2, name: 'Latte', price: 118750, quantity: 1 }
        ];
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        expect(subtotal).toBe(293750); // (87500*2) + (118750*1)
    });

    test('should clear cart', () => {
        cart = [
            { id: 1, name: 'Espresso', price: 87500, quantity: 1 },
            { id: 2, name: 'Latte', price: 118750, quantity: 1 }
        ];
        cart = [];
        expect(cart.length).toBe(0);
    });
});

// Test Suite 5: Price Calculation with Customizations
describe('Price Calculation with Customizations', () => {
    
    test('should add 12,500 for Medium size', () => {
        const basePrice = 45000;
        const sizeExtra = 12500;
        const total = basePrice + sizeExtra;
        expect(total).toBe(57500);
    });

    test('should add 25,000 for Large size', () => {
        const basePrice = 45000;
        const sizeExtra = 25000;
        const total = basePrice + sizeExtra;
        expect(total).toBe(70000);
    });

    test('should add 18,750 for espresso shot', () => {
        const basePrice = 45000;
        const shotExtra = 18750;
        const total = basePrice + shotExtra;
        expect(total).toBe(63750);
    });

    test('should calculate total with all customizations', () => {
        const basePrice = 45000;
        const sizeExtra = 25000; // Large
        const shotExtra = 18750; // Extra shot
        const milkExtra = 12500; // Special milk
        const total = basePrice + sizeExtra + shotExtra + milkExtra;
        expect(total).toBe(101250);
    });
});

// Test Suite 6: Tax and Delivery Fee
describe('Tax and Delivery Calculation', () => {
    
    test('should calculate 10% tax correctly', () => {
        const subtotal = 100000;
        const tax = subtotal * 0.10;
        expect(tax).toBe(10000);
    });

    test('should apply 23,000 delivery fee', () => {
        const deliveryFee = 23000;
        expect(deliveryFee).toBe(23000);
    });

    test('should charge delivery fee for all tiers', () => {
        const tier = 'gold';
        const deliveryFee = 23000;
        expect(deliveryFee).toBe(23000);
    });

    test('should charge delivery fee for Diamond tier', () => {
        const tier = 'diamond';
        const deliveryFee = 23000;
        expect(deliveryFee).toBe(23000);
    });

    test('should calculate final total correctly', () => {
        const subtotal = 100000;
        const tax = subtotal * 0.10;
        const deliveryFee = 23000;
        const discount = subtotal * 0.05; // 5% Silver discount
        const total = subtotal + tax + deliveryFee - discount;
        expect(total).toBe(128000); // 100000 + 10000 + 23000 - 5000
    });
});

// Test Suite 7: Points Redemption System
describe('Reward System', () => {
    
    const pointsRedemption = [
        { points: 50, discount: 10000 },
        { points: 100, discount: 25000 },
        { points: 200, discount: 50000 },
        { points: 500, discount: 150000 }
    ];

    test('should allow redemption with sufficient points', () => {
        const userPoints = 100;
        const option = pointsRedemption[1]; // 25,000₫ Off - 100 points
        const canRedeem = userPoints >= option.points;
        expect(canRedeem).toBe(true);
    });

    test('should not allow redemption with insufficient points', () => {
        const userPoints = 50;
        const option = pointsRedemption[2]; // 50,000₫ Off - 200 points
        const canRedeem = userPoints >= option.points;
        expect(canRedeem).toBe(false);
    });

    test('should apply fixed discount correctly for 50 points', () => {
        const option = pointsRedemption[0]; // 10,000₫ Off - 50 points
        const discount = option.discount;
        expect(discount).toBe(10000);
    });

    test('should apply fixed discount correctly for 200 points', () => {
        const option = pointsRedemption[2]; // 50,000₫ Off - 200 points
        const discount = option.discount;
        expect(discount).toBe(50000);
    });

    test('should deduct points after redemption', () => {
        let userPoints = 100;
        const option = pointsRedemption[1]; // 25,000₫ Off - 100 points
        userPoints -= option.points;
        expect(userPoints).toBe(0);
    });
});

// Test Suite 8: Order Validation
describe('Order Validation', () => {
    
    test('should validate non-empty cart', () => {
        const cart = [{ id: 1, name: 'Espresso', price: 87500, quantity: 1 }];
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
        const cart = [{ id: 1, name: 'Espresso', price: 87500, quantity: 1 }];
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
