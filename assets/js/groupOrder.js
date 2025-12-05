// Group Order Management

let currentGroupRoom = null;
let groupOrderInterval = null;

// Helper function to check if in group order mode
function isInGroupOrderMode() {
    return currentGroupRoom !== null && currentGroupRoom !== undefined;
}

// Helper function to get current group room
function getCurrentGroupRoom() {
    return currentGroupRoom;
}

// Initialize group order listeners
document.addEventListener('DOMContentLoaded', function() {
    const groupOrderBtn = document.getElementById('groupOrderBtn');
    if (groupOrderBtn) {
        groupOrderBtn.addEventListener('click', openGroupOrderModal);
    }
    
    // Add to group button
    const addToGroupBtn = document.getElementById('addToGroupBtn');
    if (addToGroupBtn) {
        addToGroupBtn.addEventListener('click', addCartToGroupOrder);
    }

    // Handle create group form
    const createGroupForm = document.getElementById('createGroupForm');
    if (createGroupForm) {
        createGroupForm.addEventListener('submit', handleCreateGroup);
    }

    // Join group form
    const joinGroupForm = document.getElementById('joinGroupForm');
    if (joinGroupForm) {
        joinGroupForm.addEventListener('submit', handleJoinGroup);
    }

    // Check if user came from a group link
    checkGroupLinkInURL();
    
    // Restore group room from session
    restoreGroupRoomFromSession();

    // Listen for storage changes (for real-time updates across tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom event (for same-tab updates)
    window.addEventListener('groupRoomUpdated', handleGroupRoomUpdated);
});

// Check if URL contains group code
function checkGroupLinkInURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const groupCode = urlParams.get('group');
    
    if (groupCode) {
        setTimeout(() => {
            joinGroupByCode(groupCode);
        }, 500);
    }
}

// Restore group room from session
function restoreGroupRoomFromSession() {
    const savedRoom = sessionStorage.getItem('currentGroupRoom');
    if (savedRoom) {
        try {
            const parsedRoom = JSON.parse(savedRoom);
            // Verify room still exists and is active
            const groupRooms = JSON.parse(localStorage.getItem('groupRooms') || '[]');
            const room = groupRooms.find(r => r.code === parsedRoom.code && r.status === 'active');
            
            if (room) {
                currentGroupRoom = room;
                // Update session with latest room data
                sessionStorage.setItem('currentGroupRoom', JSON.stringify(room));
                
                // Wait a bit for DOM to be ready
                setTimeout(() => {
                    updateGroupOrderUI();
                    console.log('Restored group room:', currentGroupRoom.name);
                }, 100);
            } else {
                // Room no longer exists
                console.log('Group room no longer active, clearing session');
                sessionStorage.removeItem('currentGroupRoom');
                currentGroupRoom = null;
            }
        } catch (e) {
            console.error('Error restoring group room:', e);
            sessionStorage.removeItem('currentGroupRoom');
            currentGroupRoom = null;
        }
    }
}

// Update UI to show/hide group order elements
function updateGroupOrderUI() {
    const groupOrderStatus = document.getElementById('groupOrderStatus');
    const addToGroupBtn = document.getElementById('addToGroupBtn');
    const groupOrderBtn = document.getElementById('groupOrderBtn');
    
    if (currentGroupRoom) {
        // Show group status
        if (groupOrderStatus) {
            groupOrderStatus.style.display = 'block';
            document.getElementById('currentGroupRoomName').textContent = currentGroupRoom.name;
            document.getElementById('currentGroupRoomCode').textContent = currentGroupRoom.code;
        }
        
        // Show add to group button, hide join button
        if (addToGroupBtn) addToGroupBtn.style.display = 'block';
        if (groupOrderBtn) groupOrderBtn.style.display = 'none';
    } else {
        // Hide group status
        if (groupOrderStatus) groupOrderStatus.style.display = 'none';
        
        // Hide add to group button, show join button
        if (addToGroupBtn) addToGroupBtn.style.display = 'none';
        if (groupOrderBtn) groupOrderBtn.style.display = 'block';
    }
}

// Leave group room
function leaveGroupRoom() {
    if (!currentGroupRoom) return;
    
    const roomName = currentGroupRoom.name;
    
    // Clear current room
    currentGroupRoom = null;
    sessionStorage.removeItem('currentGroupRoom');
    
    // Update UI
    updateGroupOrderUI();
    
    // Close group room modal if open
    const modal = document.getElementById('groupRoomModal');
    if (modal) modal.style.display = 'none';
    
    // Stop polling
    if (groupOrderInterval) {
        clearInterval(groupOrderInterval);
        groupOrderInterval = null;
    }
    
    showNotification(`Đã rời khỏi phòng "${roomName}"`);
}

// View group order details
function viewGroupOrderDetails() {
    // Try to restore from session if not in memory
    if (!currentGroupRoom) {
        const savedRoom = sessionStorage.getItem('currentGroupRoom');
        if (savedRoom) {
            try {
                currentGroupRoom = JSON.parse(savedRoom);
            } catch (e) {
                console.error('Error restoring group room:', e);
            }
        }
    }
    
    if (!currentGroupRoom) {
        showNotification('Bạn chưa tham gia phòng nào!', 'error');
        return;
    }
    
    // Refresh room data from localStorage
    const groupRooms = JSON.parse(localStorage.getItem('groupRooms') || '[]');
    const room = groupRooms.find(r => r.code === currentGroupRoom.code);
    
    if (room) {
        currentGroupRoom = room;
        sessionStorage.setItem('currentGroupRoom', JSON.stringify(room));
        openGroupRoom(currentGroupRoom.code);
    } else {
        showNotification('Không tìm thấy phòng!', 'error');
        leaveGroupRoom();
    }
}

// Add all cart items to group order
function addCartToGroupOrder() {
    // Try to restore from session if not in memory
    if (!currentGroupRoom) {
        const savedRoom = sessionStorage.getItem('currentGroupRoom');
        if (savedRoom) {
            try {
                currentGroupRoom = JSON.parse(savedRoom);
                updateGroupOrderUI();
            } catch (e) {
                console.error('Error restoring group room:', e);
            }
        }
    }
    
    if (!currentGroupRoom) {
        showNotification('Bạn chưa tham gia phòng nào!', 'error');
        return;
    }
    
    // Get cart from main.js
    if (typeof cart === 'undefined' || !cart || cart.length === 0) {
        showNotification('Giỏ hàng trống!', 'error');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập!', 'error');
        return;
    }
    
    const groupRooms = JSON.parse(localStorage.getItem('groupRooms') || '[]');
    const roomIndex = groupRooms.findIndex(r => r.code === currentGroupRoom.code);
    
    if (roomIndex === -1) {
        showNotification('Không tìm thấy phòng!', 'error');
        leaveGroupRoom();
        return;
    }
    
    // Add all cart items to group order
    let addedCount = 0;
    cart.forEach(item => {
        const orderItem = {
            ...item,
            userEmail: currentUser.email,
            userName: currentUser.name,
            addedAt: new Date().toISOString(),
            price: item.totalPrice || item.price
        };
        
        groupRooms[roomIndex].orders.push(orderItem);
        addedCount++;
    });
    
    // Save changes
    localStorage.setItem('groupRooms', JSON.stringify(groupRooms));
    currentGroupRoom = groupRooms[roomIndex];
    sessionStorage.setItem('currentGroupRoom', JSON.stringify(currentGroupRoom));
    
    // Trigger update event
    window.dispatchEvent(new CustomEvent('groupRoomUpdated', { 
        detail: { roomCode: currentGroupRoom.code } 
    }));
    
    // Clear personal cart
    if (typeof clearCart === 'function') {
        clearCart();
    } else {
        cart.length = 0;
        if (typeof updateCart === 'function') updateCart();
    }
    
    showNotification(`Đã thêm ${addedCount} món vào đơn hàng nhóm!`);
    
    // Open group room to show updated orders
    openGroupRoom(currentGroupRoom.code);
}

// Generate random group code
function generateGroupCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Open group order modal
function openGroupOrderModal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để sử dụng tính năng đặt hàng nhóm', 'error');
        return;
    }
    
    // If already in a room, open room details instead
    if (currentGroupRoom) {
        viewGroupOrderDetails();
        return;
    }

    const modal = document.getElementById('groupOrderModal');
    modal.style.display = 'block';
}

// Close group order modal
function closeGroupOrderModal() {
    const modal = document.getElementById('groupOrderModal');
    modal.style.display = 'none';
    
    // Reset forms
    document.getElementById('createGroupForm').reset();
    document.getElementById('joinGroupForm').reset();
}

// Switch tabs
function switchGroupTab(tab) {
    const tabs = document.querySelectorAll('.group-tab');
    const createTab = document.getElementById('createGroupTab');
    const joinTab = document.getElementById('joinGroupTab');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'create') {
        tabs[0].classList.add('active');
        createTab.style.display = 'block';
        joinTab.style.display = 'none';
    } else {
        tabs[1].classList.add('active');
        createTab.style.display = 'none';
        joinTab.style.display = 'block';
    }
}

// Handle create group
function handleCreateGroup(e) {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    const roomName = document.getElementById('groupRoomName').value.trim();
    
    if (!roomName) {
        showNotification('Vui lòng nhập tên phòng', 'error');
        return;
    }

    const groupCode = generateGroupCode();
    const groupRoom = {
        code: groupCode,
        name: roomName,
        host: {
            email: currentUser.email,
            name: currentUser.name
        },
        participants: [{
            email: currentUser.email,
            name: currentUser.name,
            isHost: true,
            joinedAt: new Date().toISOString()
        }],
        orders: [],
        createdAt: new Date().toISOString(),
        status: 'active'
    };

    // Save to localStorage
    const groupRooms = JSON.parse(localStorage.getItem('groupRooms') || '[]');
    groupRooms.push(groupRoom);
    localStorage.setItem('groupRooms', JSON.stringify(groupRooms));
    
    // Save to session for persistence
    currentGroupRoom = groupRoom;
    sessionStorage.setItem('currentGroupRoom', JSON.stringify(groupRoom));
    
    // Update UI
    updateGroupOrderUI();

    // Close modal and open room
    closeGroupOrderModal();
    openGroupRoom(groupCode);
    
    showNotification(`Đã tạo phòng "${roomName}" thành công!`);
}

// Handle join group
function handleJoinGroup(e) {
    e.preventDefault();
    
    const groupCode = document.getElementById('groupRoomCode').value.trim().toUpperCase();
    
    if (!groupCode || groupCode.length !== 6) {
        showNotification('Mã phòng không hợp lệ', 'error');
        return;
    }

    joinGroupByCode(groupCode);
}

// Join group by code
function joinGroupByCode(groupCode) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để tham gia phòng', 'error');
        setTimeout(() => {
            window.location.href = 'admin/login.html?redirect=' + encodeURIComponent(window.location.href);
        }, 1500);
        return;
    }

    const groupRooms = JSON.parse(localStorage.getItem('groupRooms') || '[]');
    const roomIndex = groupRooms.findIndex(r => r.code === groupCode && r.status === 'active');
    
    if (roomIndex === -1) {
        showNotification('Không tìm thấy phòng hoặc phòng đã đóng', 'error');
        return;
    }

    const room = groupRooms[roomIndex];
    
    // Check if user already in room
    const alreadyJoined = room.participants.some(p => p.email === currentUser.email);
    
    if (!alreadyJoined) {
        room.participants.push({
            email: currentUser.email,
            name: currentUser.name,
            isHost: false,
            joinedAt: new Date().toISOString()
        });
        
        groupRooms[roomIndex] = room;
        localStorage.setItem('groupRooms', JSON.stringify(groupRooms));
        
        // Trigger custom event for same-tab updates
        window.dispatchEvent(new CustomEvent('groupRoomUpdated', { 
            detail: { roomCode: groupCode } 
        }));
        
        showNotification(`Đã tham gia phòng "${room.name}"!`);
    }

    // Save to session for persistence
    currentGroupRoom = room;
    sessionStorage.setItem('currentGroupRoom', JSON.stringify(room));
    
    // Update UI to show group status
    updateGroupOrderUI();

    closeGroupOrderModal();
    openGroupRoom(groupCode);
}

// Open group room
function openGroupRoom(groupCode) {
    const groupRooms = JSON.parse(localStorage.getItem('groupRooms') || '[]');
    const room = groupRooms.find(r => r.code === groupCode);
    
    if (!room) {
        showNotification('Không tìm thấy phòng', 'error');
        return;
    }

    currentGroupRoom = room;
    
    const modal = document.getElementById('groupRoomModal');
    document.getElementById('groupRoomTitle').innerHTML = `<i class="fas fa-users"></i> ${room.name}`;
    document.getElementById('displayGroupCode').textContent = room.code;
    
    // Update participants and orders
    updateGroupRoomDisplay();
    
    modal.style.display = 'block';
    
    // Start polling for updates
    startGroupOrderPolling();
}

// Update group room display
function updateGroupRoomDisplay() {
    if (!currentGroupRoom) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    const isHost = currentGroupRoom.host.email === currentUser.email;
    
    // Update participants list
    const participantsList = document.getElementById('participantsList');
    participantsList.innerHTML = currentGroupRoom.participants.map(p => `
        <div class="participant-item">
            <div class="participant-avatar">${p.name.charAt(0).toUpperCase()}</div>
            <div class="participant-info">
                <div class="participant-name">
                    ${p.name}
                    ${p.isHost ? '<span class="participant-host"><i class="fas fa-crown"></i> Host</span>' : ''}
                </div>
                <div class="participant-role">
                    ${p.isHost ? 'Người tạo phòng' : 'Thành viên'}
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('participantCount').textContent = currentGroupRoom.participants.length;
    
    // Update orders list
    const ordersList = document.getElementById('groupOrdersList');
    
    if (currentGroupRoom.orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-group-orders">
                <i class="fas fa-shopping-bag"></i>
                <p>Chưa có đơn hàng nào</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">
                    Thêm món từ menu để bắt đầu đặt hàng nhóm
                </p>
            </div>
        `;
    } else {
        // Group orders by user
        const ordersByUser = {};
        currentGroupRoom.orders.forEach(order => {
            if (!ordersByUser[order.userEmail]) {
                ordersByUser[order.userEmail] = {
                    userName: order.userName,
                    items: []
                };
            }
            ordersByUser[order.userEmail].items.push(order);
        });
        
        ordersList.innerHTML = Object.entries(ordersByUser).map(([email, data]) => `
            <div class="group-order-item">
                <div class="group-order-header">
                    <div class="group-order-user">
                        <i class="fas fa-user-circle"></i>
                        ${data.userName}
                    </div>
                    <div style="font-weight: 600; color: var(--primary-color);">
                        ${formatVND(data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                    </div>
                </div>
                <div class="group-order-products">
                    ${data.items.map(item => {
                        const custom = item.customizations || {};
                        const details = [];
                        if (custom.size) details.push(custom.size);
                        if (custom.temperature) details.push(custom.temperature);
                        if (custom.milk && custom.milk !== 'Regular') details.push(custom.milk);
                        if (custom.sugar && custom.sugar !== '100%') details.push('Sugar: ' + custom.sugar);
                        if (custom.ice && custom.ice !== '100%') details.push('Ice: ' + custom.ice);
                        if (custom.extraShots > 0) details.push('+' + custom.extraShots + ' shot');
                        
                        return `
                        <div class="group-product-item">
                            <div class="group-product-info">
                                <div class="group-product-quantity">${item.quantity}x</div>
                                <div>
                                    <div class="group-product-name">${item.name}</div>
                                    ${details.length > 0 ? `<div class="group-product-details">${details.join(' • ')}</div>` : ''}
                                </div>
                            </div>
                            <div class="group-product-price">${formatVND(item.price * item.quantity)}</div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');
    }
    
    // Calculate total
    const totalAmount = currentGroupRoom.orders.reduce((sum, order) => 
        sum + (order.price * order.quantity), 0
    );
    
    document.getElementById('groupTotalAmount').textContent = formatVND(totalAmount);
    
    // Show/hide checkout button based on role
    const checkoutBtn = document.getElementById('groupCheckoutBtn');
    if (isHost) {
        checkoutBtn.style.display = 'flex';
    } else {
        checkoutBtn.style.display = 'none';
    }
}

// Start polling for updates
function startGroupOrderPolling() {
    // Clear existing interval
    if (groupOrderInterval) {
        clearInterval(groupOrderInterval);
    }
    
    // Poll every 2 seconds
    groupOrderInterval = setInterval(() => {
        if (currentGroupRoom) {
            const groupRooms = JSON.parse(localStorage.getItem('groupRooms') || '[]');
            const updatedRoom = groupRooms.find(r => r.code === currentGroupRoom.code);
            
            if (updatedRoom) {
                currentGroupRoom = updatedRoom;
                updateGroupRoomDisplay();
            }
        }
    }, 2000);
}

// Handle storage changes (for cross-tab communication)
function handleStorageChange(e) {
    if (e.key === 'groupRooms' && currentGroupRoom) {
        const groupRooms = JSON.parse(e.newValue || '[]');
        const updatedRoom = groupRooms.find(r => r.code === currentGroupRoom.code);
        
        if (updatedRoom) {
            currentGroupRoom = updatedRoom;
            updateGroupRoomDisplay();
        }
    }
}

// Handle custom event for same-tab updates
function handleGroupRoomUpdated(e) {
    if (!currentGroupRoom || !e.detail || !e.detail.roomCode) return;
    
    if (e.detail.roomCode === currentGroupRoom.code) {
        const groupRooms = JSON.parse(localStorage.getItem('groupRooms') || '[]');
        const updatedRoom = groupRooms.find(r => r.code === currentGroupRoom.code);
        
        if (updatedRoom) {
            currentGroupRoom = updatedRoom;
            updateGroupRoomDisplay();
        }
    }
}

// Close group room
function closeGroupRoom() {
    const modal = document.getElementById('groupRoomModal');
    modal.style.display = 'none';
    
    currentGroupRoom = null;
    
    // Clear polling interval
    if (groupOrderInterval) {
        clearInterval(groupOrderInterval);
        groupOrderInterval = null;
    }
}

// Copy group code
function copyGroupCode() {
    const code = document.getElementById('displayGroupCode').textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Đã sao chép mã phòng!');
    }).catch(() => {
        // Fallback for older browsers
        const tempInput = document.createElement('input');
        tempInput.value = code;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showNotification('Đã sao chép mã phòng!');
    });
}

// Share group link
function shareGroupLink() {
    const code = currentGroupRoom.code;
    const url = `${window.location.origin}${window.location.pathname}?group=${code}`;
    
    if (navigator.share) {
        navigator.share({
            title: `Tham gia đặt hàng nhóm: ${currentGroupRoom.name}`,
            text: `Mã phòng: ${code}`,
            url: url
        }).then(() => {
            showNotification('Đã chia sẻ link!');
        }).catch(() => {
            copyLinkToClipboard(url);
        });
    } else {
        copyLinkToClipboard(url);
    }
}

// Copy link to clipboard
function copyLinkToClipboard(url) {
    navigator.clipboard.writeText(url).then(() => {
        showNotification('Đã sao chép link chia sẻ!');
    }).catch(() => {
        // Fallback
        const tempInput = document.createElement('input');
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showNotification('Đã sao chép link chia sẻ!');
    });
}

// Add item to group order (deprecated - now using addCartToGroupOrder)
function addToGroupOrder(item) {
    if (!currentGroupRoom) return false;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    
    if (!currentUser) return false;
    
    const orderItem = {
        ...item,
        userEmail: currentUser.email,
        userName: currentUser.name,
        addedAt: new Date().toISOString(),
        price: item.totalPrice || item.price
    };
    
    const groupRooms = JSON.parse(localStorage.getItem('groupRooms') || '[]');
    const roomIndex = groupRooms.findIndex(r => r.code === currentGroupRoom.code);
    
    if (roomIndex !== -1) {
        groupRooms[roomIndex].orders.push(orderItem);
        localStorage.setItem('groupRooms', JSON.stringify(groupRooms));
        
        currentGroupRoom = groupRooms[roomIndex];
        sessionStorage.setItem('currentGroupRoom', JSON.stringify(currentGroupRoom));
        updateGroupRoomDisplay();
        
        // Trigger custom event for same-tab updates
        window.dispatchEvent(new CustomEvent('groupRoomUpdated', { 
            detail: { roomCode: currentGroupRoom.code } 
        }));
        
        return true;
    }
    
    return false;
}

// Checkout group order
function checkoutGroupOrder() {
    if (!currentGroupRoom) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    
    if (currentGroupRoom.host.email !== currentUser.email) {
        showNotification('Chỉ host mới có thể thanh toán!', 'error');
        return;
    }
    
    if (currentGroupRoom.orders.length === 0) {
        showNotification('Chưa có đơn hàng nào để thanh toán!', 'error');
        return;
    }
    
    // Create combined order
    const totalAmount = currentGroupRoom.orders.reduce((sum, order) => 
        sum + (order.price * order.quantity), 0
    );
    
    const tax = totalAmount * 0.1;
    const finalTotal = totalAmount + tax;
    
    // Show payment modal
    const paymentModal = document.getElementById('paymentModal');
    document.getElementById('paymentTotal').textContent = formatVND(finalTotal);
    
    // Store group order info for payment
    sessionStorage.setItem('pendingGroupOrder', JSON.stringify({
        roomCode: currentGroupRoom.code,
        roomName: currentGroupRoom.name,
        orders: currentGroupRoom.orders,
        participants: currentGroupRoom.participants,
        subtotal: totalAmount,
        tax: tax,
        total: finalTotal
    }));
    
    closeGroupRoom();
    paymentModal.style.display = 'block';
    
    showNotification('Đang chuyển đến thanh toán...');
}

// Handle group order payment completion (called from main.js)
function completeGroupOrderPayment() {
    const pendingGroupOrder = JSON.parse(sessionStorage.getItem('pendingGroupOrder') || 'null');
    
    if (!pendingGroupOrder) return null;
    
    // Mark room as completed
    const groupRooms = JSON.parse(localStorage.getItem('groupRooms') || '[]');
    const roomIndex = groupRooms.findIndex(r => r.code === pendingGroupOrder.roomCode);
    
    if (roomIndex !== -1) {
        groupRooms[roomIndex].status = 'completed';
        groupRooms[roomIndex].completedAt = new Date().toISOString();
        localStorage.setItem('groupRooms', JSON.stringify(groupRooms));
    }
    
    // Clear pending order
    sessionStorage.removeItem('pendingGroupOrder');
    
    return pendingGroupOrder;
}
