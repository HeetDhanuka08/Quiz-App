const form = document.querySelector('.user-form');
const userName = document.getElementById('user-name');
const quesCountButtons = document.querySelectorAll('.ques-count-buttons button');
const quesCategory = document.getElementById('ques-category');
const container = document.querySelector('.container');
const quesContainer = document.querySelector('.ques-container');

container.style.transform = 'translateZ(20px)';
quesContainer.style.transform = 'translateZ(20px)';

let userNameValue = '';
let selectedQuestionCount = 10;
let quesCategoryValue = 'mixed';
let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let timerEnabled = false;
let timeLeft = 15;
let timerInterval = null;

// API Configuration
const API_BASE_URL = 'https://opentdb.com/api.php';
const CATEGORY_MAP = {
    'mixed': '',
    'general_knowledge': 9, // General Knowledge
    'books': 10, //  Books
    'film': 11, //  Film
    'music': 12, //  Music
    'musicals_theatres': 13, //  Musicals & Theatres
    'television': 14, //  Television
    'video_games': 15, //  Video Games
    'board_games': 16, //  Board Games
    'science_nature': 17, // Science & Nature
    'science_computers': 18, //  Computers
    'science_mathematics': 19, //  Mathematics
    'mythology': 20, // Mythology
    'sports': 21, // Sports
    'geography': 22, // Geography
    'history': 23, // History
    'politics': 24, // Politics
    'art': 25, // Art
    'celebrities': 26, // Celebrities
    'animals': 27, // Animals
    'vehicles': 28, // Vehicles
    'comics': 29, //  Comics
    'gadgets': 30, //  Gadgets
    'anime_manga': 31, //  Japanese Anime & Manga
    'cartoon_animations': 32 //  Cartoon & Animations
};

// Set default selected for 10 questions
quesCountButtons.forEach((btn, idx) => {
    if (btn.textContent === '10') btn.classList.add('selected');
    btn.addEventListener('click', () => {
        quesCountButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get user inputs
    userNameValue = userName.value.trim();
    selectedQuestionCount = parseInt(document.querySelector('.ques-count-buttons button.selected').textContent);
    quesCategoryValue = quesCategory.value;
    timerEnabled = document.getElementById('timer-toggle').checked;

    // Hide the form container immediately
    container.style.display = 'none';
    
    // Show loading state
    showLoadingState();

    try {
        // Fetch questions from API
        await fetchQuestions();
        
        // Show the question container
        quesContainer.style.display = 'flex';
        showQuestion();
    } catch (error) {
        console.error('Error fetching questions:', error);
        showErrorState();
    }
});

// Function to show loading state
function showLoadingState() {
    const loadingHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="font-size: 1.2rem; color: #4ecdc4; margin-bottom: 20px;">
                Loading questions...
            </div>
            <div style="width: 40px; height: 40px; border: 4px solid rgba(78, 205, 196, 0.3); border-top: 4px solid #4ecdc4; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    quesContainer.innerHTML = loadingHTML;
    quesContainer.style.display = 'flex';
}

// Function to show error state
function showErrorState() {
    const errorHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="font-size: 1.2rem; color: #ff6b6b; margin-bottom: 20px;">
                Failed to load questions. Please try again.
            </div>
            <button onclick="location.reload()" style="background: linear-gradient(135deg, #4ecdc4 0%, #45b7d1 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                Retry
            </button>
        </div>
    `;
    quesContainer.innerHTML = errorHTML;
    quesContainer.style.display = 'flex';
}

// Function to fetch questions from API
async function fetchQuestions() {
    const categoryId = CATEGORY_MAP[quesCategoryValue];
    let apiUrl = `${API_BASE_URL}?amount=${selectedQuestionCount}&type=multiple`;
    
    if (categoryId) {
        apiUrl += `&category=${categoryId}`;
    }

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.response_code === 0) {
            questions = data.results.map(question => ({
                question: decodeHtmlEntities(question.question),
                options: shuffleArray([
                    ...question.incorrect_answers.map(incorrect => decodeHtmlEntities(incorrect)),
                    decodeHtmlEntities(question.correct_answer)
        ]),
                correct: question.incorrect_answers.length, // Index of correct answer after shuffling
                category: question.category
            }));
        } else {
            throw new Error('API returned error code: ' + data.response_code);
        }
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Function to decode HTML entities
function decodeHtmlEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

// Function to shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Timer functions
function startTimer() {
    if (!timerEnabled) return;
    
    timeLeft = 15;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimerExpired();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const timerDisplay = document.querySelector('.timer-text');
    if (timerDisplay) {
        timerDisplay.textContent = timeLeft;
        
        // Add warning classes based on time left
        timerDisplay.classList.remove('timer-warning', 'timer-critical');
        if (timeLeft <= 5) {
            timerDisplay.classList.add('timer-critical');
        } else if (timeLeft <= 8) {
            timerDisplay.classList.add('timer-warning');
        }
    }
}

function handleTimerExpired() {
    // Auto-submit the current question
    const nextBtn = document.querySelector('#next-btn');
    if (nextBtn && !nextBtn.disabled) {
        nextBtn.click();
    } else if (nextBtn && nextBtn.disabled) {
        // If no option selected, mark as wrong and move to next
        currentQuestionIndex++;
        showQuestion();
    }
}

// Function to show current question
function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        stopTimer();
        showResults();
        return;
    }

    const question = questions[currentQuestionIndex];
    
    // Reset timer for new question
    if (timerEnabled) {
        stopTimer();
        startTimer();
    }
    
    const timerHTML = timerEnabled ? `
        <div class="timer-display">
            <svg class="timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
            <span class="timer-text">15</span>
        </div>
    ` : '';
    
    const questionHTML = `
        ${timerHTML}
        <div class="question-header">
            <div class="question-count">Question ${currentQuestionIndex + 1} of ${questions.length}</div>
        </div>
        <div class="question">
            <h2>${question.question}</h2>
        </div>
        <div class="options">
            ${question.options.map((option, index) => `
                <div class="option" data-index="${index}">
                    <div class="option-marker">${String.fromCharCode(65 + index)}</div>
                    <div class="option-text">${option}</div>
                </div>
            `).join('')}
        </div>
        <div class="navigation">
            <button class="nav-btn" id="next-btn" disabled>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                Next Question
            </button>
        </div>
    `;

    quesContainer.innerHTML = questionHTML;

    // Add event listeners to options
    const optionElements = quesContainer.querySelectorAll('.option');
    const nextBtn = quesContainer.querySelector('#next-btn');
    let selectedOption = null;

    optionElements.forEach((option, index) => {
        option.addEventListener('click', () => {
            if (selectedOption !== null) return; // Prevent multiple selections

            selectedOption = index;
            option.classList.add('selected');
            nextBtn.disabled = false;

            // Stop timer when answer is selected
            stopTimer();

            // Check if answer is correct
            if (index === question.correct) {
                score++;
                option.classList.add('correct');
            } else {
                option.classList.add('wrong');
                // Highlight correct answer
                optionElements[question.correct].classList.add('correct');
            }

            // Disable all options
            optionElements.forEach(opt => opt.style.pointerEvents = 'none');
        });
    });

    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        showQuestion();
    });
}

// Function to show results
function showResults() {
    const percentage = Math.round((score / questions.length) * 100);
    const categoryName = questions[0]?.category || 'Mixed';
    
    let message = '';
    let messageClass = '';
    
    if (percentage >= 80) {
        message = 'Excellent!';
        messageClass = 'excellent';
    } else if (percentage >= 60) {
        message = 'Good job!';
        messageClass = 'good';
    } else if (percentage >= 40) {
        message = 'Not bad!';
        messageClass = 'average';
    } else {
        message = 'Keep practicing!';
        messageClass = 'poor';
    }

    const resultsHTML = `
        <div class="results">
            <h2>Quiz Results</h2>
            <div class="user-info">
                <div class="user-name-display">${userNameValue}</div>
                <div class="category-display">${categoryName}</div>
            </div>
            <div class="score-circle ${messageClass}">
                <div class="percentage">${percentage}%</div>
                <div class="score-text">${score}/${questions.length}</div>
            </div>
            <div class="result-message ${messageClass}">${message}</div>
            <div class="result-actions">
                <button class="action-btn" onclick="restartQuiz()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    Restart Quiz
                </button>
                <button class="action-btn" onclick="newQuiz()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                    </svg>
                    New Quiz
                </button>
            </div>
        </div>
    `;

    quesContainer.innerHTML = resultsHTML;
}

// Function to restart quiz
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    questions = [];
    stopTimer();
    
    quesContainer.style.display = 'none';
    container.style.display = 'block';
    
    // Reset form
    userName.value = '';
    quesCountButtons.forEach(btn => btn.classList.remove('selected'));
    quesCountButtons[1].classList.add('selected'); // Select 10 questions by default
    quesCategory.value = 'mixed';
    document.getElementById('timer-toggle').checked = false;
}

// Function to start new quiz
function newQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    questions = [];
    stopTimer();
    
    quesContainer.style.display = 'none';
    container.style.display = 'block';
}