// VND Currency Formatter
function formatVND(amount) {
    return amount.toLocaleString('vi-VN') + '₫';
}

// Menu Data - Load from localStorage or use default
let menuItems = [];

function initializeMenuItems() {
    const savedMenuItems = localStorage.getItem('menuItems');
    if (savedMenuItems) {
        menuItems = JSON.parse(savedMenuItems);
    } else {
        // Default menu items
        menuItems = [
            { id: 1, name: 'Espresso', price: 35000, description: 'Rich and bold espresso shot', category: 'hot', image: 'linear-gradient(135deg, #6f4e37, #8B4513)' },
            { id: 2, name: 'Cappuccino', price: 45000, description: 'Espresso with steamed milk foam', category: 'hot', image: 'linear-gradient(135deg, #8B4513, #A0522D)' },
            { id: 3, name: 'Latte', price: 48000, description: 'Smooth espresso with steamed milk', category: 'hot', image: 'linear-gradient(135deg, #D2691E, #CD853F)' },
            { id: 4, name: 'Americano', price: 38000, description: 'Espresso with hot water', category: 'hot', image: 'linear-gradient(135deg, #4B3621, #6F4E37)' },
            { id: 5, name: 'Iced Coffee', price: 40000, description: 'Refreshing cold brewed coffee', category: 'iced', image: 'linear-gradient(135deg, #4682B4, #5F9EA0)' },
            { id: 6, name: 'Iced Latte', price: 50000, description: 'Cold espresso with milk and ice', category: 'iced', image: 'linear-gradient(135deg, #87CEEB, #B0E0E6)' },
            { id: 7, name: 'Cold Brew', price: 45000, description: 'Smooth cold brewed coffee', category: 'iced', image: 'linear-gradient(135deg, #2C3E50, #34495E)' },
            { id: 8, name: 'Frappe', price: 55000, description: 'Blended iced coffee drink', category: 'iced', image: 'linear-gradient(135deg, #D4A574, #E8C39E)' },
            { id: 9, name: 'Caramel Macchiato', price: 58000, description: 'Vanilla and caramel latte', category: 'special', image: 'linear-gradient(135deg, #D2691E, #F4A460)' },
            { id: 10, name: 'Mocha', price: 53000, description: 'Chocolate and espresso blend', category: 'special', image: 'linear-gradient(135deg, #3E2723, #5D4037)' },
            { id: 11, name: 'Vanilla Latte', price: 50000, description: 'Latte with vanilla syrup', category: 'special', image: 'linear-gradient(135deg, #F5DEB3, #FFE4B5)' },
            { id: 12, name: 'Pumpkin Spice', price: 60000, description: 'Seasonal pumpkin spice latte', category: 'special', image: 'linear-gradient(135deg, #FF8C00, #FFA500)' }
        ];
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
    }
}

// Rewards Data
const rewardsData = [
    { id: 1, name: 'Free Coffee', points: 100, type: 'free-cheapest', description: 'Miễn phí 1 món đắt nhất (tối đa 100k)' },
    { id: 2, name: 'Free Pastry', points: 75, type: 'add-pastry', description: 'Tặng miễn phí 1 pastry (thêm vào đơn)' },
    { id: 3, name: '10% Off', points: 50, type: 'percentage', discount: 0.1, description: 'Giảm 10% tổng đơn hàng' },
    { id: 4, name: 'Free Upgrade', points: 150, type: 'free-full-price', description: 'Miễn phí 1 món đắt nhất (bao gồm customize)' }
];

// Global State
let cart = [];
let currentUser = null;
let userPoints = 0;
let appliedDiscount = 0;
let appliedReward = null;
let currentOrderItem = null;
let isDelivery = false;
let deliveryFee = 23000;
let deliveryInfo = null;

// Get customize options from localStorage (set by admin)
function getCustomizeOptions() {
    const saved = localStorage.getItem('customizeOptions');
    if (saved) {
        return JSON.parse(saved);
    }
    // Default options if not set by admin
    return {
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
            { value: 'soy', label: 'Soy Milk', price: 3000 },
            { value: 'almond', label: 'Almond Milk', price: 5000 },
            { value: 'oat', label: 'Oat Milk', price: 5000 }
        ],
        extraShotPrice: 10000
    };
}
let memberCardDiscount = 0;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeMenuItems();
    renderMenu('all');
    setupEventListeners();
    loadUserData();
    loadCart();
    renderRewards();
    updateMemberCardCompact();
    checkLoginStatus();
    initPromotionSlider();
    loadNotifications();
    
    // Listen for customize options updates from admin
    window.addEventListener('customizeOptionsUpdated', function() {
        // If order detail modal is open, re-render options
        const modal = document.getElementById('orderDetailModal');
        if (modal && modal.style.display === 'block' && currentOrderItem) {
            renderCustomizeOptions();
            updateDetailTotal();
        }
    });
});

// Reload cart when page becomes visible (user returns from cart page)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        loadCart();
    }
});

// Reload cart when window gains focus
window.addEventListener('focus', function() {
    loadCart();
});

// Promotion Banner Slider
let currentBannerIndex = 0;
let bannerInterval;

function initPromotionSlider() {
    const banners = document.querySelectorAll('.promotion-banner');
    const dotsContainer = document.getElementById('sliderDots');
    
    // Create dots
    banners.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => goToBanner(index);
        dotsContainer.appendChild(dot);
    });
    
    // Auto slide every 5 seconds
    startAutoSlide();
}

function startAutoSlide() {
    bannerInterval = setInterval(() => {
        changeBanner(1);
    }, 5000);
}

function stopAutoSlide() {
    clearInterval(bannerInterval);
}

function changeBanner(direction) {
    const banners = document.querySelectorAll('.promotion-banner');
    const dots = document.querySelectorAll('.slider-dot');
    
    // Remove active class
    banners[currentBannerIndex].classList.remove('active');
    dots[currentBannerIndex].classList.remove('active');
    
    // Calculate new index
    currentBannerIndex = (currentBannerIndex + direction + banners.length) % banners.length;
    
    // Add active class
    banners[currentBannerIndex].classList.add('active');
    dots[currentBannerIndex].classList.add('active');
    
    // Reset auto slide
    stopAutoSlide();
    startAutoSlide();
}

function goToBanner(index) {
    const banners = document.querySelectorAll('.promotion-banner');
    const dots = document.querySelectorAll('.slider-dot');
    
    // Remove active class
    banners[currentBannerIndex].classList.remove('active');
    dots[currentBannerIndex].classList.remove('active');
    
    // Set new index
    currentBannerIndex = index;
    
    // Add active class
    banners[currentBannerIndex].classList.add('active');
    dots[currentBannerIndex].classList.add('active');
    
    // Reset auto slide
    stopAutoSlide();
    startAutoSlide();
}

// Render Menu
function renderMenu(filter) {
    const menuGrid = document.getElementById('menuGrid');
    menuGrid.innerHTML = '';

    const filteredItems = filter === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === filter);

    filteredItems.forEach(item => {
        // Handle both base64 and URL/gradient images
        const backgroundStyle = item.image.startsWith('data:') 
            ? `background-image: url('${item.image}')` 
            : `background: ${item.image}`;
        
        const menuItemEl = document.createElement('div');
        menuItemEl.className = 'menu-item';
        menuItemEl.innerHTML = `
            <div class="menu-item-image" style="${backgroundStyle}"></div>
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <h3 class="menu-item-title">${item.name}</h3>
                    <span class="menu-item-price">${formatVND(item.price)}</span>
                </div>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-footer">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="decreaseQuantity(${item.id})">-</button>
                        <span class="quantity-display" id="qty-${item.id}">1</span>
                        <button class="quantity-btn" onclick="increaseQuantity(${item.id})">+</button>
                    </div>
                    <button class="add-to-cart-btn" onclick="openOrderDetail(${item.id})">
                        <i class="fas fa-cart-plus"></i> Customize & Add
                    </button>
                </div>
            </div>
        `;
        menuGrid.appendChild(menuItemEl);
    });
}

// Quantity Control
function increaseQuantity(itemId) {
    const qtyEl = document.getElementById(`qty-${itemId}`);
    let qty = parseInt(qtyEl.textContent);
    qtyEl.textContent = qty + 1;
}

function decreaseQuantity(itemId) {
    const qtyEl = document.getElementById(`qty-${itemId}`);
    let qty = parseInt(qtyEl.textContent);
    if (qty > 1) {
        qtyEl.textContent = qty - 1;
    }
}

// Add to Cart
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    const qtyEl = document.getElementById(`qty-${itemId}`);
    const quantity = parseInt(qtyEl.textContent);

    const existingItem = cart.find(i => i.id === itemId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...item, quantity });
    }

    qtyEl.textContent = '1';
    updateCart();
    showNotification('Added to cart!');
}

// Open Order Detail Modal
// Render customize options from admin settings
function renderCustomizeOptions() {
    const options = getCustomizeOptions();
    const form = document.getElementById('orderDetailForm');
    
    // Render Size Options
    const sizeGroup = form.querySelector('[name="size"]').closest('.option-group');
    sizeGroup.innerHTML = options.sizes.map((size, index) => {
        const priceText = size.priceMultiplier !== 1.0 
            ? ` (${size.priceMultiplier > 1 ? '+' : ''}${Math.round((size.priceMultiplier - 1) * 100)}%)`
            : '';
        return `
            <label class="option-radio">
                <input type="radio" name="size" value="${size.value}" data-multiplier="${size.priceMultiplier}" ${index === 0 ? 'checked' : ''}>
                <span>${size.label}${priceText}</span>
            </label>
        `;
    }).join('');
    
    // Render Sugar Levels
    const sugarGroup = form.querySelector('[name="sugar"]').closest('.option-group');
    sugarGroup.innerHTML = options.sugarLevels.map((sugar, index) => `
        <label class="option-radio">
            <input type="radio" name="sugar" value="${sugar.value}" ${index === 0 ? 'checked' : ''}>
            <span>${sugar.label}</span>
        </label>
    `).join('');
    
    // Render Ice Levels
    const iceGroup = form.querySelector('[name="ice"]').closest('.option-group');
    iceGroup.innerHTML = options.iceLevels.map((ice, index) => `
        <label class="option-radio">
            <input type="radio" name="ice" value="${ice.value}" ${index === Math.floor(options.iceLevels.length / 2) ? 'checked' : ''}>
            <span>${ice.label}</span>
        </label>
    `).join('');
    
    // Render Milk Types
    const milkGroup = form.querySelector('[name="milk"]').closest('.option-group');
    milkGroup.innerHTML = options.milkTypes.map((milk, index) => {
        const priceText = milk.price > 0 ? ` (+${formatVND(milk.price)})` : '';
        return `
            <label class="option-radio">
                <input type="radio" name="milk" value="${milk.value}" data-price="${milk.price}" ${index === 0 ? 'checked' : ''}>
                <span>${milk.label}${priceText}</span>
            </label>
        `;
    }).join('');
    
    // Render Extra Shots (using extraShotPrice from options)
    const extraShotPrice = options.extraShotPrice;
    const extraShotsGroup = form.querySelector('[name="extraShots"]').closest('.option-group');
    extraShotsGroup.innerHTML = `
        <label class="option-radio">
            <input type="radio" name="extraShots" value="0" data-price="0" checked>
            <span>None</span>
        </label>
        <label class="option-radio">
            <input type="radio" name="extraShots" value="1" data-price="${extraShotPrice}">
            <span>+1 Shot (+${formatVND(extraShotPrice)})</span>
        </label>
        <label class="option-radio">
            <input type="radio" name="extraShots" value="2" data-price="${extraShotPrice * 2}">
            <span>+2 Shots (+${formatVND(extraShotPrice * 2)})</span>
        </label>
    `;
    
    // Add change listeners to update total
    form.querySelectorAll('input[type="radio"]').forEach(input => {
        input.addEventListener('change', updateDetailTotal);
    });
}

function openOrderDetail(itemId) {
    currentOrderItem = menuItems.find(i => i.id === itemId);
    
    document.getElementById('orderDetailTitle').textContent = `Customize Your ${currentOrderItem.name}`;
    document.getElementById('detailImage').style.background = currentOrderItem.image;
    document.getElementById('detailName').textContent = currentOrderItem.name;
    document.getElementById('detailDescription').textContent = currentOrderItem.description;
    document.getElementById('detailPrice').textContent = `Giá gốc: ${formatVND(currentOrderItem.price)}`;
    
    // Render customize options from admin settings
    renderCustomizeOptions();
    
    // Show ice option only for iced drinks
    const iceGroup = document.getElementById('iceGroup');
    if (currentOrderItem.category === 'iced') {
        iceGroup.style.display = 'block';
    } else {
        iceGroup.style.display = 'none';
    }
    
    // Reset form
    document.getElementById('detailQuantity').textContent = '1';
    document.getElementById('orderNotes').value = '';
    
    updateDetailTotal();
    document.getElementById('orderDetailModal').style.display = 'block';
}

// Update Detail Total
function updateDetailTotal() {
    if (!currentOrderItem) return;
    
    let total = currentOrderItem.price;
    const form = document.getElementById('orderDetailForm');
    
    // Calculate size multiplier (from admin settings)
    const sizeInput = form.querySelector('input[name="size"]:checked');
    if (sizeInput) {
        const multiplier = parseFloat(sizeInput.dataset.multiplier || 1.0);
        total *= multiplier;
    }
    
    // Add milk price (from admin settings)
    const milkInput = form.querySelector('input[name="milk"]:checked');
    if (milkInput) {
        const milkPrice = parseFloat(milkInput.dataset.price || 0);
        total += milkPrice;
    }
    
    // Add extra shots price (from admin settings)
    const extraShotsInput = form.querySelector('input[name="extraShots"]:checked');
    if (extraShotsInput) {
        const extraPrice = parseFloat(extraShotsInput.dataset.price || 0);
        total += extraPrice;
    }
    
    // Multiply by quantity
    const quantity = parseInt(document.getElementById('detailQuantity').textContent);
    total *= quantity;
    
    document.getElementById('detailTotal').textContent = formatVND(total);
}

// Increase Detail Quantity
function increaseDetailQuantity() {
    const qtyEl = document.getElementById('detailQuantity');
    let qty = parseInt(qtyEl.textContent);
    qtyEl.textContent = qty + 1;
    updateDetailTotal();
}

// Decrease Detail Quantity
function decreaseDetailQuantity() {
    const qtyEl = document.getElementById('detailQuantity');
    let qty = parseInt(qtyEl.textContent);
    if (qty > 1) {
        qtyEl.textContent = qty - 1;
        updateDetailTotal();
    }
}

// Update Cart
function updateCart() {
    const cartCount = document.getElementById('cartCount');
    const orderList = document.getElementById('orderList');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        orderList.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
    } else {
        orderList.innerHTML = cart.map((item, index) => `
            <div class="order-item">
                <div class="order-item-info">
                    <h4>${item.name}</h4>
                    <p class="order-item-price">${formatVND(item.totalPrice ? item.totalPrice : item.price)} x ${item.quantity}</p>
                    ${item.customizations ? `
                        <div class="order-item-details">
                            ${item.customizations.size ? `<div class="order-item-detail"><i class="fas fa-coffee"></i> ${item.customizations.size}</div>` : ''}
                            ${item.customizations.sugar ? `<div class="order-item-detail"><i class="fas fa-cube"></i> Sugar: ${item.customizations.sugar}</div>` : ''}
                            ${item.customizations.ice ? `<div class="order-item-detail"><i class="fas fa-snowflake"></i> Ice: ${item.customizations.ice}</div>` : ''}
                            ${item.customizations.milk && item.customizations.milk !== 'Regular' ? `<div class="order-item-detail"><i class="fas fa-glass-whiskey"></i> ${item.customizations.milk}</div>` : ''}
                            ${item.customizations.extraShots && item.customizations.extraShots > 0 ? `<div class="order-item-detail"><i class="fas fa-plus-circle"></i> +${item.customizations.extraShots} shot(s)</div>` : ''}
                            ${item.customizations.notes ? `<div class="order-item-note"><i class="fas fa-sticky-note"></i> Note: ${item.customizations.notes}</div>` : ''}
                        </div>
                    ` : ''}
                </div>
                <div class="order-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateOrderSummary();
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update Cart Quantity
function updateCartQuantity(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            removeFromCart(index);
        } else {
            updateCart();
        }
    }
}

// Remove from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
    showNotification('Item removed from cart');
}

// Clear entire cart
function clearCart() {
    cart = [];
    updateCart();
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Get member card tier benefits
function getMemberTierBenefits() {
    if (!currentUser) return { 
        tier: 'none', 
        pointMultiplier: 1, 
        tierName: 'Chưa có thẻ',
        freeShipping: false,
        birthdayBonus: 0,
        prioritySupport: false,
        discount: 0
    };
    
    const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const userOrdersList = userOrders.filter(order => order.userEmail === currentUser.email);
    const totalSpending = userOrdersList.reduce((sum, order) => sum + order.total, 0);
    
    if (totalSpending >= 10000000) {
        return { 
            tier: 'diamond', 
            pointMultiplier: 2, 
            tierName: 'Thẻ Kim Cương',
            freeShipping: true,
            birthdayBonus: 200,
            prioritySupport: true,
            discount: 0.15, // 15% discount
            vipAccess: true
        };
    } else if (totalSpending >= 3000000) {
        return { 
            tier: 'gold', 
            pointMultiplier: 1.5, 
            tierName: 'Thẻ Vàng',
            freeShipping: true,
            birthdayBonus: 100,
            prioritySupport: false,
            discount: 0.10 // 10% discount
        };
    } else if (totalSpending >= 500000) {
        return { 
            tier: 'silver', 
            pointMultiplier: 1, 
            tierName: 'Thẻ Bạc',
            freeShipping: false,
            birthdayBonus: 50,
            prioritySupport: true,
            discount: 0.05 // 5% discount
        };
    }
    
    return { 
        tier: 'none', 
        pointMultiplier: 1, 
        tierName: 'Chưa có thẻ',
        freeShipping: false,
        birthdayBonus: 0,
        prioritySupport: false,
        discount: 0
    };
}

// Update Order Summary
function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => {
        const price = item.totalPrice || item.price;
        return sum + (price * item.quantity);
    }, 0);
    const tax = subtotal * 0.1;
    
    // Get member benefits for display and discount
    const memberBenefits = getMemberTierBenefits();
    
    // Apply member card discount (only Diamond tier gets 5% discount)
    let memberDiscount = 0;
    if (memberBenefits.discount) {
        memberDiscount = subtotal * memberBenefits.discount;
    }
    
    // Calculate discount based on reward type
    let finalDiscount = memberDiscount;
    if (appliedReward) {
        if (appliedReward.type === 'percentage') {
            // 10% Off
            finalDiscount += subtotal * appliedReward.discount;
        } else if (appliedReward.type === 'free-cheapest') {
            // Free Coffee - miễn 1 item duy nhất có giá cao nhất (giá gốc + size, không tính milk/shots, tối đa 100.000₫)
            if (cart.length > 0) {
                // Tìm item có giá cao nhất (chỉ tính giá gốc * size)
                let expensiveItem = null;
                let maxPrice = 0;
                
                cart.forEach(item => {
                    // Lấy giá gốc từ menuItems
                    const originalItem = menuItems.find(m => m.id === item.id);
                    const basePrice = originalItem ? originalItem.price : item.price;
                    
                    // Tính giá với size (lấy từ form khi add to cart)
                    let priceWithSize = basePrice;
                    if (item.customizations && item.customizations.size) {
                        // Lấy size multiplier từ customize options
                        const options = getCustomizeOptions();
                        const sizeOption = options.sizes.find(s => s.value === item.customizations.size);
                        if (sizeOption) {
                            priceWithSize = basePrice * sizeOption.priceMultiplier;
                        }
                    }
                    
                    // So sánh giá (không nhân quantity để tìm item đắt nhất)
                    if (priceWithSize > maxPrice) {
                        maxPrice = priceWithSize;
                        expensiveItem = item;
                    }
                });
                
                if (expensiveItem) {
                    // Tính discount = giá gốc * size multiplier (CHỈ 1 ITEM, không nhân quantity)
                    // Lấy giá gốc từ menuItems - KHÔNG tính member discount, chỉ giá gốc thuần túy
                    const originalItem = menuItems.find(m => m.id === expensiveItem.id);
                    const basePrice = originalItem ? originalItem.price : expensiveItem.price;
                    
                    let itemDiscount = basePrice;
                    if (expensiveItem.customizations && expensiveItem.customizations.size) {
                        const options = getCustomizeOptions();
                        const sizeOption = options.sizes.find(s => s.value === expensiveItem.customizations.size);
                        if (sizeOption) {
                            itemDiscount = basePrice * sizeOption.priceMultiplier;
                        }
                    }
                    
                    // CHỈ MIỄN 1 ITEM, không nhân với quantity
                    // Giá này là GIÁ GỐC, không bị ảnh hưởng bởi member discount hay bất kỳ giảm giá nào khác
                    
                    // Giới hạn tối đa 100.000₫
                    finalDiscount += Math.min(itemDiscount, 100000);
                }
            }
        } else if (appliedReward.type === 'free-full-price') {
            // Free Upgrade - miễn 1 item duy nhất có giá cao nhất (BAO GỐM CẢ CUSTOMIZE)
            if (cart.length > 0) {
                // Tìm item có giá cao nhất (bao gồm tất cả: size, milk, extra shots)
                let expensiveItem = null;
                let maxFullPrice = 0;
                
                cart.forEach(item => {
                    // Lấy giá đầy đủ từ cart (totalPrice đã bao gồm tất cả customize)
                    const fullPrice = item.totalPrice || item.price;
                    
                    // So sánh giá (đầy đủ, không nhân quantity để tìm item đắt nhất)
                    if (fullPrice > maxFullPrice) {
                        maxFullPrice = fullPrice;
                        expensiveItem = item;
                    }
                });
                
                if (expensiveItem) {
                    // Discount = giá đầy đủ của 1 item (bao gồm size, milk, extra shots)
                    const fullItemPrice = expensiveItem.totalPrice || expensiveItem.price;
                    
                    // CHỈ MIỄN 1 ITEM, không nhân với quantity
                    // Không giới hạn tối đa (khác với Free Coffee)
                    finalDiscount += fullItemPrice;
                }
            }
        }
        // type === 'add-pastry' không giảm giá, chỉ thêm item
    }
    
    // Add discount from promo codes (memberCardDiscount stores percentage like 0.3 for 30%)
    if (memberCardDiscount > 0) {
        finalDiscount += subtotal * memberCardDiscount;
    }
    
    // Add delivery fee if delivery is selected (free for Gold and Diamond tiers)
    let delivery = 0;
    if (isDelivery) {
        delivery = memberBenefits.freeShipping ? 0 : deliveryFee;
    }
    
    const total = Math.max(0, subtotal + tax + delivery - finalDiscount);

    document.getElementById('subtotal').textContent = formatVND(subtotal);
    document.getElementById('tax').textContent = formatVND(tax);
    document.getElementById('discount').textContent = `-${formatVND(finalDiscount)}`;
    
    // Show/hide delivery fee
    const deliveryFeeRow = document.getElementById('deliveryFeeRow');
    if (isDelivery) {
        deliveryFeeRow.style.display = 'flex';
        document.getElementById('deliveryFee').textContent = formatVND(deliveryFee);
    } else {
        deliveryFeeRow.style.display = 'none';
    }
    
    document.getElementById('total').textContent = formatVND(total);
    
    // Display applied reward and member discount
    displayAppliedReward();
    displayMemberDiscount(memberBenefits);
}

// Setup Event Listeners
function setupEventListeners() {
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderMenu(this.dataset.filter);
        });
    });

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Modals
    setupModalListeners();

    // Checkout
    document.getElementById('checkoutBtn').addEventListener('click', function() {
        if (cart.length === 0) {
            showNotification('Your cart is empty!');
            return;
        }
        isDelivery = false;
        openPaymentModal();
    });
    
    // Delivery button
    document.getElementById('deliveryBtn').addEventListener('click', function() {
        if (cart.length === 0) {
            showNotification('Giỏ hàng của bạn đang trống!');
            return;
        }
        isDelivery = true;
        showDeliveryModal();
    });
    // --- BẮT ĐẦU CODE THÔNG BÁO ---
    // Lấy các phần tử HTML cho thông báo
    const notifyButton = document.getElementById('notificationButton');
    const notifyDropdown = document.getElementById('notificationDropdown');

    // Kiểm tra xem các phần tử có tồn tại không (vì nó chỉ có trên index.html)
    if (notifyButton && notifyDropdown) {
        
        // Thêm sự kiện "click" cho nút thông báo (biểu tượng chuông)
        notifyButton.addEventListener('click', function(event) {
            // Ngăn việc click vào nút làm ẩn luôn dropdown (nếu đang mở)
            event.stopPropagation(); 
            
            // Bật/tắt hiển thị dropdown bằng cách thêm/xóa class 'active'
            notifyDropdown.classList.toggle('active');
        });

        // Thêm sự kiện "click" vào bất cứ đâu trên trang
        window.addEventListener('click', function(event) {
            // Nếu dropdown đang hiển thị (có class 'active') VÀ
            // người dùng không click vào bên trong dropdown
            if (notifyDropdown.classList.contains('active') && !notifyDropdown.contains(event.target)) {
                // Thì ẩn dropdown đi
                notifyDropdown.classList.remove('active');
            }
        });
    }
    // --- KẾT THÚC CODE THÔNG BÁO ---
}

// Load and Display Notifications
function loadNotifications() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    if (!currentUser) return;

    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const userNotifications = notifications.filter(n => n.userEmail === currentUser.email);
    
    const notificationList = document.getElementById('notificationList');
    const notificationCount = document.getElementById('notificationCount');
    
    if (!notificationList || !notificationCount) return;

    // Update count
    const unreadCount = userNotifications.filter(n => !n.isRead).length;
    notificationCount.textContent = unreadCount;
    notificationCount.style.display = unreadCount > 0 ? 'block' : 'none';

    // Display notifications
    if (userNotifications.length === 0) {
        notificationList.innerHTML = '<li class="no-notification">Chưa có thông báo nào</li>';
    } else {
        notificationList.innerHTML = userNotifications.map(notif => `
            <li class="notification-item ${notif.isRead ? 'read' : 'unread'}" onclick="handleNotificationClick('${notif.id}')">
                <div class="notification-content">
                    <h4>${notif.title}</h4>
                    <p>${notif.message}</p>
                    ${notif.type === 'promotion' && notif.code ? `
                        <button class="use-code-btn" onclick="event.stopPropagation(); applyDiscountCode('${notif.code}', ${notif.discount})">
                            <i class="fas fa-tag"></i> Sử dụng mã
                        </button>
                    ` : ''}
                    <span class="notification-time">${formatNotificationTime(notif.createdAt)}</span>
                </div>
            </li>
        `).join('');
    }
}

// Handle notification click
function handleNotificationClick(notifId) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notifIndex = notifications.findIndex(n => n.id === notifId);
    
    if (notifIndex !== -1 && !notifications[notifIndex].isRead) {
        notifications[notifIndex].isRead = true;
        localStorage.setItem('notifications', JSON.stringify(notifications));
        loadNotifications();
    }
}

// Apply discount code from notification
function applyDiscountCode(code, discountPercent) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notifIndex = notifications.findIndex(n => n.code === code);
    
    if (notifIndex === -1) return;
    
    const notif = notifications[notifIndex];
    
    // Check if code is expired
    if (new Date(notif.expiryDate) < new Date()) {
        showNotification('Mã giảm giá đã hết hạn!');
        return;
    }
    
    // Apply discount (store as percentage for calculation later)
    memberCardDiscount = discountPercent;
    updateOrderSummary();
    
    // Mark as read and remove the notification
    notifications[notifIndex].isRead = true;
    notifications.splice(notifIndex, 1);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Reload notifications to update UI
    loadNotifications();
    
    // Close notification dropdown
    const notifyDropdown = document.getElementById('notificationDropdown');
    if (notifyDropdown) {
        notifyDropdown.classList.remove('active');
    }
    
    showNotification(`Đã áp dụng mã giảm giá ${code} - Giảm ${(discountPercent * 100)}%!`);
}

// Format notification time
function formatNotificationTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
    if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
    if (diff < 604800) return Math.floor(diff / 86400) + ' ngày trước';
    return date.toLocaleDateString('vi-VN');
}

// Load Available Discount Codes
function loadAvailableDiscountCodes() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    if (!currentUser) return;

    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const userDiscounts = notifications.filter(n => 
        n.userEmail === currentUser.email && 
        n.type === 'promotion' && 
        n.code
    );
    
    const discountCodesContainer = document.getElementById('availableDiscountCodes');
    if (!discountCodesContainer) return;

    if (userDiscounts.length === 0) {
        discountCodesContainer.innerHTML = '<div class="no-discount-codes">Hiện không có mã giảm giá khả dụng</div>';
        return;
    }

    discountCodesContainer.innerHTML = userDiscounts.map(discount => {
        const expiryDate = new Date(discount.expiryDate);
        const isExpired = expiryDate < new Date();
        const isApplied = appliedDiscount === discount.discount;
        
        return `
            <div class="discount-code-item ${isExpired ? 'expired' : ''} ${isApplied ? 'applied' : ''}" 
                 onclick="${isExpired ? '' : `applyDiscountCodeFromModal('${discount.code}', ${discount.discount})`}">
                <div class="discount-code-info">
                    <div class="discount-code-name">
                        <i class="fas fa-tag"></i>
                        ${discount.code}
                        ${isApplied ? '<i class="fas fa-check-circle" style="color: #4caf50;"></i>' : ''}
                    </div>
                    <div class="discount-code-description">
                        Giảm ${(discount.discount * 100)}% cho đơn hàng
                    </div>
                    <div class="discount-code-expiry ${isExpired ? 'expired' : ''}">
                        ${isExpired ? 'Đã hết hạn' : 'Hết hạn: ' + expiryDate.toLocaleDateString('vi-VN')}
                    </div>
                </div>
                <button class="apply-code-btn ${isApplied ? 'applied' : ''}" 
                        onclick="event.stopPropagation(); ${isExpired ? '' : `applyDiscountCodeFromModal('${discount.code}', ${discount.discount})`}"
                        ${isExpired ? 'disabled' : ''}>
                    ${isApplied ? '<i class="fas fa-check"></i> Đã áp dụng' : '<i class="fas fa-tag"></i> Áp dụng'}
                </button>
            </div>
        `;
    }).join('');
}

// Apply discount code from modal
function applyDiscountCodeFromModal(code, discountPercent) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notifIndex = notifications.findIndex(n => n.code === code);
    
    if (notifIndex === -1) return;
    
    const notif = notifications[notifIndex];
    
    // Check if code is expired
    if (new Date(notif.expiryDate) < new Date()) {
        showNotification('Mã giảm giá đã hết hạn!');
        return;
    }
    
    // Apply discount (store as percentage like 0.3 for 30%)
    memberCardDiscount = discountPercent;
    updateOrderSummary();
    
    // Update payment modal total
    const newTotal = parseFloat(document.getElementById('total').textContent.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.]/g, ''));
    document.getElementById('paymentTotal').textContent = formatVND(newTotal);
    
    // Mark as read and remove the notification
    notifications[notifIndex].isRead = true;
    notifications.splice(notifIndex, 1);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Reload notifications and discount codes to update UI
    loadNotifications();
    loadAvailableDiscountCodes();
    
    showNotification(`Đã áp dụng mã giảm giá ${code} - Giảm ${(discountPercent * 100)}%!`);
}

// Setup Modal Listeners
function setupModalListeners() {
    const paymentModal = document.getElementById('paymentModal');

    // Close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Click outside to close
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Payment Form
    document.getElementById('paymentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handlePayment();
    });

    // Payment Methods
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function() {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            
            const cardDetails = document.getElementById('cardDetails');
            if (this.dataset.method === 'card') {
                cardDetails.style.display = 'block';
            } else {
                cardDetails.style.display = 'none';
            }
        });
    });

    // Order Detail Form
    document.getElementById('orderDetailForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleOrderDetailSubmit();
    });

    // Order Detail options change
    document.querySelectorAll('#orderDetailForm input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', updateDetailTotal);
    });
}

// Load User Data
function loadUserData() {
    const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        userPoints = currentUser.points || 0;
        document.getElementById('userPoints').textContent = userPoints;
        
        const signInBtn = document.getElementById('signInBtn');
        const firstName = currentUser.name.split(' ')[0];
        signInBtn.innerHTML = `
            <div class="user-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <span>${firstName}</span>
        `;
        signInBtn.href = '#';
        
        // Remove old event listeners by cloning
        const newSignInBtn = signInBtn.cloneNode(true);
        signInBtn.parentNode.replaceChild(newSignInBtn, signInBtn);
        
        // Add new event listener
        newSignInBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showUserMenu(e);
        });
    }
}

// Load Cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCart();
        } catch (error) {
            console.error('Error loading cart:', error);
            cart = [];
            localStorage.removeItem('cart');
        }
    }
}

// Check Login Status
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    console.log('Checking login status:', savedUser);
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        userPoints = currentUser.points || 0;
        document.getElementById('userPoints').textContent = userPoints;
        
        const signInBtn = document.getElementById('signInBtn');
        console.log('User logged in:', currentUser.name);
        
        // Update button to show user avatar/name
        const firstName = currentUser.name.split(' ')[0];
        signInBtn.innerHTML = `
            <div class="user-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <span>${firstName}</span>
        `;
        signInBtn.href = '#';
        
        // Remove old event listeners by cloning
        const newSignInBtn = signInBtn.cloneNode(true);
        signInBtn.parentNode.replaceChild(newSignInBtn, signInBtn);
        
        // Add new event listener
        newSignInBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showUserMenu(e);
        });

        // Restore cart if user came from checkout redirect
        restorePendingCart();
    } else {
        console.log('No user logged in');
    }
}

// Restore Pending Cart after Login
function restorePendingCart() {
    const pendingCart = sessionStorage.getItem('pendingCart');
    const pendingCheckout = sessionStorage.getItem('pendingCheckout');
    
    if (pendingCart && pendingCheckout === 'true') {
        // Restore cart
        cart = JSON.parse(pendingCart);
        updateCart();
        
        // Clear pending data
        sessionStorage.removeItem('pendingCart');
        sessionStorage.removeItem('pendingCheckout');
        
        // Show notification
        showNotification('Đơn hàng của bạn đã được khôi phục! Bạn có thể tiếp tục thanh toán.');
        
        // Scroll to cart section
        document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
        
        // Auto open payment modal after a short delay
        setTimeout(() => {
            const total = parseFloat(document.getElementById('total').textContent.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.]/g, ''));
            if (total > 0) {
                const paymentModal = document.getElementById('paymentModal');
                document.getElementById('paymentTotal').textContent = formatVND(total);
                
                // Update shop status warning for pickup orders
                if (typeof updatePaymentShopStatusWarning === 'function') {
                    updatePaymentShopStatusWarning();
                }
                
                paymentModal.style.display = 'block';
            }
        }, 1000);
    }
}

// Show User Menu
function showUserMenu(event) {
    // Get button position for dropdown placement
    const signInBtn = document.getElementById('signInBtn');
    const rect = signInBtn.getBoundingClientRect();
    
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
                <a href="pages/profile.html" class="user-menu-item">
                    <i class="fas fa-user"></i>
                    <span>Thông tin khách hàng</span>
                    <i class="fas fa-chevron-right"></i>
                </a>
                <a href="#rewards" class="user-menu-item" onclick="document.querySelector('.user-menu-overlay').remove()">
                    <i class="fas fa-gift"></i>
                    <span>Điểm thưởng</span>
                    <i class="fas fa-chevron-right"></i>
                </a>
                <a href="pages/membercard.html" class="user-menu-item">
                    <i class="fas fa-id-card"></i>
                    <span>Thẻ thành viên</span>
                    <i class="fas fa-chevron-right"></i>
                </a>
                <div class="user-menu-divider"></div>
                <a href="#" onclick="logoutUser(event)" class="user-menu-item user-menu-logout">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Đăng xuất</span>
                </a>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', menu);
    
    // Animate dropdown
    setTimeout(() => {
        document.querySelector('.user-menu-dropdown').style.opacity = '1';
        document.querySelector('.user-menu-dropdown').style.transform = 'translateY(0)';
    }, 10);
}

// Logout User
function logoutUser(event) {
    if (event) event.preventDefault();
    showLogoutModal();
}

function showLogoutModal() {
    const modal = document.createElement('div');
    modal.id = 'logoutModal';
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
    
    // Close on outside click
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeLogoutModal();
        }
    };
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) modal.remove();
}

function confirmLogout() {
    closeLogoutModal();
    
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    userPoints = 0;
    
    // Reset sign in button
    const signInBtn = document.getElementById('signInBtn');
    signInBtn.innerHTML = `
        <i class="fas fa-user"></i>
        <span>Sign In</span>
    `;
    signInBtn.href = 'admin/login.html';
    
    // Remove old event listeners by cloning
    const newSignInBtn = signInBtn.cloneNode(true);
    signInBtn.parentNode.replaceChild(newSignInBtn, signInBtn);
    
    document.getElementById('userPoints').textContent = '0';
    showNotification('Đã đăng xuất thành công!');
    
    // Clear cart and rewards
    cart = [];
    appliedDiscount = 0;
    appliedReward = null;
    updateCart();
    renderRewards();
    
    // Remove menu
    const menuOverlay = document.querySelector('.user-menu-overlay');
    if (menuOverlay) menuOverlay.remove();
}

// Open Payment Modal
function openPaymentModal() {
    // Check if cart is empty
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }

    // Check if user is guest
    if (!currentUser) {
        showGuestWarningModal();
        return;
    }

    const paymentModal = document.getElementById('paymentModal');
    const total = parseFloat(document.getElementById('total').textContent.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.]/g, ''));
    document.getElementById('paymentTotal').textContent = formatVND(total);
    loadAvailableDiscountCodes();
    
    // Update shop status warning for pickup orders
    if (typeof updatePaymentShopStatusWarning === 'function') {
        updatePaymentShopStatusWarning();
    }
    
    paymentModal.style.display = 'block';
}

// Show Guest Warning Modal
function showGuestWarningModal() {
    const modalHTML = `
        <div id="guestWarningModal" class="modal" style="display: block;">
            <div class="modal-content" style="max-width: 500px;">
                <span class="close" onclick="closeGuestWarningModal()">&times;</span>
                <div style="text-align: center; padding: 1rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff9800; margin-bottom: 1rem;"></i>
                    <h2 style="color: var(--primary-color); margin-bottom: 1rem;">Thông báo</h2>
                    <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 1.5rem; color: #333;">
                        Bạn đang thanh toán với tư cách <strong>khách</strong>.<br>
                        Nếu không đăng nhập, bạn sẽ <strong style="color: #d32f2f;">KHÔNG nhận được</strong>:
                    </p>
                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1rem; margin-bottom: 1.5rem; text-align: left;">
                        <ul style="margin: 0; padding-left: 1.5rem;">
                            <li style="margin-bottom: 0.5rem;"><i class="fas fa-times-circle" style="color: #d32f2f;"></i> Điểm thưởng (Points)</li>
                            <li style="margin-bottom: 0.5rem;"><i class="fas fa-times-circle" style="color: #d32f2f;"></i> Ưu đãi & giảm giá từ Rewards</li>
                            <li style="margin-bottom: 0.5rem;"><i class="fas fa-times-circle" style="color: #d32f2f;"></i> Lịch sử đơn hàng</li>
                            <li><i class="fas fa-times-circle" style="color: #d32f2f;"></i> Các ưu đãi đặc biệt</li>
                        </ul>
                    </div>
                    <p style="font-size: 1rem; margin-bottom: 1.5rem; color: #666;">
                        <i class="fas fa-info-circle"></i> Đơn hàng của bạn sẽ được lưu lại nếu bạn chọn đăng nhập!
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button onclick="redirectToLoginWithCart()" class="btn-primary" style="flex: 1; max-width: 200px;">
                            <i class="fas fa-sign-in-alt"></i> Đăng nhập ngay
                        </button>
                        <button onclick="continueAsGuest()" class="btn-secondary" style="flex: 1; max-width: 200px; background: #666;">
                            <i class="fas fa-shopping-cart"></i> Tiếp tục thanh toán
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close Guest Warning Modal
function closeGuestWarningModal() {
    const modal = document.getElementById('guestWarningModal');
    if (modal) {
        modal.remove();
    }
}

// Redirect to Login and Save Cart
function redirectToLoginWithCart() {
    // Save current cart to sessionStorage
    sessionStorage.setItem('pendingCart', JSON.stringify(cart));
    sessionStorage.setItem('pendingCheckout', 'true');
    
    // Close modal
    closeGuestWarningModal();
    
    // Redirect to login page
    window.location.href = 'admin/login.html?redirect=checkout';
}

// Continue as Guest
function continueAsGuest() {
    closeGuestWarningModal();
    
    // Show guest info modal to collect contact information
    showGuestInfoModal();
}

// Guest Information Modal
let guestInfo = null;

function showGuestInfoModal() {
    const modal = document.getElementById('guestInfoModal');
    modal.style.display = 'block';
    
    // Handle form submission
    const form = document.getElementById('guestInfoForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const name = document.getElementById('guestName').value.trim();
        const phone = document.getElementById('guestPhone').value.trim();
        
        // Validate required fields
        if (!name || !phone) {
            showNotification('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        
        // Validate phone number
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone)) {
            showNotification('Số điện thoại không hợp lệ! Vui lòng nhập 10-11 chữ số.');
            return;
        }
        
        // Store guest information
        guestInfo = {
            name: name,
            phone: phone
        };
        
        closeGuestInfoModal();
        
        // Continue to delivery or payment based on isDelivery flag
        if (isDelivery) {
            showDeliveryModal();
        } else {
            openPaymentModalAfterGuestInfo();
        }
    };
}

function closeGuestInfoModal() {
    const modal = document.getElementById('guestInfoModal');
    modal.style.display = 'none';
    
    // Reset form
    document.getElementById('guestInfoForm').reset();
}

// Delivery Modal
function showDeliveryModal() {
    // If not logged in and no guest info, collect guest info first
    if (!currentUser && !guestInfo) {
        showGuestInfoModal();
        return;
    }
    
    const modal = document.getElementById('deliveryModal');
    modal.style.display = 'block';
    
    // Set minimum delivery time (15 minutes from now)
    const deliveryTimeInput = document.getElementById('deliveryTime');
    const now = new Date();
    const minTime = new Date(now.getTime() + 15 * 60000); // Add 15 minutes
    deliveryTimeInput.min = minTime.toISOString().slice(0, 16);
    deliveryTimeInput.value = minTime.toISOString().slice(0, 16);
    
    // Handle form submission
    const form = document.getElementById('deliveryForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const address = document.getElementById('deliveryAddress').value.trim();
        const deliveryTime = document.getElementById('deliveryTime').value;
        const note = document.getElementById('deliveryNote').value.trim();
        
        if (!address) {
            showNotification('Vui lòng nhập địa chỉ giao hàng!');
            return;
        }
        
        if (!deliveryTime) {
            showNotification('Vui lòng chọn thời gian giao hàng!');
            return;
        }
        
        // Validate delivery time (must be at least 15 minutes from now)
        const selectedTime = new Date(deliveryTime);
        const currentTime = new Date();
        const minDeliveryTime = new Date(currentTime.getTime() + 15 * 60000);
        
        if (selectedTime < minDeliveryTime) {
            showNotification('Thời gian giao hàng phải ít nhất 15 phút kể từ bây giờ!');
            return;
        }
        
        // Store delivery information
        deliveryInfo = {
            address: address,
            deliveryTime: deliveryTime,
            note: note
        };
        
        closeDeliveryModal();
        
        // Update order summary to show delivery fee
        updateOrderSummary();
        
        // Open payment modal
        openPaymentModalWithDelivery();
    };
}

function closeDeliveryModal() {
    const modal = document.getElementById('deliveryModal');
    modal.style.display = 'none';
    
    // Reset form
    document.getElementById('deliveryForm').reset();
}

function openPaymentModalAfterGuestInfo() {
    const paymentModal = document.getElementById('paymentModal');
    const total = parseFloat(document.getElementById('total').textContent.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.]/g, ''));
    document.getElementById('paymentTotal').textContent = formatVND(total);
    loadAvailableDiscountCodes();
    
    // Update shop status warning for pickup orders
    if (typeof updatePaymentShopStatusWarning === 'function') {
        updatePaymentShopStatusWarning();
    }
    
    paymentModal.style.display = 'block';
}

function openPaymentModalWithDelivery() {
    const paymentModal = document.getElementById('paymentModal');
    const total = parseFloat(document.getElementById('total').textContent.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.]/g, ''));
    document.getElementById('paymentTotal').textContent = formatVND(total);
    loadAvailableDiscountCodes();
    
    // Update shop status warning for pickup orders
    if (typeof updatePaymentShopStatusWarning === 'function') {
        updatePaymentShopStatusWarning();
    }
    
    paymentModal.style.display = 'block';
}

// Handle Payment
function handlePayment() {
    const paymentMethod = document.querySelector('.payment-method.active').dataset.method;
    
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiry = document.getElementById('expiry').value;
        const cvv = document.getElementById('cvv').value;

        if (!cardNumber || !expiry || !cvv) {
            showNotification('Please fill in all card details!');
            return;
        }
    }

    // Check if this is a group order payment
    const pendingGroupOrder = typeof completeGroupOrderPayment !== 'undefined' ? completeGroupOrderPayment() : null;
    
    let subtotal, tax, discount, delivery, total, cart_items, pointsEarned;
    let isGroupOrder = false;
    
    if (pendingGroupOrder) {
        // Group order payment
        isGroupOrder = true;
        subtotal = pendingGroupOrder.subtotal;
        tax = pendingGroupOrder.tax;
        discount = 0;
        delivery = 0;
        total = pendingGroupOrder.total;
        cart_items = pendingGroupOrder.orders;
        
        // Points earned by host
        const memberBenefits = getMemberTierBenefits();
        const basePoints = Math.floor(total / 10000);
        pointsEarned = basePoints * memberBenefits.pointMultiplier;
    } else {
        // Regular payment - Parse Vietnamese formatted numbers (e.g., "979.687,5₫" becomes 979687.5)
        subtotal = parseFloat(document.getElementById('subtotal').textContent.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.]/g, ''));
        tax = parseFloat(document.getElementById('tax').textContent.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.]/g, ''));
        discount = parseFloat(document.getElementById('discount').textContent.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.]/g, ''));
        delivery = isDelivery ? deliveryFee : 0;
        total = parseFloat(document.getElementById('total').textContent.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.]/g, ''));
        cart_items = JSON.parse(JSON.stringify(cart));
        
        // Apply member tier point multiplier
        const memberBenefits = getMemberTierBenefits();
        const basePoints = Math.floor(total / 10000);
        pointsEarned = basePoints * memberBenefits.pointMultiplier;
    }

    // Create order object for admin
    const order = {
        id: 'ORD' + Date.now(),
        customerName: currentUser ? currentUser.name : (guestInfo ? guestInfo.name : 'Guest'),
        customerEmail: currentUser ? currentUser.email : 'guest@example.com',
        items: cart_items,
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        deliveryFee: delivery,
        isDelivery: isDelivery,
        total: total,
        status: 'pending',
        date: new Date().toISOString(),
        paymentMethod: paymentMethod,
        isGroupOrder: isGroupOrder
    };
    
    // Add group order info if applicable
    if (isGroupOrder && pendingGroupOrder) {
        order.groupOrderInfo = {
            roomCode: pendingGroupOrder.roomCode,
            roomName: pendingGroupOrder.roomName,
            participants: pendingGroupOrder.participants
        };
    }
    
    // Add guest information to order if not logged in
    if (!currentUser && guestInfo) {
        order.guestInfo = {
            name: guestInfo.name,
            phone: guestInfo.phone
        };
        order.isGuest = true;
    }
    
    // Add delivery information if delivery is selected
    if (isDelivery && deliveryInfo) {
        order.deliveryInfo = {
            address: deliveryInfo.address,
            deliveryTime: deliveryInfo.deliveryTime,
            note: deliveryInfo.note
        };
        order.expectedDeliveryTime = deliveryInfo.deliveryTime;
    }

    // Get shop status message BEFORE saving the order (for pickup orders only)
    const shopStatusMsg = !isDelivery && typeof getShopStatusMessage === 'function' 
        ? getShopStatusMessage() 
        : '';

    // Save order to orders list (for admin dashboard)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Dispatch event for shop status update
    window.dispatchEvent(new CustomEvent('orderPlaced'));

    // Save order to user orders (for profile page)
    const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const userOrder = {
        ...order,
        userEmail: currentUser ? currentUser.email : 'guest@example.com',
        status: 'completed' // Mark as completed for user view
    };
    userOrders.push(userOrder);
    localStorage.setItem('userOrders', JSON.stringify(userOrders));

    if (currentUser) {
        userPoints += pointsEarned;
        currentUser.points = userPoints;
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex].points = userPoints;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Update in both localStorage and sessionStorage
        if (localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        document.getElementById('userPoints').textContent = userPoints;
    }

    // Clear cart, rewards, guest info, and delivery info
    const wasDelivery = isDelivery; // Save delivery status for notification
    cart = [];
    appliedDiscount = 0;
    appliedReward = null;
    memberCardDiscount = 0;
    guestInfo = null; // Clear guest information
    deliveryInfo = null; // Clear delivery information
    isDelivery = false; // Reset delivery flag
    updateCart();
    renderRewards(); // Re-render rewards to reset the UI
    
    // Update member card to reflect new spending
    if (currentUser) {
        updateMemberCardCompact();
    }

    document.getElementById('paymentModal').style.display = 'none';
    
    // Show appropriate success message
    if (currentUser) {
        const multiplierText = memberBenefits.pointMultiplier > 1 ? ` (x${memberBenefits.pointMultiplier})` : '';
        if (wasDelivery) {
            showNotification(`Thanh toán thành công! Đơn hàng ${order.id} đã được tạo. Chúng tôi sẽ giao hàng sớm. Bạn nhận được ${pointsEarned} điểm${multiplierText}!`);
        } else {
            showNotification(`Thanh toán thành công! Đơn hàng ${order.id} đã được tạo. Vui lòng đến quán nhận hàng.${shopStatusMsg} Bạn nhận được ${pointsEarned} điểm${multiplierText}!`);
        }
    } else {
        if (wasDelivery) {
            showNotification(`Thanh toán thành công! Đơn hàng ${order.id} đã được tạo. Chúng tôi sẽ giao hàng và liên hệ với bạn sớm!`);
        } else {
            showNotification(`Thanh toán thành công! Đơn hàng ${order.id} đã được tạo. Vui lòng đến quán nhận hàng!${shopStatusMsg}`);
        }
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render Rewards
function renderRewards() {
    // Update points display
    const pointsDisplay = document.querySelector('.points-display .points');
    if (pointsDisplay) {
        pointsDisplay.textContent = userPoints;
    }
    
    const rewardItems = document.getElementById('rewardItems');
    rewardItems.innerHTML = rewardsData.map(reward => {
        const isApplied = appliedReward && appliedReward.id === reward.id;
        const canRedeem = userPoints >= reward.points && !isApplied;
        const buttonText = isApplied ? 'Applied ✓' : 'Redeem';
        const buttonClass = isApplied ? 'redeem-btn applied' : 'redeem-btn';
        
        return `
            <div class="reward-item ${isApplied ? 'reward-applied' : ''}">
                <div class="reward-info">
                    <h4>${reward.name}</h4>
                    <p style="font-size: 0.85rem; color: #666; margin: 0.25rem 0;">${reward.description}</p>
                    <span class="reward-points">${reward.points} points</span>
                    ${isApplied ? '<span class="reward-badge">Applied</span>' : ''}
                </div>
                <button class="${buttonClass}" 
                    onclick="${isApplied ? `removeReward(${reward.id})` : `redeemReward(${reward.id})`}" 
                    ${!canRedeem && !isApplied ? 'disabled' : ''}>
                    ${isApplied ? '<i class="fas fa-times"></i> Remove' : '<i class="fas fa-check"></i> ' + buttonText}
                </button>
            </div>
        `;
    }).join('');
}

// Redeem Reward
function redeemReward(rewardId) {
    if (!currentUser) {
        showNotification('Please sign in to redeem rewards!');
        window.location.href = 'admin/login.html';
        return;
    }

    if (cart.length === 0) {
        showNotification('Please add items to cart first!');
        return;
    }

    // Remove previous reward if any
    if (appliedReward) {
        userPoints += appliedReward.points;
    }

    const reward = rewardsData.find(r => r.id === rewardId);
    
    if (userPoints >= reward.points) {
        userPoints -= reward.points;
        appliedReward = reward;
        
        // Nếu là Free Pastry, tự động thêm pastry vào cart
        if (reward.type === 'add-pastry') {
            const pastryItem = menuItems.find(item => item.category === 'pastry');
            if (pastryItem) {
                cart.push({
                    ...pastryItem,
                    quantity: 1,
                    totalPrice: 0, // Miễn phí
                    price: 0,
                    isFreeReward: true,
                    rewardNote: 'Được tặng từ reward Free Pastry'
                });
                updateCart();
            }
        }
        
        if (currentUser) {
            currentUser.points = userPoints;
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.email === currentUser.email);
            if (userIndex !== -1) {
                users[userIndex].points = userPoints;
                localStorage.setItem('users', JSON.stringify(users));
            }
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        document.getElementById('userPoints').textContent = userPoints;
        updateOrderSummary();
        renderRewards();
        showNotification(`${reward.name} applied successfully!`);
    } else {
        showNotification('Not enough points!');
    }
}

// Remove Reward
function removeReward(rewardId) {
    if (appliedReward && appliedReward.id === rewardId) {
        // Nếu là Free Pastry, xóa pastry miễn phí khỏi cart
        if (appliedReward.type === 'add-pastry') {
            cart = cart.filter(item => !item.isFreeReward);
            updateCart();
        }
        
        userPoints += appliedReward.points;
        appliedReward = null;
        
        if (currentUser) {
            currentUser.points = userPoints;
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.email === currentUser.email);
            if (userIndex !== -1) {
                users[userIndex].points = userPoints;
                localStorage.setItem('users', JSON.stringify(users));
            }
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        document.getElementById('userPoints').textContent = userPoints;
        updateOrderSummary();
        renderRewards();
        showNotification('Reward removed!');
    }
}

// Display Applied Reward in Order Summary
function displayAppliedReward() {
    const discountElement = document.getElementById('discount');
    const discountContainer = discountElement.parentElement;
    
    // Remove previous reward display if exists
    const existingRewardDisplay = document.querySelector('.applied-reward-info');
    if (existingRewardDisplay) {
        existingRewardDisplay.remove();
    }
    
    if (appliedReward) {
        const rewardInfo = document.createElement('div');
        rewardInfo.className = 'applied-reward-info';
        rewardInfo.innerHTML = `
            <div style="background: #e8f5e9; padding: 0.75rem; border-radius: 8px; margin-top: 0.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #2e7d32; font-weight: 600;">
                        <i class="fas fa-gift"></i> ${appliedReward.name}
                    </span>
                    <span style="color: #2e7d32; font-weight: bold;">
                        -${appliedReward.points} pts
                    </span>
                </div>
            </div>
        `;
        discountContainer.insertAdjacentElement('afterend', rewardInfo);
    }
}

// Display Member Discount
function displayMemberDiscount(memberBenefits) {
    // Remove existing member discount info
    const existingMemberInfo = document.querySelector('.member-discount-info');
    if (existingMemberInfo) {
        existingMemberInfo.remove();
    }
    
    if (memberBenefits.tier !== 'none') {
        const totalContainer = document.querySelector('.summary-total');
        if (!totalContainer) return;
        
        let benefitsHTML = '';
        
        // Discount benefit (all tiers)
        if (memberBenefits.discount && memberBenefits.discount > 0) {
            const discountAmount = cart.reduce((sum, item) => {
                const price = item.totalPrice || item.price;
                return sum + (price * item.quantity);
            }, 0) * memberBenefits.discount;
            benefitsHTML += `
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <i class="fas fa-percent" style="color: var(--accent-color);"></i>
                    <span style="color: var(--primary-color); font-weight: 600;">Giảm ${(memberBenefits.discount * 100)}%: -${formatVND(discountAmount)}</span>
                </div>
            `;
        }
        
        // Point multiplier benefit
        if (memberBenefits.pointMultiplier > 1) {
            const multiplierText = memberBenefits.pointMultiplier % 1 === 0 
                ? memberBenefits.pointMultiplier 
                : memberBenefits.pointMultiplier.toFixed(1);
            benefitsHTML += `
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <i class="fas fa-star" style="color: #ffd700;"></i>
                    <span style="color: var(--primary-color); font-weight: 600;">Tích điểm x${multiplierText}</span>
                </div>
            `;
        }
        
        // Free shipping benefit
        if (memberBenefits.freeShipping && isDelivery) {
            benefitsHTML += `
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <i class="fas fa-shipping-fast" style="color: #4caf50;"></i>
                    <span style="color: #4caf50; font-weight: 600;">Miễn phí giao hàng</span>
                </div>
            `;
        }
        
        // Birthday bonus
        if (memberBenefits.birthdayBonus > 0) {
            benefitsHTML += `
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <i class="fas fa-birthday-cake" style="color: #ff69b4;"></i>
                    <span style="color: #666; font-size: 0.9rem;">Sinh nhật tặng ${memberBenefits.birthdayBonus} điểm</span>
                </div>
            `;
        }
        
        // Priority support
        if (memberBenefits.prioritySupport) {
            benefitsHTML += `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-headset" style="color: #2196f3;"></i>
                    <span style="color: #666; font-size: 0.9rem;">Hỗ trợ ưu tiên</span>
                </div>
            `;
        }
        
        if (benefitsHTML) {
            const memberInfo = document.createElement('div');
            memberInfo.className = 'member-discount-info';
            memberInfo.innerHTML = `
                <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); padding: 1rem; border-radius: 12px; margin-top: 1rem; border-left: 4px solid var(--accent-color);">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem;">
                        <i class="fas fa-gem" style="color: var(--accent-color); font-size: 1.2rem;"></i>
                        <strong style="color: var(--primary-color); font-size: 1.1rem;">${memberBenefits.tierName}</strong>
                    </div>
                    ${benefitsHTML}
                </div>
            `;
            totalContainer.insertAdjacentElement('afterend', memberInfo);
        }
    }
}

// Update Member Card Compact (in rewards section)
function updateMemberCardCompact() {
    const memberCardBg = document.querySelector('.member-card-bg-compact');
    const memberName = document.getElementById('memberNameCompact');
    const memberTier = document.getElementById('memberTierCompact');
    const totalSpendingEl = document.getElementById('totalSpendingCompact');
    const memberPoints = document.getElementById('memberPointsCompact');
    const progressFill = document.getElementById('progressFillCompact');
    const progressText = document.getElementById('progressTextCompact');
    const cardIcon = document.querySelector('.card-icon-compact');
    
    if (!memberCardBg) return;
    
    if (currentUser) {
        // Calculate total spending from user orders
        const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        const userOrdersList = userOrders.filter(order => order.userEmail === currentUser.email);
        const totalSpending = userOrdersList.reduce((sum, order) => sum + order.total, 0);
        
        // Determine tier based on spending
        let tier = 'none';
        let tierName = 'Chưa có thẻ';
        let nextTier = 'Thẻ Bạc';
        let nextTierAmount = 500000;
        let progress = 0;
        let iconClass = 'fa-user-circle';
        
        if (totalSpending >= 10000000) {
            tier = 'diamond';
            tierName = 'Thẻ Kim Cương';
            nextTier = 'Thẻ Kim Cương (Đã đạt)';
            nextTierAmount = 10000000;
            progress = 100;
            iconClass = 'fa-gem';
        } else if (totalSpending >= 3000000) {
            tier = 'gold';
            tierName = 'Thẻ Vàng';
            nextTier = 'Thẻ Kim Cương';
            nextTierAmount = 10000000;
            progress = (totalSpending / nextTierAmount) * 100;
            iconClass = 'fa-crown';
        } else if (totalSpending >= 500000) {
            tier = 'silver';
            tierName = 'Thẻ Bạc';
            nextTier = 'Thẻ Vàng';
            nextTierAmount = 3000000;
            progress = (totalSpending / nextTierAmount) * 100;
            iconClass = 'fa-medal';
        } else {
            progress = (totalSpending / nextTierAmount) * 100;
            iconClass = 'fa-user-circle';
        }
        
        // Update card display
        memberName.textContent = currentUser.name;
        memberTier.textContent = tierName;
        totalSpendingEl.textContent = formatVND(totalSpending);
        memberPoints.textContent = userPoints;
        progressFill.style.width = progress + '%';
        if (cardIcon) {
            cardIcon.className = 'fas ' + iconClass + ' card-icon-compact';
        }
        
        if (tier === 'none') {
            progressText.textContent = `Còn ${formatVND(nextTierAmount - totalSpending)} để đạt ${nextTier}`;
        } else if (progress < 100) {
            progressText.textContent = `Còn ${formatVND(nextTierAmount - totalSpending)} để đạt ${nextTier}`;
        } else {
            progressText.textContent = 'Bạn đã đạt cấp thẻ cao nhất!';
        }
        
        // Update card background based on tier
        memberCardBg.setAttribute('data-tier', tier);
    } else {
        memberName.textContent = 'Guest';
        memberTier.textContent = 'Chưa có thẻ';
        totalSpendingEl.textContent = '0₫';
        memberPoints.textContent = '0';
        progressFill.style.width = '0%';
        progressText.textContent = 'Đăng nhập để xem tiến độ';
        if (cardIcon) {
            cardIcon.className = 'fas fa-user-circle card-icon-compact';
        }
        memberCardBg.removeAttribute('data-tier');
    }
}

// Update Member Card
function updateMemberCard() {
    const memberCardBg = document.querySelector('.member-card-bg');
    const memberName = document.getElementById('memberName');
    const memberTier = document.getElementById('memberTier');
    const totalSpendingEl = document.getElementById('totalSpending');
    const memberPoints = document.getElementById('memberPoints');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (!memberCardBg) return;
    
    if (currentUser) {
        // Calculate total spending from user orders
        const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        const userOrdersList = userOrders.filter(order => order.userEmail === currentUser.email);
        const totalSpending = userOrdersList.reduce((sum, order) => sum + order.total, 0);
        
        // Determine tier based on spending
        let tier = 'none';
        let tierName = 'Chưa có thẻ';
        let nextTier = 'Thẻ Bạc';
        let nextTierAmount = 500000;
        let progress = 0;
        
        if (totalSpending >= 10000000) {
            tier = 'diamond';
            tierName = 'Thẻ Kim Cương';
            nextTier = 'Thẻ Kim Cương (Đã đạt)';
            nextTierAmount = 10000000;
            progress = 100;
        } else if (totalSpending >= 3000000) {
            tier = 'gold';
            tierName = 'Thẻ Vàng';
            nextTier = 'Thẻ Kim Cương';
            nextTierAmount = 10000000;
            progress = (totalSpending / nextTierAmount) * 100;
        } else if (totalSpending >= 500000) {
            tier = 'silver';
            tierName = 'Thẻ Bạc';
            nextTier = 'Thẻ Vàng';
            nextTierAmount = 3000000;
            progress = (totalSpending / nextTierAmount) * 100;
        } else {
            progress = (totalSpending / nextTierAmount) * 100;
        }
        
        // Update card display
        memberName.textContent = currentUser.name;
        memberTier.textContent = tierName;
        totalSpendingEl.textContent = formatVND(totalSpending);
        memberPoints.textContent = userPoints;
        progressFill.style.width = progress + '%';
        
        if (tier === 'none') {
            progressText.textContent = `Còn ${formatVND(nextTierAmount - totalSpending)} để đạt ${nextTier}`;
        } else if (progress < 100) {
            progressText.textContent = `Còn ${formatVND(nextTierAmount - totalSpending)} để đạt ${nextTier}`;
        } else {
            progressText.textContent = 'Bạn đã đạt cấp thẻ cao nhất!';
        }
        
        // Update card background based on tier
        memberCardBg.setAttribute('data-tier', tier);
    } else {
        memberName.textContent = 'Guest';
        memberTier.textContent = 'Chưa có thẻ';
        totalSpendingEl.textContent = '0₫';
        memberPoints.textContent = '0';
        progressFill.style.width = '0%';
        progressText.textContent = 'Đăng nhập để xem tiến độ';
        memberCardBg.removeAttribute('data-tier');
    }
}

// Scroll to Menu
function scrollToMenu() {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
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

// Format Card Number
document.getElementById('cardNumber')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
});

// Format Expiry Date
document.getElementById('expiry')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
});

// Handle Order Detail Submit
function handleOrderDetailSubmit() {
    if (!currentOrderItem) return;
    
    const form = document.getElementById('orderDetailForm');
    const quantity = parseInt(document.getElementById('detailQuantity').textContent);
    
    // Get all customizations
    const customizations = {
        size: form.querySelector('input[name="size"]:checked').value,
        sugar: form.querySelector('input[name="sugar"]:checked').value,
        milk: form.querySelector('input[name="milk"]:checked').value,
        extraShots: parseInt(form.querySelector('input[name="extraShots"]:checked').value),
        notes: document.getElementById('orderNotes').value.trim()
    };
    
    // Add ice only for iced drinks
    if (currentOrderItem.category === 'iced') {
        customizations.ice = form.querySelector('input[name="ice"]:checked').value;
    }
    
    // Calculate total price per item using dynamic options
    let itemPrice = currentOrderItem.price;
    
    // Apply size multiplier
    const sizeInput = form.querySelector('input[name="size"]:checked');
    if (sizeInput) {
        const multiplier = parseFloat(sizeInput.dataset.multiplier || 1.0);
        itemPrice *= multiplier;
    }
    
    // Add milk price
    const milkInput = form.querySelector('input[name="milk"]:checked');
    if (milkInput) {
        const milkPrice = parseFloat(milkInput.dataset.price || 0);
        itemPrice += milkPrice;
    }
    
    // Add extra shots price
    const extraShotsInput = form.querySelector('input[name="extraShots"]:checked');
    if (extraShotsInput) {
        const extraPrice = parseFloat(extraShotsInput.dataset.price || 0);
        itemPrice += extraPrice;
    }
    
    // Add to cart
    const cartItem = {
        ...currentOrderItem,
        quantity: quantity,
        customizations: customizations,
        price: itemPrice, // Price per item for group order
        totalPrice: itemPrice,
        uniqueId: Date.now() // To distinguish items with different customizations
    };
    
    // Always add to personal cart first
    cart.push(cartItem);
    updateCart();
    
    document.getElementById('orderDetailModal').style.display = 'none';
    showNotification(`${currentOrderItem.name} added to cart!`);
    currentOrderItem = null;
}


