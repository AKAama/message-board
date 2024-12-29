let currentTab = 'featured';
let pendingMessage = null;

// 添加API基础URL
const API_URL = 'http://127.0.0.1:5000/api';

function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    document.getElementById('featuredMessages').style.display = tab === 'featured' ? 'block' : 'none';
    document.getElementById('normalMessages').style.display = tab === 'normal' ? 'block' : 'none';
    currentTab = tab;
}

function showModal() {
    const name = document.getElementById('nameInput').value.trim();
    const content = document.getElementById('messageInput').value.trim();
    
    if (!name || !content) {
        alert('请填写名字和留言内容！');
        return;
    }

    pendingMessage = {
        author: name,
        content: content,
    };

    console.log('准备发送消息:', {
        author: name,
        content: content,
        hasImage: !!window.pendingImage
    });
    
    document.getElementById('confirmModal').classList.add('show');
    document.querySelectorAll('input[name="answer"]').forEach(radio => radio.checked = false);
    document.getElementById('sincereMessage').style.display = 'none';
}

function closeModal() {
    document.getElementById('confirmModal').classList.remove('show');
    pendingMessage = null;
}

function submitMessage() {
    const answer = document.querySelector('input[name="answer"]:checked');
    if (!answer) {
        alert('请选择一个选项');
        return;
    }

    const isFeatured = answer.value === 'yes';
    
    if (isFeatured) {
        document.getElementById('sincereMessage').style.display = 'block';
    }
    saveMessage(isFeatured);
}

// 修改保存消息函数
async function saveMessage(isFeatured) {
    if (!pendingMessage) return;

    try {
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                author: pendingMessage.author,
                content: pendingMessage.content,
                isFeatured: isFeatured,
            })
        });

        if (!response.ok) {
            throw new Error('发送失败');
        }

        // 清除所有数据
        document.getElementById('nameInput').value = '';
        document.getElementById('messageInput').value = '';
        document.getElementById('confirmModal').classList.remove('show');
        pendingMessage = null;
        
        loadMessages();
    } catch (error) {
        console.error('保存消息失败:', error);
        alert('保存消息失败，请稍后重试');
    }
}

function createMessageElement(message) {
    const div = document.createElement('div');
    div.className = 'message';
    
    const timestamp = new Date(message.timestamp).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    div.innerHTML = `
        <div class="message-header">
            <span class="author">
                <span class="author-name">${escapeHtml(message.author)}</span>
                ${message.isFeatured ? '<span class="featured-badge">精选</span>' : ''}
            </span>
            <span class="message-time">
                ${timestamp}
                ${isAdmin ? `<button class="delete-btn" onclick="deleteMessage(${message.id})">删除</button>` : ''}
            </span>
        </div>
        <div class="message-content">${escapeHtml(message.content)}</div>
    `;
    return div;
}

// 修改加载消息函数
async function loadMessages() {
    try {
        const response = await fetch(`${API_URL}/messages`);
        const messages = await response.json();
        
        const featuredMessages = document.getElementById('featuredMessages');
        const normalMessages = document.getElementById('normalMessages');
        
        featuredMessages.innerHTML = '';
        normalMessages.innerHTML = '';

        const featured = messages.filter(m => m.isFeatured);
        const normal = messages.filter(m => !m.isFeatured);

        if (featured.length === 0) {
            featuredMessages.innerHTML = '<div class="empty-message">还没有精选留言...</div>';
        }

        if (normal.length === 0) {
            normalMessages.innerHTML = '<div class="empty-message">还没有普通留言...</div>';
        }

        featured.forEach(message => {
            featuredMessages.appendChild(createMessageElement(message));
        });

        normal.forEach(message => {
            normalMessages.appendChild(createMessageElement(message));
        });
    } catch (error) {
        console.error('加载消息失败:', error);
        alert('加载消息失败，请稍后重试');
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.onload = loadMessages;

// 添加回车发送功能
document.getElementById('messageInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        showModal();
    }
});

// 监听单选框变化
document.querySelectorAll('input[name="answer"]').forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'yes') {
            document.getElementById('sincereMessage').style.display = 'block';
        } else {
            document.getElementById('sincereMessage').style.display = 'none';
        }
    });
});

// 添加以下代码到原有的 JavaScript 中

// 管理员状态标志
let isAdmin = false;
const ADMIN_PASSWORD = '123456'; // 这里设置管理员密码

// 添加管理员登录函数
function toggleAdmin() {
    if (isAdmin) {
        isAdmin = false;
        document.body.classList.remove('admin-mode');
        loadMessages(); // 重新加载消息，移除删除按钮
        return;
    }
    
    const password = prompt('请输入管理员密码：');
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        document.body.classList.add('admin-mode');
        loadMessages(); // 重新加载消息，显示删除按钮
        alert('已进入管理员模式');
    } else if (password !== null) {
        alert('密码错误！');
    }
}

// 修改删除消息函数
async function deleteMessage(messageId) {
    if (!isAdmin) return;
    
    if (confirm('确定要删除这条留言吗？')) {
        try {
            const response = await fetch(`${API_URL}/messages/${messageId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('删除失败');
            }

            loadMessages();
        } catch (error) {
            console.error('删除消息失败:', error);
            alert('删除消息失败，请稍后重试');
        }
    }
}

// 添加回到顶部功能
const backToTopButton = document.getElementById('backToTop');

// 监听滚动事件
window.onscroll = function() {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        backToTopButton.style.display = 'flex';
    } else {
        backToTopButton.style.display = 'none';
    }
};

// 点击回到顶部
backToTopButton.onclick = function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'  // 平滑滚动
    });
};