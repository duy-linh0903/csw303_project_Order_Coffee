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
            { id: 1, name: 'Espresso', price: 87500, description: 'Rich and bold espresso shot', category: 'hot', image: 'linear-gradient(135deg, #6f4e37, #8B4513)' },
            { id: 2, name: 'Cappuccino', price: 112500, description: 'Espresso with steamed milk foam', category: 'hot', image: 'linear-gradient(135deg, #8B4513, #A0522D)' },
            { id: 3, name: 'Latte', price: 118750, description: 'Smooth espresso with steamed milk', category: 'hot', image: 'linear-gradient(135deg, #A0522D, #CD853F)' },
            { id: 4, name: 'Americano', price: 93750, description: 'Espresso with hot water', category: 'hot', image: 'linear-gradient(135deg, #6f4e37, #654321)' },
            { id: 5, name: 'Iced Coffee', price: 100000, description: 'Cold brewed coffee over ice', category: 'iced', image: 'linear-gradient(135deg, #4A90E2, #5AA5E2)' },
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

// Rewards Data
const rewardsData = [
    { id: 1, name: 'Free Coffee', points: 100, discount: 125000 },
    { id: 2, name: 'Free Pastry', points: 75, discount: 87500 },
    { id: 3, name: '10% Off', points: 50, discount: 0 },
    { id: 4, name: 'Free Upgrade', points: 150, discount: 50000 }
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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeMenuItems();
    renderMenu('all');
    setupEventListeners();
    loadUserData();
    renderRewards();
    checkLoginStatus();
});

// Render Menu
function renderMenu(filter) {
    const menuGrid = document.getElementById('menuGrid');
    menuGrid.innerHTML = '';

    const filteredItems = filter === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === filter);

    filteredItems.forEach(item => {
        const menuItemEl = document.createElement('div');
        menuItemEl.className = 'menu-item';
        menuItemEl.innerHTML = `
            <div class="menu-item-image" style="background: ${item.image}"></div>
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
function openOrderDetail(itemId) {
    currentOrderItem = menuItems.find(i => i.id === itemId);
    
    document.getElementById('orderDetailTitle').textContent = `Customize Your ${currentOrderItem.name}`;
    document.getElementById('detailImage').style.background = currentOrderItem.image;
    document.getElementById('detailName').textContent = currentOrderItem.name;
    document.getElementById('detailDescription').textContent = currentOrderItem.description;
    document.getElementById('detailPrice').textContent = `Giá gốc: ${formatVND(currentOrderItem.price)}`;
    
    // Show ice option only for iced drinks
    const iceGroup = document.getElementById('iceGroup');
    if (currentOrderItem.category === 'iced') {
        iceGroup.style.display = 'block';
    } else {
        iceGroup.style.display = 'none';
    }
    
    // Reset form
    document.getElementById('orderDetailForm').reset();
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
    
    // Add size cost
    const size = form.querySelector('input[name="size"]:checked').value;
    if (size === 'Medium') total += 12500;
    if (size === 'Large') total += 25000;
    
    // Add milk cost
    const milk = form.querySelector('input[name="milk"]:checked').value;
    if (milk !== 'Regular') total += 12500;
    
    // Add extra shots cost
    const extraShots = parseInt(form.querySelector('input[name="extraShots"]:checked').value);
    total += extraShots * 18750;
    
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

// Update Order Summary
function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => {
        const price = item.totalPrice || item.price;
        return sum + (price * item.quantity);
    }, 0);
    const tax = subtotal * 0.1;
    
    // Calculate discount based on reward type
    let finalDiscount = 0;
    if (appliedReward) {
        if (appliedReward.name === '10% Off') {
            finalDiscount = subtotal * 0.1;
        } else {
            finalDiscount = appliedDiscount;
        }
    }
    
    // Add delivery fee if delivery is selected
    const delivery = isDelivery ? deliveryFee : 0;
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
    
    // Display applied reward
    displayAppliedReward();
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
            const total = parseFloat(document.getElementById('total').textContent.replace(/[^\d]/g, ''));
            if (total > 0) {
                const paymentModal = document.getElementById('paymentModal');
                document.getElementById('paymentTotal').textContent = formatVND(total);
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
                <a href="profile.html" class="user-menu-item">
                    <i class="fas fa-user"></i>
                    <span>Thông tin khách hàng</span>
                    <i class="fas fa-chevron-right"></i>
                </a>
                <a href="#rewards" class="user-menu-item" onclick="document.querySelector('.user-menu-overlay').remove()">
                    <i class="fas fa-gift"></i>
                    <span>Điểm thưởng</span>
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
    signInBtn.href = 'admin-login.html';
    
    // Remove old event listeners by cloning
    const newSignInBtn = signInBtn.cloneNode(true);
    signInBtn.parentNode.replaceChild(newSignInBtn, signInBtn);
    
    document.getElementById('userPoints').textContent = '0';
    showNotification('Logged out successfully!');
    
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
    const total = parseFloat(document.getElementById('total').textContent.replace(/[^\d]/g, ''));
    document.getElementById('paymentTotal').textContent = formatVND(total);
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
    window.location.href = 'admin-login.html?redirect=checkout';
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
    
    // Handle form submission
    const form = document.getElementById('deliveryForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const address = document.getElementById('deliveryAddress').value.trim();
        const note = document.getElementById('deliveryNote').value.trim();
        
        if (!address) {
            showNotification('Vui lòng nhập địa chỉ giao hàng!');
            return;
        }
        
        // Store delivery information
        deliveryInfo = {
            address: address,
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
    const total = parseFloat(document.getElementById('total').textContent.replace(/[^\d]/g, ''));
    document.getElementById('paymentTotal').textContent = formatVND(total);
    paymentModal.style.display = 'block';
}

function openPaymentModalWithDelivery() {
    const paymentModal = document.getElementById('paymentModal');
    const total = parseFloat(document.getElementById('total').textContent.replace(/[^\d]/g, ''));
    document.getElementById('paymentTotal').textContent = formatVND(total);
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

    // Process payment
    const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace(/[^\d]/g, ''));
    const tax = parseFloat(document.getElementById('tax').textContent.replace(/[^\d]/g, ''));
    const discount = parseFloat(document.getElementById('discount').textContent.replace(/[^\d]/g, ''));
    const delivery = isDelivery ? deliveryFee : 0;
    const total = parseFloat(document.getElementById('total').textContent.replace(/[^\d]/g, ''));
    const pointsEarned = Math.floor(total / 25000);

    // Create order object for admin
    const order = {
        id: 'ORD' + Date.now(),
        customerName: currentUser ? currentUser.name : (guestInfo ? guestInfo.name : 'Guest'),
        customerEmail: currentUser ? currentUser.email : 'guest@example.com',
        items: JSON.parse(JSON.stringify(cart)), // Deep copy
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        deliveryFee: delivery,
        isDelivery: isDelivery,
        total: total,
        status: 'pending',
        date: new Date().toISOString(),
        paymentMethod: paymentMethod
    };
    
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
            note: deliveryInfo.note
        };
    }

    // Save order to admin orders
    const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    adminOrders.push(order);
    localStorage.setItem('adminOrders', JSON.stringify(adminOrders));

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
    guestInfo = null; // Clear guest information
    deliveryInfo = null; // Clear delivery information
    isDelivery = false; // Reset delivery flag
    updateCart();
    renderRewards(); // Re-render rewards to reset the UI

    document.getElementById('paymentModal').style.display = 'none';
    
    // Show appropriate success message
    if (currentUser) {
        if (wasDelivery) {
            showNotification(`Thanh toán thành công! Đơn hàng ${order.id} đã được tạo. Chúng tôi sẽ giao hàng sớm. Bạn nhận được ${pointsEarned} điểm!`);
        } else {
            showNotification(`Thanh toán thành công! Đơn hàng ${order.id} đã được tạo. Vui lòng đến quán nhận hàng. Bạn nhận được ${pointsEarned} điểm!`);
        }
    } else {
        if (wasDelivery) {
            showNotification(`Thanh toán thành công! Đơn hàng ${order.id} đã được tạo. Chúng tôi sẽ giao hàng và liên hệ với bạn sớm!`);
        } else {
            showNotification(`Thanh toán thành công! Đơn hàng ${order.id} đã được tạo. Vui lòng đến quán nhận hàng!`);
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
        window.location.href = 'admin-login.html';
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
        appliedDiscount = reward.discount;
        appliedReward = reward;
        
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
        userPoints += appliedReward.points;
        appliedDiscount = 0;
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
    
    // Calculate total price per item
    let itemPrice = currentOrderItem.price;
    if (customizations.size === 'Medium') itemPrice += 12500;
    if (customizations.size === 'Large') itemPrice += 25000;
    if (customizations.milk !== 'Regular') itemPrice += 12500;
    itemPrice += customizations.extraShots * 18750;
    
    // Add to cart
    const cartItem = {
        ...currentOrderItem,
        quantity: quantity,
        customizations: customizations,
        totalPrice: itemPrice,
        uniqueId: Date.now() // To distinguish items with different customizations
    };
    
    cart.push(cartItem);
    updateCart();
    
    document.getElementById('orderDetailModal').style.display = 'none';
    showNotification(`${currentOrderItem.name} added to cart!`);
    currentOrderItem = null;
}
