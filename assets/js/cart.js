// VND Currency Formatter
function formatVND(amount) {
    return amount.toLocaleString('vi-VN') + '₫';
}

// Global State
let cart = [];
let currentUser = null;
let appliedDiscount = 0;
let appliedReward = null;
let pointsDiscount = 0;
let usedPoints = 0;
let isDelivery = false;
let deliveryFee = 23000;
let deliveryInfo = null;
let customizingIndex = -1;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    loadCart();
    renderCart();
    checkLoginStatus();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }

    // Apply promo button
    const applyPromoBtn = document.querySelector('.apply-promo-btn');
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', applyPromoCode);
    }

    // Delivery checkbox
    const deliveryCheckbox = document.getElementById('deliveryCheckbox');
    if (deliveryCheckbox) {
        deliveryCheckbox.addEventListener('change', toggleDeliveryOption);
    }

    // Place order button
    const placeOrderBtn = document.querySelector('.place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }

    // Guest form
    const guestForm = document.getElementById('guestForm');
    if (guestForm) {
        guestForm.addEventListener('submit', submitGuestInfo);
    }

    // Delivery form
    const deliveryForm = document.getElementById('deliveryForm');
    if (deliveryForm) {
        deliveryForm.addEventListener('submit', submitDeliveryInfo);
    }

    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Click outside modal to close
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Load User Data
function loadUserData() {
    const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
        } catch (e) {
            console.error('Error parsing user data:', e);
            currentUser = null;
        }
    }
}

// Check Login Status
function checkLoginStatus() {
    const authLink = document.getElementById('authLink');
    const authText = document.getElementById('authText');

    if (currentUser) {
        if (authText) authText.textContent = currentUser.name;
        if (authLink) {
            authLink.innerHTML = `<i class="fas fa-user"></i><span>${currentUser.name}</span>`;
            authLink.onclick = showUserMenu;
        }
    } else {
        if (authText) authText.textContent = 'Sign In';
        if (authLink) {
            authLink.innerHTML = `<i class="fas fa-sign-in-alt"></i><span>Sign In</span>`;
            authLink.onclick = () => window.location.href = '../admin/login.html';
        }
    }
}

// Show User Menu
function showUserMenu(event) {
    event.preventDefault();
    const authLink = document.getElementById('authLink');
    const rect = authLink.getBoundingClientRect();
    
    const menu = `
        <div class="user-menu-overlay" onclick="this.remove()">
            <div class="user-menu-dropdown" style="top: ${rect.bottom + 10}px; right: 20px;" onclick="event.stopPropagation()">
                <div class="user-menu-header">
                    <i class="fas fa-user-circle"></i>
                    <div>
                        <div class="user-menu-name">${currentUser.name}</div>
                        <div class="user-menu-email">${currentUser.email}</div>
                    </div>
                </div>
                <div class="user-menu-items">
                    <a href="profile.html" class="user-menu-item">
                        <i class="fas fa-user"></i> Hồ Sơ
                    </a>
                    <a href="orders.html" class="user-menu-item">
                        <i class="fas fa-shopping-bag"></i> Đơn Hàng
                    </a>
                    <a href="membercard.html" class="user-menu-item">
                        <i class="fas fa-id-card"></i> Thẻ Thành Viên
                    </a>
                    <a href="#" onclick="logout(event)" class="user-menu-item user-menu-logout">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Đăng xuất</span>
                    </a>
                </div>
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
    modal.id = 'logoutModalCart';
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
            ">
                <button onclick="closeLogoutModal()" style="
                    flex: 1;
                    padding: 0.75rem 1.5rem;
                    border: 2px solid #ddd;
                    background: white;
                    color: #666;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-weight: 600;
                ">
                    <i class="fas fa-times"></i> Hủy
                </button>
                <button onclick="confirmLogout()" style="
                    flex: 1;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    background: linear-gradient(135deg, #ff6b6b, #ff8787);
                    color: white;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-weight: 600;
                ">
                    <i class="fas fa-check"></i> Đăng xuất
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeLogoutModal();
        }
    });
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModalCart');
    if (modal) modal.remove();
}

function confirmLogout() {
    closeLogoutModal();
    
    // Clear user data immediately
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    
    // Redirect immediately without delay
    window.location.replace('../index.html');
}

// Load Cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            console.log('Cart loaded:', cart.length, 'items');
        } catch (e) {
            console.error('Error loading cart:', e);
            cart = [];
        }
    } else {
        cart = [];
    }
}

// Save Cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Cart saved:', cart.length, 'items');
}

// Get Item Price (with fallback)
function getItemPrice(item) {
    return item.totalPrice || item.price || 0;
}

// Render Cart
function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    const emptyState = document.getElementById('emptyState');
    const summarySection = document.getElementById('summarySection');
    const itemCount = document.getElementById('itemCount');
    const cartCount = document.getElementById('cartCount');

    if (!container) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (itemCount) itemCount.textContent = totalItems;
    if (cartCount) cartCount.textContent = totalItems;

    if (cart.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (summarySection) summarySection.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (summarySection) summarySection.style.display = 'block';
    
    // Load discount code suggestions
    loadCartDiscountSuggestions();

    container.innerHTML = cart.map((item, index) => {
        const customizations = [];
        if (item.customizations) {
            if (item.customizations.size) customizations.push(`<span class="customization-tag"><i class="fas fa-coffee"></i> ${item.customizations.size}</span>`);
            if (item.customizations.sugar) customizations.push(`<span class="customization-tag"><i class="fas fa-cube"></i> Đường: ${item.customizations.sugar}</span>`);
            if (item.customizations.ice) customizations.push(`<span class="customization-tag"><i class="fas fa-snowflake"></i> Đá: ${item.customizations.ice}</span>`);
            if (item.customizations.milk && item.customizations.milk !== 'Regular') customizations.push(`<span class="customization-tag"><i class="fas fa-glass-whiskey"></i> ${item.customizations.milk}</span>`);
            if (item.customizations.extraShots > 0) customizations.push(`<span class="customization-tag"><i class="fas fa-plus-circle"></i> +${item.customizations.extraShots} shot</span>`);
        }

        const itemPrice = getItemPrice(item);
        const totalItemPrice = itemPrice * item.quantity;

        return `
            <div class="cart-item-card" data-index="${index}">
                <div class="cart-item-image" style="background: ${item.image}"></div>
                <div class="cart-item-details">
                    <div class="cart-item-header">
                        <h3 class="cart-item-name">${item.name}</h3>
                        <div class="cart-item-price">${formatVND(totalItemPrice)}</div>
                    </div>
                    ${customizations.length > 0 ? `
                        <div class="cart-item-customizations">
                            ${customizations.join('')}
                        </div>
                    ` : ''}
                    ${item.customizations && item.customizations.notes ? `
                        <div style="background: white; padding: 0.5rem; border-radius: 6px; font-size: 0.9rem; color: #666; margin-top: 0.5rem;">
                            <i class="fas fa-sticky-note"></i> Ghi chú: ${item.customizations.notes}
                        </div>
                    ` : ''}
                    <div class="cart-item-footer">
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease-btn" data-index="${index}">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn increase-btn" data-index="${index}">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="customize-btn" data-index="${index}">
                                <i class="fas fa-edit"></i> Tùy chỉnh
                            </button>
                            <button class="remove-item-btn" data-index="${index}">
                                <i class="fas fa-trash"></i> Xóa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add event listeners to buttons
    container.querySelectorAll('.decrease-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            updateQuantity(index, -1);
        });
    });

    container.querySelectorAll('.increase-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            updateQuantity(index, 1);
        });
    });

    container.querySelectorAll('.customize-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            openCustomizeModal(index);
        });
    });

    container.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            removeItem(index);
        });
    });

    updateSummary();
    showMemberInfo();
}

// Update Quantity
function updateQuantity(index, change) {
    console.log('updateQuantity:', index, change);
    
    if (!cart[index]) {
        console.error('Item not found at index:', index);
        return;
    }

    cart[index].quantity += change;
    console.log('New quantity:', cart[index].quantity);

    if (cart[index].quantity <= 0) {
        removeItem(index);
    } else {
        saveCart();
        renderCart();
    }
}

// Remove Item
function removeItem(index) {
    console.log('removeItem:', index);
    
    if (!cart[index]) {
        console.error('Item not found at index:', index);
        return;
    }

    cart.splice(index, 1);
    saveCart();
    renderCart();
    showNotification('Đã xóa sản phẩm khỏi giỏ hàng');
}

// Get Member Tier Benefits
function getMemberTierBenefits() {
    if (!currentUser || currentUser.isGuest) {
        return { 
            tier: 'none', 
            tierName: 'Chưa có thẻ',
            discount: 0,
            pointMultiplier: 1
        };
    }
    
    const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const userOrdersList = userOrders.filter(order => order.userEmail === currentUser.email);
    const totalSpending = userOrdersList.reduce((sum, order) => sum + order.total, 0);
    
    if (totalSpending >= 10000000) {
        return { 
            tier: 'diamond', 
            tierName: 'Thẻ Kim Cương',
            discount: 0.15,
            pointMultiplier: 3
        };
    } else if (totalSpending >= 3000000) {
        return { 
            tier: 'gold', 
            tierName: 'Thẻ Vàng',
            discount: 0.10,
            pointMultiplier: 2
        };
    } else if (totalSpending >= 500000) {
        return { 
            tier: 'silver', 
            tierName: 'Thẻ Bạc',
            discount: 0.05,
            pointMultiplier: 1.5
        };
    }
    
    return { 
        tier: 'none', 
        tierName: 'Chưa có thẻ',
        discount: 0,
        pointMultiplier: 1
    };
}

// Show Member Info
function showMemberInfo() {
    const memberCard = document.getElementById('memberCard');
    if (!memberCard) return;

    if (!currentUser || currentUser.isGuest) {
        memberCard.style.display = 'none';
        showPointsSection(false);
        return;
    }

    const memberBenefits = getMemberTierBenefits();

    if (memberBenefits.tier !== 'none') {
        memberCard.style.display = 'block';
        const tierElement = document.getElementById('memberTier');
        const discountElement = document.getElementById('memberDiscount');
        
        if (tierElement) tierElement.textContent = memberBenefits.tierName;
        if (discountElement) discountElement.textContent = `Giảm giá ${memberBenefits.discount * 100}%`;
    } else {
        memberCard.style.display = 'none';
    }
    
    // Show points redemption section
    showPointsSection(true);
}

// Toggle Points Options
function togglePointsOptions() {
    const pointsOptions = document.getElementById('pointsOptions');
    const toggleIcon = document.getElementById('pointsToggleIcon');
    
    if (!pointsOptions || !toggleIcon) return;
    
    if (pointsOptions.style.display === 'none' || !pointsOptions.style.display) {
        pointsOptions.style.display = 'flex';
        toggleIcon.classList.add('active');
    } else {
        pointsOptions.style.display = 'none';
        toggleIcon.classList.remove('active');
    }
}

// Show Points Section
function showPointsSection(show) {
    const pointsSection = document.getElementById('pointsSection');
    if (!pointsSection) return;
    
    if (!show || !currentUser || currentUser.isGuest) {
        pointsSection.style.display = 'none';
        return;
    }
    
    pointsSection.style.display = 'block';
    
    const userPoints = currentUser.points || 0;
    const userPointsElement = document.getElementById('userPoints');
    if (userPointsElement) userPointsElement.textContent = userPoints;
    
    // Render points options (initially hidden)
    renderPointsOptions(userPoints);
}

// Render Points Options
function renderPointsOptions(userPoints) {
    const pointsOptionsContainer = document.getElementById('pointsOptions');
    if (!pointsOptionsContainer) return;
    
    const pointsOptions = [
        { points: 50, discount: 10000, label: '10.000₫' },
        { points: 100, discount: 25000, label: '25.000₫' },
        { points: 200, discount: 50000, label: '50.000₫' },
        { points: 500, discount: 150000, label: '150.000₫' }
    ];
    
    pointsOptionsContainer.innerHTML = pointsOptions.map(option => {
        const isActive = usedPoints === option.points;
        const canAfford = userPoints >= option.points;
        const disabled = !canAfford ? 'opacity: 0.5; cursor: not-allowed;' : '';
        
        return `
            <div class="points-option ${isActive ? 'active' : ''}" 
                 data-points="${option.points}" 
                 data-discount="${option.discount}"
                 style="${disabled}"
                 ${canAfford ? '' : 'onclick="return false;"'}>
                <div class="points-option-info">
                    <div class="points-option-discount">Giảm ${option.label}</div>
                    <div class="points-option-cost">${option.points} điểm</div>
                </div>
                ${canAfford ? '<div class="points-option-badge">Đổi</div>' : '<div style="color: #999; font-size: 0.85rem;">Không đủ điểm</div>'}
            </div>
        `;
    }).join('');
    
    // Add event listeners
    pointsOptionsContainer.querySelectorAll('.points-option').forEach(option => {
        option.addEventListener('click', function() {
            const points = parseInt(this.dataset.points);
            const discount = parseInt(this.dataset.discount);
            const canAfford = userPoints >= points;
            
            if (!canAfford) return;
            
            // Toggle selection
            if (usedPoints === points) {
                usedPoints = 0;
                pointsDiscount = 0;
            } else {
                usedPoints = points;
                pointsDiscount = discount;
            }
            
            updateSummary();
            renderPointsOptions(userPoints);
        });
    });
}

// Calculate Subtotal
function calculateSubtotal() {
    return cart.reduce((sum, item) => {
        const itemPrice = getItemPrice(item);
        return sum + (itemPrice * item.quantity);
    }, 0);
}

// Update Summary
function updateSummary() {
    const subtotal = calculateSubtotal();
    const tax = subtotal * 0.1;
    
    let discount = appliedDiscount > 0 ? subtotal * appliedDiscount : 0;
    const memberBenefits = getMemberTierBenefits();
    if (memberBenefits.discount > 0) {
        discount = subtotal * memberBenefits.discount;
    }
    
    const delivery = isDelivery ? deliveryFee : 0;
    const total = subtotal + tax - discount - pointsDiscount + delivery;

    const subtotalElement = document.getElementById('subtotalAmount');
    const taxElement = document.getElementById('taxAmount');
    const totalElement = document.getElementById('totalAmount');
    const discountRow = document.getElementById('discountRow');
    const discountElement = document.getElementById('discountAmount');
    const pointsDiscountRow = document.getElementById('pointsDiscountRow');
    const pointsDiscountElement = document.getElementById('pointsDiscountAmount');

    if (subtotalElement) subtotalElement.textContent = formatVND(subtotal);
    if (taxElement) taxElement.textContent = formatVND(tax);
    if (totalElement) totalElement.textContent = formatVND(total);

    if (discountRow && discountElement) {
        if (discount > 0) {
            discountRow.style.display = 'flex';
            discountElement.textContent = '-' + formatVND(discount);
        } else {
            discountRow.style.display = 'none';
        }
    }
    
    if (pointsDiscountRow && pointsDiscountElement) {
        if (pointsDiscount > 0) {
            pointsDiscountRow.style.display = 'flex';
            pointsDiscountElement.textContent = '-' + formatVND(pointsDiscount);
        } else {
            pointsDiscountRow.style.display = 'none';
        }
    }
}

// Apply Promo Code
function applyPromoCode() {
    const promoInput = document.getElementById('promoCode');
    if (!promoInput) return;

    const code = promoInput.value.trim().toUpperCase();

    if (!code) {
        showNotification('Vui lòng nhập mã giảm giá', 'error');
        return;
    }

    // Example promo codes
    const promoCodes = {
        'WELCOME10': 0.10,
        'SAVE15': 0.15,
        'VIP20': 0.20
    };

    if (promoCodes[code]) {
        const subtotal = calculateSubtotal();
        appliedDiscount = subtotal * promoCodes[code];
        updateSummary();
        showNotification(`Áp dụng mã giảm giá thành công! Giảm ${promoCodes[code] * 100}%`);
        promoInput.value = '';
    } else {
        showNotification('Mã giảm giá không hợp lệ', 'error');
    }
}

// Proceed to Checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Giỏ hàng trống', 'error');
        return;
    }

    if (!currentUser) {
        const guestModal = document.getElementById('guestModal');
        if (guestModal) guestModal.style.display = 'block';
    } else {
        showCheckoutModal();
    }
}

// Show Checkout Modal
function showCheckoutModal() {
    const subtotal = calculateSubtotal();
    const tax = subtotal * 0.1;
    
    // Calculate discount from promo codes (appliedDiscount stores percentage like 0.3 for 30%)
    let discount = appliedDiscount > 0 ? subtotal * appliedDiscount : 0;
    
    // Add member tier discount
    const memberBenefits = getMemberTierBenefits();
    if (memberBenefits.discount > 0) {
        discount += subtotal * memberBenefits.discount;
    }
    
    const delivery = isDelivery ? deliveryFee : 0;
    const total = subtotal + tax - discount - pointsDiscount + delivery;

    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTax = document.getElementById('checkoutTax');
    const checkoutTotal = document.getElementById('checkoutTotal');
    const checkoutDiscountRow = document.getElementById('checkoutDiscountRow');
    const checkoutDiscount = document.getElementById('checkoutDiscount');

    if (checkoutSubtotal) checkoutSubtotal.textContent = formatVND(subtotal);
    if (checkoutTax) checkoutTax.textContent = formatVND(tax);
    if (checkoutTotal) checkoutTotal.textContent = formatVND(total);
    
    if (checkoutDiscountRow && checkoutDiscount) {
        const totalDiscount = discount + pointsDiscount;
        if (totalDiscount > 0) {
            checkoutDiscountRow.style.display = 'flex';
            checkoutDiscount.textContent = '-' + formatVND(totalDiscount);
        } else {
            checkoutDiscountRow.style.display = 'none';
        }
    }

    loadAvailableDiscountCodes();
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) checkoutModal.style.display = 'block';
}

// Toggle Delivery Option
function toggleDeliveryOption() {
    const deliveryCheckbox = document.getElementById('deliveryCheckbox');
    if (!deliveryCheckbox) return;

    isDelivery = deliveryCheckbox.checked;
    
    if (isDelivery) {
        const deliveryModal = document.getElementById('deliveryModal');
        const checkoutModal = document.getElementById('checkoutModal');
        
        if (deliveryModal) deliveryModal.style.display = 'block';
        if (checkoutModal) checkoutModal.style.display = 'none';
    }
    
    updateSummary();
    if (!isDelivery) {
        showCheckoutModal();
    }
}

// Submit Guest Info
function submitGuestInfo(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('guestName');
    const phoneInput = document.getElementById('guestPhone');

    if (!nameInput || !phoneInput) return;

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    
    if (!name || !phone) {
        showNotification('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }
    
    currentUser = { 
        name, 
        phone, 
        email: `guest_${Date.now()}@example.com`, 
        isGuest: true 
    };
    
    closeGuestModal();
    showCheckoutModal();
}

// Submit Delivery Info
function submitDeliveryInfo(event) {
    event.preventDefault();
    
    const addressInput = document.getElementById('deliveryAddress');
    const noteInput = document.getElementById('deliveryNote');

    if (!addressInput) return;

    const address = addressInput.value.trim();
    const note = noteInput ? noteInput.value.trim() : '';
    
    if (!address) {
        showNotification('Vui lòng nhập địa chỉ giao hàng', 'error');
        return;
    }
    
    deliveryInfo = { address, note };
    closeDeliveryModal();
    showCheckoutModal();
}

// Place Order
function placeOrder() {
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const paymentMethod = paymentMethodSelect ? paymentMethodSelect.value : 'cash';
    
    const subtotal = calculateSubtotal();
    const tax = subtotal * 0.1;
    
    // Calculate discount from promo codes (appliedDiscount stores percentage like 0.3 for 30%)
    let discount = appliedDiscount > 0 ? subtotal * appliedDiscount : 0;
    
    // Add member tier discount
    const memberBenefits = getMemberTierBenefits();
    if (memberBenefits.discount > 0) {
        discount += subtotal * memberBenefits.discount;
    }
    
    const delivery = isDelivery ? deliveryFee : 0;
    const total = subtotal + tax - discount - pointsDiscount + delivery;

    // Calculate points earned
    const basePoints = Math.floor(total / 10000);
    const pointsEarned = currentUser && !currentUser.isGuest ? basePoints * (memberBenefits.pointMultiplier || 1) : 0;

    // Create order object
    const order = {
        id: 'ORD' + Date.now(),
        customerName: currentUser ? currentUser.name : 'Guest',
        customerEmail: currentUser ? currentUser.email : 'guest@example.com',
        items: JSON.parse(JSON.stringify(cart)),
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        pointsDiscount: pointsDiscount,
        pointsUsed: usedPoints,
        deliveryFee: delivery,
        isDelivery: isDelivery,
        total: total,
        status: 'pending',
        date: new Date().toISOString(),
        paymentMethod: paymentMethod
    };

    if (isDelivery && deliveryInfo) {
        order.deliveryInfo = deliveryInfo;
    }

    // Save order to orders list
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Save to user orders if logged in
    if (currentUser && !currentUser.isGuest) {
        const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        userOrders.push({
            ...order,
            userEmail: currentUser.email,
            pointsEarned: pointsEarned
        });
        localStorage.setItem('userOrders', JSON.stringify(userOrders));

        // Update user points (deduct used points, add earned points)
        currentUser.points = (currentUser.points || 0) - usedPoints + pointsEarned;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex].points = currentUser.points;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    // Clear cart and discounts
    cart = [];
    appliedDiscount = 0;
    pointsDiscount = 0;
    usedPoints = 0;
    saveCart();

    // Close modal
    closeCheckoutModal();

    // Show success notification
    showNotification('Đặt hàng thành công!');
    
    // Redirect to orders page
    setTimeout(() => {
        window.location.href = 'orders.html';
    }, 1500);
}

// Close Modals
function closeGuestModal() {
    const modal = document.getElementById('guestModal');
    if (modal) modal.style.display = 'none';
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.style.display = 'none';
}

function closeDeliveryModal() {
    const modal = document.getElementById('deliveryModal');
    if (modal) modal.style.display = 'none';
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Open Customize Modal
function openCustomizeModal(index) {
    customizingIndex = index;
    const item = cart[index];
    
    if (!item) return;
    
    const modal = document.getElementById('customizeModal');
    const content = document.getElementById('customizeContent');
    
    if (!modal || !content) return;
    
    // Get current customizations or defaults
    const current = item.customizations || {};
    
    // Copy exact structure from menu's orderDetailModal
    content.innerHTML = `
        <form id="customizeForm">
            <!-- Size Selection -->
            <div class="form-group">
                <label><i class="fas fa-coffee"></i> Size</label>
                <div class="option-group">
                    <label class="option-radio">
                        <input type="radio" name="size" value="Small" ${current.size === 'Small' ? 'checked' : ''}>
                        <span>Small (-20%)</span>
                    </label>
                    <label class="option-radio">
                        <input type="radio" name="size" value="Medium" ${!current.size || current.size === 'Medium' ? 'checked' : ''}>
                        <span>Medium</span>
                    </label>
                    <label class="option-radio">
                        <input type="radio" name="size" value="Large" ${current.size === 'Large' ? 'checked' : ''}>
                        <span>Large (+20%)</span>
                    </label>
                </div>
            </div>

            <!-- Sugar Level -->
            <div class="form-group">
                <label><i class="fas fa-cube"></i> Sugar Level</label>
                <div class="option-group">
                    <label class="option-radio">
                        <input type="radio" name="sugar" value="No Sugar" ${current.sugar === 'No Sugar' ? 'checked' : ''}>
                        <span>No Sugar</span>
                    </label>
                    <label class="option-radio">
                        <input type="radio" name="sugar" value="25%" ${current.sugar === '25%' ? 'checked' : ''}>
                        <span>25%</span>
                    </label>
                    <label class="option-radio">
                        <input type="radio" name="sugar" value="50%" ${current.sugar === '50%' ? 'checked' : ''}>
                        <span>50%</span>
                    </label>
                    <label class="option-radio">
                        <input type="radio" name="sugar" value="75%" ${current.sugar === '75%' ? 'checked' : ''}>
                        <span>75%</span>
                    </label>
                    <label class="option-radio">
                        <input type="radio" name="sugar" value="100%" ${!current.sugar || current.sugar === '100%' ? 'checked' : ''}>
                        <span>100%</span>
                    </label>
                </div>
            </div>

            <!-- Ice Level -->
            <div class="form-group">
                <label><i class="fas fa-snowflake"></i> Ice Level</label>
                <div class="option-group">
                    <label class="option-radio">
                        <input type="radio" name="ice" value="No Ice" ${current.ice === 'No Ice' ? 'checked' : ''}>
                        <span>No Ice</span>
                    </label>
                    <label class="option-radio">
                        <input type="radio" name="ice" value="Less Ice" ${current.ice === 'Less Ice' ? 'checked' : ''}>
                        <span>Less Ice</span>
                    </label>
                    <label class="option-radio">
                        <input type="radio" name="ice" value="Normal" ${!current.ice || current.ice === 'Normal' ? 'checked' : ''}>
                        <span>Normal</span>
                    </label>
                    <label class="option-radio">
                        <input type="radio" name="ice" value="Extra Ice" ${current.ice === 'Extra Ice' ? 'checked' : ''}>
                        <span>Extra Ice</span>
                    </label>
                </div>
            </div>

            <!-- Milk Options -->
            <div class="form-group">
                <label><i class="fas fa-glass-whiskey"></i> Milk Type</label>
                <div class="option-group">
                    <label class="option-radio">
                        <input type="radio" name="milk" value="Regular" ${!current.milk || current.milk === 'Regular' ? 'checked' : ''}>
                        <span>Regular</span>
                    </label>
                    <label class="option-radio">
                        <input type="radio" name="milk" value="Soy Milk" ${current.milk === 'Soy Milk' ? 'checked' : ''}>
                        <span>Soy Milk (+3.000₫)</span>
                    </label>
                    <label class="option-radio">
                        <input type="radio" name="milk" value="Almond Milk" ${current.milk === 'Almond Milk' ? 'checked' : ''}>
                        <span>Almond Milk (+5.000₫)</span>
                    </label>
                    <label class="option-radio">
                        <input type="radio" name="milk" value="Oat Milk" ${current.milk === 'Oat Milk' ? 'checked' : ''}>
                        <span>Oat Milk (+5.000₫)</span>
                    </label>
                </div>
            </div>

            <!-- Extra Shots -->
            <div class="form-group">
                <label><i class="fas fa-plus-circle"></i> Extra Espresso Shots</label>
                <div class="option-group">
                    <label class="option-radio">
                        <input type="radio" name="extraShots" value="0" ${!current.extraShots || current.extraShots === '0' ? 'checked' : ''}>
                        <span>None</span>
                    </label>
                    <label class="option-radio">
                        <input type="radio" name="extraShots" value="1" ${current.extraShots === '1' ? 'checked' : ''}>
                        <span>+1 Shot (+10.000₫)</span>
                    </label>
                    <label class="option-radio">
                        <input type="radio" name="extraShots" value="2" ${current.extraShots === '2' ? 'checked' : ''}>
                        <span>+2 Shots (+20.000₫)</span>
                    </label>
                </div>
            </div>

            <!-- Special Notes -->
            <div class="form-group">
                <label><i class="fas fa-sticky-note"></i> Special Instructions</label>
                <textarea id="orderNotes" rows="3" placeholder="Add any special requests here (e.g., extra hot, less foam, etc.)">${current.notes || ''}</textarea>
            </div>

            <button type="button" class="btn-primary btn-full" onclick="saveCustomization()">
                <i class="fas fa-check"></i> Save Changes
            </button>
        </form>
    `;
    
    modal.style.display = 'block';
}

// Save Customization
function saveCustomization() {
    if (customizingIndex < 0 || !cart[customizingIndex]) return;
    
    const form = document.getElementById('customizeForm');
    if (!form) return;
    
    // Get selected values from radio buttons - same as menu
    const size = form.querySelector('input[name="size"]:checked')?.value || 'Medium';
    const sugar = form.querySelector('input[name="sugar"]:checked')?.value || '100%';
    const ice = form.querySelector('input[name="ice"]:checked')?.value || 'Normal';
    const milk = form.querySelector('input[name="milk"]:checked')?.value || 'Regular';
    const extraShots = form.querySelector('input[name="extraShots"]:checked')?.value || '0';
    const notes = form.querySelector('#orderNotes')?.value || '';
    
    // Calculate new price - same as menu
    const basePrice = cart[customizingIndex].price || 45000;
    let totalPrice = basePrice;
    
    // Apply size multiplier
    if (size === 'Small') totalPrice = basePrice * 0.8;
    else if (size === 'Medium') totalPrice = basePrice * 1.0;
    else if (size === 'Large') totalPrice = basePrice * 1.2;
    
    // Add milk price
    if (milk === 'Soy Milk') totalPrice += 3000;
    if (milk === 'Almond Milk' || milk === 'Oat Milk') totalPrice += 5000;
    
    // Add extra shots price
    if (extraShots === '1') totalPrice += 10000;
    if (extraShots === '2') totalPrice += 20000;
    
    // Update cart item
    cart[customizingIndex].customizations = {
        size,
        sugar,
        ice,
        milk,
        extraShots,
        notes
    };
    cart[customizingIndex].totalPrice = totalPrice;
    
    saveCart();
    renderCart();
    closeCustomizeModal();
    showNotification('Đã cập nhật tùy chỉnh');
}

// Close Customize Modal
function closeCustomizeModal() {
    const modal = document.getElementById('customizeModal');
    if (modal) modal.style.display = 'none';
    customizingIndex = -1;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

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
    const notif = notifications.find(n => n.code === code);
    
    // Check if code is expired
    if (notif && new Date(notif.expiryDate) < new Date()) {
        showNotification('Mã giảm giá đã hết hạn!');
        return;
    }
    
    // Apply discount
    appliedDiscount = discountPercent;
    
    // Reload discount codes to update UI
    loadAvailableDiscountCodes();
    
    // Update checkout modal totals
    showCheckoutModal();
    
    showNotification(`Đã áp dụng mã giảm giá ${code} - Giảm ${(discountPercent * 100)}%!`);
}

// Load discount code suggestions in cart
function loadCartDiscountSuggestions() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    if (!currentUser) return;

    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const userDiscounts = notifications.filter(n => 
        n.userEmail === currentUser.email && 
        n.type === 'promotion' && 
        n.code
    );
    
    const container = document.getElementById('cartAvailableDiscounts');
    if (!container) return;

    if (userDiscounts.length === 0) {
        container.innerHTML = '<div class="cart-no-discounts">Không có mã giảm giá khả dụng</div>';
        return;
    }

    container.innerHTML = userDiscounts.map(discount => {
        const expiryDate = new Date(discount.expiryDate);
        const isExpired = expiryDate < new Date();
        const isApplied = appliedDiscount === discount.discount;
        
        return `
            <div class="cart-discount-item ${isExpired ? 'expired' : ''} ${isApplied ? 'applied' : ''}" 
                 onclick="${isExpired ? '' : `applyCartDiscountCode('${discount.code}', ${discount.discount})`}">
                <div class="cart-discount-left">
                    <div class="cart-discount-code">
                        <i class="fas fa-tag"></i>
                        ${discount.code}
                        ${isApplied ? '<i class="fas fa-check-circle" style="color: #4caf50;"></i>' : ''}
                    </div>
                    <div class="cart-discount-desc">
                        Giảm ${(discount.discount * 100)}% cho đơn hàng
                    </div>
                    <div class="cart-discount-expiry ${isExpired ? 'expired' : ''}">
                        ${isExpired ? 'Đã hết hạn' : 'HSD: ' + expiryDate.toLocaleDateString('vi-VN')}
                    </div>
                </div>
                <button class="cart-discount-apply-btn ${isApplied ? 'applied' : ''}" 
                        onclick="event.stopPropagation(); ${isExpired ? '' : `applyCartDiscountCode('${discount.code}', ${discount.discount})`}"
                        ${isExpired ? 'disabled' : ''}>
                    ${isApplied ? '<i class="fas fa-check"></i> Đã dùng' : '<i class="fas fa-tag"></i> Dùng'}
                </button>
            </div>
        `;
    }).join('');
}

// Apply discount code from cart suggestions
function applyCartDiscountCode(code, discountPercent) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notifIndex = notifications.findIndex(n => n.code === code);
    
    if (notifIndex === -1) return;
    
    const notif = notifications[notifIndex];
    
    // Check if code is expired
    if (new Date(notif.expiryDate) < new Date()) {
        showNotification('Mã giảm giá đã hết hạn!');
        return;
    }
    
    // Auto-fill the promo code input
    const promoInput = document.getElementById('promoCode');
    if (promoInput) {
        promoInput.value = code;
    }
    
    // Apply discount
    appliedDiscount = discountPercent;
    updateSummary();
    
    // Mark as read and remove the notification
    notifications[notifIndex].isRead = true;
    notifications.splice(notifIndex, 1);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Reload suggestions to update UI
    loadCartDiscountSuggestions();
    
    showNotification(`Đã áp dụng mã ${code} - Giảm ${(discountPercent * 100)}%!`);
}
