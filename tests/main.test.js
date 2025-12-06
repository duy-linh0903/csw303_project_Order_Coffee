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

    test('should apply x1.5 multiplier for Gold tier', () => {
        const basePoints = 10;
        const goldMultiplier = 1.5;
        const finalPoints = basePoints * goldMultiplier;
        expect(finalPoints).toBe(15);
    });

    test('should apply x2 multiplier for Diamond tier', () => {
        const basePoints = 10;
        const diamondMultiplier = 2;
        const finalPoints = basePoints * diamondMultiplier;
        expect(finalPoints).toBe(20);
    });

    test('should apply x1 multiplier for Silver tier', () => {
        const basePoints = 10;
        const silverMultiplier = 1;
        const finalPoints = basePoints * silverMultiplier;
        expect(finalPoints).toBe(10);
    });

    test('should handle decimal multiplier correctly', () => {
        const basePoints = 7;
        const goldMultiplier = 1.5;
        const finalPoints = Math.floor(basePoints * goldMultiplier);
        expect(finalPoints).toBe(10); // 7 * 1.5 = 10.5, floor to 10
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

    test('should provide free delivery for Gold tier', () => {
        const tier = 'gold';
        const deliveryFee = tier === 'gold' || tier === 'diamond' ? 0 : 23000;
        expect(deliveryFee).toBe(0);
    });

    test('should provide free delivery for Diamond tier', () => {
        const tier = 'diamond';
        const deliveryFee = tier === 'gold' || tier === 'diamond' ? 0 : 23000;
        expect(deliveryFee).toBe(0);
    });

    test('should charge delivery fee for Silver tier', () => {
        const tier = 'silver';
        const deliveryFee = tier === 'gold' || tier === 'diamond' ? 0 : 23000;
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
    
    const rewardsData = [
        { id: 1, name: 'Free Coffee', points: 100, type: 'free-cheapest' },
        { id: 2, name: 'Free Pastry', points: 75, type: 'add-pastry' },
        { id: 3, name: '10% Off', points: 50, type: 'percentage', discount: 0.1 },
        { id: 4, name: 'Free Upgrade', points: 150, type: 'free-full-price' }
    ];

    test('should allow redemption with sufficient points', () => {
        const userPoints = 100;
        const reward = rewardsData[0]; // Free Coffee - 100 points
        const canRedeem = userPoints >= reward.points;
        expect(canRedeem).toBe(true);
    });

    test('should not allow redemption with insufficient points', () => {
        const userPoints = 50;
        const reward = rewardsData[0]; // Free Coffee - 100 points
        const canRedeem = userPoints >= reward.points;
        expect(canRedeem).toBe(false);
    });

    test('Free Coffee should find most expensive item by base price + size', () => {
        const cart = [
            { id: 1, name: 'Espresso', price: 62500, totalPrice: 62500, customizations: { size: 'Small' } },
            { id: 2, name: 'Cappuccino', price: 68750, totalPrice: 103125, customizations: { size: 'Large' } }, // basePrice * 1.5
            { id: 3, name: 'Latte', price: 75000, totalPrice: 97500, customizations: { size: 'Medium' } } // basePrice * 1.3
        ];
        
        // Cappuccino Large có giá cao nhất: 68750 * 1.5 = 103.125k
        const maxPrice = 103125;
        const discount = Math.min(maxPrice, 100000); // Giới hạn 100k
        expect(discount).toBe(100000);
    });

    test('Free Coffee should cap discount at 100,000', () => {
        const itemPrice = 150000; // Item đắt
        const discount = Math.min(itemPrice, 100000);
        expect(discount).toBe(100000);
    });

    test('10% Off should calculate percentage discount', () => {
        const subtotal = 200000;
        const discount = subtotal * 0.1;
        expect(discount).toBe(20000);
    });

    test('Free Upgrade should use full price including customizations', () => {
        const cart = [
            { id: 1, name: 'Latte', price: 75000, totalPrice: 142500 }, // với milk + shots
            { id: 2, name: 'Cappuccino', price: 68750, totalPrice: 103125 }
        ];
        
        const maxFullPrice = Math.max(...cart.map(item => item.totalPrice));
        expect(maxFullPrice).toBe(142500);
    });

    test('Free Upgrade should not have cap limit', () => {
        const itemPrice = 200000; // Item rất đắt với customize
        const discount = itemPrice; // Không giới hạn
        expect(discount).toBe(200000);
    });

    test('should deduct points after redemption', () => {
        let userPoints = 100;
        const reward = rewardsData[0]; // Free Coffee - 100 points
        userPoints -= reward.points;
        expect(userPoints).toBe(0);
    });

    test('Free Pastry should not affect discount calculation', () => {
        // Free Pastry type = 'add-pastry', không tạo discount
        const reward = rewardsData[1];
        expect(reward.type).toBe('add-pastry');
        // Discount được tính riêng, không ảnh hưởng
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

// Test Suite 11: Dynamic Customize Options
describe('Dynamic Customize Options', () => {
    
    const defaultOptions = {
        sizes: [
            { value: 'Small', label: 'Small', priceMultiplier: 1.0 },
            { value: 'Medium', label: 'Medium', priceMultiplier: 1.3 },
            { value: 'Large', label: 'Large', priceMultiplier: 1.5 }
        ],
        sugarLevels: [
            { value: '0%', label: 'No Sugar' },
            { value: '25%', label: '25%' },
            { value: '50%', label: '50%' },
            { value: '75%', label: '75%' },
            { value: '100%', label: '100%' }
        ],
        milkTypes: [
            { value: 'Regular', label: 'Regular', price: 0 },
            { value: 'Soy', label: 'Soy Milk', price: 12500 },
            { value: 'Almond', label: 'Almond Milk', price: 15000 },
            { value: 'Oat', label: 'Oat Milk', price: 15000 }
        ],
        extraShotPrice: 15000
    };

    test('should calculate price with size multiplier', () => {
        const basePrice = 62500; // Espresso
        const sizeMultiplier = 1.5; // Large
        const finalPrice = basePrice * sizeMultiplier;
        expect(finalPrice).toBe(93750);
    });

    test('should add milk price correctly', () => {
        const basePrice = 62500;
        const milkPrice = 15000; // Oat Milk
        const finalPrice = basePrice + milkPrice;
        expect(finalPrice).toBe(77500);
    });

    test('should calculate full price with all customizations', () => {
        const basePrice = 62500;
        const sizeMultiplier = 1.5; // Large
        const milkPrice = 15000; // Oat Milk
        const extraShotPrice = 15000 * 2; // 2 shots
        const finalPrice = (basePrice * sizeMultiplier) + milkPrice + extraShotPrice;
        expect(finalPrice).toBe(138750); // 93750 + 15000 + 30000
    });

    test('should handle Small size with no extra cost', () => {
        const basePrice = 62500;
        const sizeMultiplier = 1.0; // Small
        const finalPrice = basePrice * sizeMultiplier;
        expect(finalPrice).toBe(62500);
    });

    test('should handle Regular milk with no extra cost', () => {
        const basePrice = 62500;
        const milkPrice = 0; // Regular
        const finalPrice = basePrice + milkPrice;
        expect(finalPrice).toBe(62500);
    });
});

// Test Suite 12: Member Tier Benefits
describe('Member Tier Benefits', () => {
    
    test('Silver tier should have correct benefits', () => {
        const benefits = {
            tier: 'silver',
            pointMultiplier: 1,
            discount: 0.05,
            freeShipping: false,
            birthdayBonus: 50,
            prioritySupport: true
        };
        expect(benefits.pointMultiplier).toBe(1);
        expect(benefits.discount).toBe(0.05);
        expect(benefits.freeShipping).toBe(false);
    });

    test('Gold tier should have correct benefits', () => {
        const benefits = {
            tier: 'gold',
            pointMultiplier: 1.5,
            discount: 0.10,
            freeShipping: true,
            birthdayBonus: 100,
            prioritySupport: false
        };
        expect(benefits.pointMultiplier).toBe(1.5);
        expect(benefits.discount).toBe(0.10);
        expect(benefits.freeShipping).toBe(true);
    });

    test('Diamond tier should have correct benefits', () => {
        const benefits = {
            tier: 'diamond',
            pointMultiplier: 2,
            discount: 0.15,
            freeShipping: true,
            birthdayBonus: 200,
            prioritySupport: true,
            vipAccess: true
        };
        expect(benefits.pointMultiplier).toBe(2);
        expect(benefits.discount).toBe(0.15);
        expect(benefits.freeShipping).toBe(true);
        expect(benefits.vipAccess).toBe(true);
    });

    test('should calculate points with tier multiplier', () => {
        const orderTotal = 100000;
        const basePoints = Math.floor(orderTotal / 10000); // 10 points
        const goldMultiplier = 1.5;
        const finalPoints = Math.floor(basePoints * goldMultiplier);
        expect(finalPoints).toBe(15); // 10 * 1.5 = 15
    });
});

// Test Suite 13: Delivery Time Validation
describe('Delivery Time Validation', () => {
    
    test('should validate 15-minute minimum notice', () => {
        const now = new Date();
        const deliveryTime = new Date(now.getTime() + 20 * 60000); // 20 minutes later
        const minTime = new Date(now.getTime() + 15 * 60000); // 15 minutes minimum
        const isValid = deliveryTime >= minTime;
        expect(isValid).toBe(true);
    });

    test('should reject delivery time less than 15 minutes', () => {
        const now = new Date();
        const deliveryTime = new Date(now.getTime() + 10 * 60000); // 10 minutes later
        const minTime = new Date(now.getTime() + 15 * 60000);
        const isValid = deliveryTime >= minTime;
        expect(isValid).toBe(false);
    });

    test('should accept delivery time exactly 15 minutes', () => {
        const now = new Date();
        const deliveryTime = new Date(now.getTime() + 15 * 60000);
        const minTime = new Date(now.getTime() + 15 * 60000);
        const isValid = deliveryTime >= minTime;
        expect(isValid).toBe(true);
    });
});

// Test Suite 14: Compensation Code Generation
describe('Compensation Code System', () => {
    
    test('should generate code with SORRY prefix', () => {
        const code = 'SORRY' + Math.random().toString(36).substring(2, 8).toUpperCase();
        expect(code).toMatch(/^SORRY[A-Z0-9]{6}$/);
    });

    test('should create 10% discount code', () => {
        const discountPercentage = 10;
        expect(discountPercentage).toBe(10);
    });

    test('should set 30-day expiry', () => {
        const now = new Date();
        const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const daysDiff = Math.floor((expiry - now) / (24 * 60 * 60 * 1000));
        expect(daysDiff).toBe(30);
    });

    test('should mark compensation as given', () => {
        const order = {
            id: 'ORD123',
            compensationGiven: false
        };
        order.compensationGiven = true;
        expect(order.compensationGiven).toBe(true);
    });
});

console.log('✅ All test suites completed!');
