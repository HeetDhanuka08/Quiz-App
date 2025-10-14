const form = document.querySelector('.user-form');
const userName = document.getElementById('user-name');
const quesCountButtons = document.querySelectorAll('.ques-count-buttons button'); // Get all buttons in the question count section in the form of a NodeList
const quesCategory = document.getElementById('ques-category');
const container = document.querySelector('.container');
const quesContainer = document.querySelector('.ques-container');

container.style.transform = 'translateZ(20px)';
quesContainer.style.transform = 'translateZ(20px)';

let userNameValue = '';
let selectedQuestionCount = 5; // Default question count
let quesCategoryValue = 'mixed'; // Default question category
let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// Set default selected for 5 questions
quesCountButtons.forEach((btn, idx) => {
    if (btn.textContent === '5') btn.classList.add('selected');
    btn.addEventListener('click', () => {
        quesCountButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Get user name
    userNameValue = userName.value.trim();
    // Get selected question count
    selectedQuestionCount = parseInt(document.querySelector('.ques-count-buttons button.selected').textContent);
    // Get selected question category
    quesCategoryValue = quesCategory.value;

    // Prepare questions based on selected category
    prepareQuestions();

    // Hide the form container and show the question container
    container.style.display = 'none';
    quesContainer.style.display = 'flex';
    showQuestion();
});

// Function to prepare questions based on selected category
function prepareQuestions() {
    if (quesCategoryValue === 'mixed') {
        // Create a mixed array from all categories
        const allQuestions = [
            ...arts_and_literature,
            ...film_and_tv,
            ...food_and_drink,
            ...general_knowledge,
            ...geography,
            ...history,
            ...music,
            ...society_and_culture,
            ...sport_and_leisure
        ];

        // Shuffle the array
        shuffleArray(allQuestions);

        // Take only the required number of questions
        questions = allQuestions.slice(0, selectedQuestionCount);
    }
    else {
        // Get questions from the selected category
        const categoryQuestions = eval(quesCategoryValue); // Here eval is used to dynamically access the variable which is defined somewhere else in the code

        // Shuffle the questions
        shuffleArray(categoryQuestions);

        // Take only the required number of questions
        questions = categoryQuestions.slice(0, selectedQuestionCount);
    }
}

// Function to shuffle array (Fisher-Yates algorithm)
// This is the most efficient and reliable way to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to show current question
function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        // Quiz completed, show results
        showResults();
        return;
    }

    const currentQuestion = questions[currentQuestionIndex];

    // Create HTML for the question
    quesContainer.innerHTML = `
        <div class="question-header">
            <div class="question-count">
                <span>Question ${currentQuestionIndex + 1}/${selectedQuestionCount}</span>
            </div>
        </div>
        <div class="question">
            <h2>${currentQuestion.question}</h2>
        </div>
        <div class="options">
            ${currentQuestion.options.map((option, index) => `
                <button class="option" data-index="${index}">
                    <span class="option-marker">${String.fromCharCode(65 + index)}</span>
                    <span class="option-text">${option}</span>
                </button>
            `).join('')}
        </div>
        <div class="navigation">
            <button class="nav-btn" id="lock-btn">
                Lock Option
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </button>
        </div>
    `;

    // Add event listeners to option buttons
    const optionsButtons = quesContainer.querySelectorAll('.option');
    let selectedOption = null;

    optionsButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove selected class from all options
            optionsButtons.forEach(btn => btn.classList.remove('selected'));

            // Add selected class to the clicked option
            button.classList.add('selected');
            selectedOption = button;
        });
    });

    // Add event listener to lock button
    const lockBtn = document.getElementById('lock-btn');

    lockBtn.addEventListener('click', () => {
        if (selectedOption) {
            // Disable all option buttons
            optionsButtons.forEach(button => {
                button.disabled = true;
            })

            // Get selected option index
            const selectedIndex = parseInt(selectedOption.dataset.index);

            // Get correct answer index
            const correctIndex = questions[currentQuestionIndex].correctAnswer;

            // Check if the selected option is correct
            if (selectedIndex === correctIndex) {
                selectedOption.classList.add('correct');
                score++;
            }
            else {
                selectedOption.classList.add('wrong');
                optionsButtons[correctIndex].classList.add('correct');
            }

            // Change lock button to next button
            lockBtn.innerHTML = `
                Next
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            `;
            lockBtn.id = 'next-btn';

            //Add event listener to next button
            lockBtn.addEventListener('click', () => {
                currentQuestionIndex++;
                showQuestion();
            }, { once: true }); // Use { once: true } to ensure the event listener is removed after first use
        }
        else {
            Swal.fire({
                title: "Warning!",
                text: "Please select an option first!",
                icon: "warning",
                confirmButtonText: "Ok",
                customClass:{
                    popup: 'warning-popup',
                }
            });
        }
    });
}

// Function to show results
function showResults() {
    // Calculate percentage
    const percentage = Math.round((score / questions.length) * 100);

    // Determine result message and class based on percentage
    let resultMessage, resultClass;

    if (percentage >= 80) {
        resultMessage = 'Excellent!';
        resultClass = 'excellent';
    } else if (percentage >= 60) {
        resultMessage = 'Good job!';
        resultClass = 'good';
    } else if (percentage >= 40) {
        resultMessage = 'Not bad!';
        resultClass = 'average';
    } else {
        resultMessage = 'Keep practicing!';
        resultClass = 'poor';
    }

    // Create HTML for results
    quesContainer.innerHTML = `
        <div class="results">
            <h2>Quiz Results</h2>
            <div class="user-info">
                <!-- Display the user's name in the results section -->
                <span class="user-name-display">${userNameValue}</span>
                
                <!-- Display the selected category in a readable format: -->
                <!-- - Replaces underscores with spaces (e.g., "arts_and_literature" → "arts and literature") -->
                <!-- - Capitalizes the first letter of each word (e.g., "arts and literature" → "Arts And Literature") -->
                <span class="category-display">${quesCategoryValue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </div>
            <div class="score-circle ${resultClass}">
                <div class="percentage">${percentage}%</div>
                <div class="score-text">${score}/${selectedQuestionCount}</div>
            </div>
            <div class="result-message ${resultClass}">${resultMessage}</div>
            <div class="result-actions">
                <button id="restart-quiz" class="action-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v6h6"></path><path d="M3 13a9 9 0 1 0 3-7.7L3 8"></path></svg>
                    Restart Quiz
                </button>
                <button id="new-quiz" class="action-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3zM12 8v8m-4-4h8"></path></svg>
                    New Quiz
                </button>
            </div>
        </div>
    `;

    // Add event listeners to action buttons
    const restartQuizBtn = document.getElementById('restart-quiz');
    const newQuizBtn = document.getElementById('new-quiz');

    restartQuizBtn.addEventListener('click', () => {
        // Reset quiz with same settings
        currentQuestionIndex = 0;
        score = 0;
        prepareQuestions();
        showQuestion();
    });

    newQuizBtn.addEventListener('click', () => {
        // Reset everything and show form
        currentQuestionIndex = 0;
        score = 0;
        container.style.display = 'block';
        quesContainer.style.display = 'none';
    });
}