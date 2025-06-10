// Константи для URL API
const API_BASE_URL = 'https://jsonplaceholder.typicode.com';
const POSTS_ENDPOINT = '/posts';

// Елементи DOM
const fetchBtn = document.getElementById('fetchBtn');
const postCountInput = document.getElementById('postCount');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const postsContainer = document.getElementById('postsContainer');

// Ініціалізація додатка
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Додаємо обробники подій
    fetchBtn.addEventListener('click', handleFetchPosts);
    postCountInput.addEventListener('input', validateInput);
    postCountInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleFetchPosts();
        }
    });
    
    // Початкова валідація
    validateInput();
}

function validateInput() {
    const value = postCountInput.value.trim();
    const numValue = parseInt(value);
    
    // Перевірка чи поле не пусте та чи значення коректне
    const isValid = value !== '' && 
                   !isNaN(numValue) && 
                   numValue >= 1 && 
                   numValue <= 100;
    
    fetchBtn.disabled = !isValid;
    
    // Оновлюємо стилі поля введення
    if (value === '') {
        postCountInput.setCustomValidity('Поле не може бути пустим');
    } else if (isNaN(numValue) || numValue < 1) {
        postCountInput.setCustomValidity('Введіть число від 1 до 100');
    } else if (numValue > 100) {
        postCountInput.setCustomValidity('Максимальна кількість постів: 100');
    } else {
        postCountInput.setCustomValidity('');
    }
    
    return isValid;
}

async function handleFetchPosts() {
    // Валідація перед відправкою запиту
    if (!validateInput()) {
        showError('Будь ласка, введіть коректну кількість постів (1-100)');
        return;
    }
    
    const postCount = parseInt(postCountInput.value);
    
    try {
        showLoading(true);
        hideError();
        clearPosts();
        
        const posts = await fetchPosts(postCount);
        displayPosts(posts);
        
    } catch (error) {
        console.error('Помилка при завантаженні постів:', error);
        showError('Не вдалося завантажити пости. Спробуйте ще раз.');
    } finally {
        showLoading(false);
    }
}

async function fetchPosts(limit) {
    const url = `${API_BASE_URL}${POSTS_ENDPOINT}?_limit=${limit}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const posts = await response.json();
    
    if (!Array.isArray(posts)) {
        throw new Error('Отримані дані не є масивом');
    }
    
    return posts;
}

function displayPosts(posts) {
    if (!posts || posts.length === 0) {
        showError('Не знайдено жодного поста');
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    posts.forEach((post, index) => {
        const postCard = createPostCard(post, index);
        fragment.appendChild(postCard);
    });
    
    postsContainer.appendChild(fragment);
    
    // Додаємо анімацію появи
    const cards = postsContainer.querySelectorAll('.post-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });
}

function createPostCard(post, index) {
    const postCard = document.createElement('div');
    postCard.className = 'post-card';
    
    // Валідація даних поста
    const safePost = {
        id: post.id || 'N/A',
        userId: post.userId || 'N/A',
        title: post.title || 'Без заголовка',
        body: post.body || 'Без опису'
    };
    
    postCard.innerHTML = `
        <div class="post-header">
            <div class="post-id">#${safePost.id}</div>
            <div class="user-id">User: ${safePost.userId}</div>
        </div>
        <h3 class="post-title">${escapeHtml(safePost.title)}</h3>
        <p class="post-body">${escapeHtml(safePost.body)}</p>
    `;
    
    return postCard;
}

function showLoading(show) {
    if (show) {
        loadingDiv.classList.remove('hidden');
        fetchBtn.disabled = true;
    } else {
        loadingDiv.classList.add('hidden');
        fetchBtn.disabled = !validateInput();
    }
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    
    // Автоматично приховати помилку через 5 секунд
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';
}

function clearPosts() {
    postsContainer.innerHTML = '';
}

// Функція для екранування HTML для безпеки
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Обробка помилок fetch
window.addEventListener('unhandledrejection', function(event) {
    console.error('Необроблена помилка Promise:', event.reason);
    showError('Виникла неочікувана помилка. Будь ласка, спробуйте ще раз.');
});

// Обробка втрати з'єднання з інтернетом
window.addEventListener('online', function() {
    hideError();
});

window.addEventListener('offline', function() {
    showError('Немає з\'єднання з інтернетом. Перевірте підключення.');
}); 