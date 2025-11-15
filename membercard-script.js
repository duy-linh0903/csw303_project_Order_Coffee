// VND Currency Formatter
function formatVND(amount) {
    return amount.toLocaleString('vi-VN') + '₫';
}

// Global State
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    updateMemberCard();
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
        authLink.onclick = showUserMenu;
    } else {
        authText.textContent = 'Sign In';
        authLink.innerHTML = `<i class="fas fa-sign-in-alt"></i><span>Sign In</span>`;
        authLink.onclick = () => window.location.href = 'admin-login.html';
    }
}

// Show User Menu
function showUserMenu(event) {
    event.preventDefault();
    
    // Get button position for dropdown placement
    const authLink = document.getElementById('authLink');
    const rect = authLink.getBoundingClientRect();
    
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
                <a href="index.html#rewards" class="user-menu-item">
                    <i class="fas fa-gift"></i>
                    <span>Điểm thưởng</span>
                    <i class="fas fa-chevron-right"></i>
                </a>
                <a href="membercard.html" class="user-menu-item">
                    <i class="fas fa-id-card"></i>
                    <span>Thẻ thành viên</span>
                    <i class="fas fa-chevron-right"></i>
                </a>
                <div class="user-menu-divider"></div>
                <a href="#" onclick="logout(event)" class="user-menu-item user-menu-logout">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Đăng xuất</span>
                </a>
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
    
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
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
        
        // Get user points
        const userPoints = currentUser.points || 0;
        
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
        
        // Highlight current tier card
        document.querySelectorAll('.tier-card').forEach(card => {
            card.classList.remove('current-tier');
        });
        
        if (tier !== 'none') {
            const currentTierCard = document.querySelector(`.tier-card[data-tier="${tier}"]`);
            if (currentTierCard) {
                currentTierCard.classList.add('current-tier');
            }
        }
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
