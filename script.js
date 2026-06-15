
/**
 * ==========================================================================
 * EDUQUIZ HUB - MAIN JAVASCRIPT APPLICATION CODE
 * Lập trình viên: Antigravity - Senior Full Stack Developer
 * ==========================================================================
 */

// Đợi DOM load hoàn tất trước khi chạy
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. BIẾN TRẠNG THÁI TOÀN CỤC (APPLICATION STATE) ---
    let quizSets = [];
    let attempts = [];

    let currentActiveView = 'view-dashboard';
    let activeQuizSet = null;
    let practiceIndex = 0;

    // Quản lý thời gian bài kiểm tra
    let testTimerInterval = null;
    let testSeconds = 0;

    // Quản lý trạng thái sửa bộ câu hỏi
    let editingQuizId = null;

    // Quản lý trạng thái phiên học Flashcards
    let flashcardDeck = []; // Hàng chờ thẻ ghi nhớ đang học
    let flashcardIndex = 0;
    let flashcardTimerInterval = null;
    let flashcardSeconds = 0;
    let flashcardEasyOriginalCount = 0; // Để thống kê số câu thuộc ngay lập tức
    let isFlashcardFlipped = false; // Trạng thái thẻ đang lật hay không



    // --- 2. TRUY XUẤT PHẦN TỬ DOM (DOM ELEMENTS) ---

    // Sidebar & Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const navCreateQuizBtn = document.getElementById('nav-create-quiz');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const currentDatetimeEl = document.getElementById('current-datetime');

    // Views
    const views = document.querySelectorAll('.app-view');
    const searchBarContainer = document.getElementById('search-bar-container');
    const searchQuizInput = document.getElementById('search-quiz-input');

    // View 1: Dashboard Elements
    const statsTotalSets = document.getElementById('stats-total-sets');
    const statsTotalAttempts = document.getElementById('stats-total-attempts');
    const statsHighestScore = document.getElementById('stats-highest-score');
    const statsAverageAccuracy = document.getElementById('stats-average-accuracy');
    const quizCountBadge = document.getElementById('quiz-count-badge');
    const emptyQuizState = document.getElementById('empty-quiz-state');
    const quizSetsGrid = document.getElementById('quiz-sets-grid');
    const btnQuickCreate = document.getElementById('btn-quick-create');
    const btnEmptyCreate = document.getElementById('btn-empty-create');

    // View 2: Manage Quiz Elements
    const manageTitle = document.getElementById('manage-title');
    const quizManageForm = document.getElementById('quiz-manage-form');
    const manageQuizIdInput = document.getElementById('manage-quiz-id');
    const quizTitleInput = document.getElementById('quiz-title-input');
    const manageQuestionsCount = document.getElementById('manage-questions-count');
    const quizQuestionsRaw = document.getElementById('quiz-questions-raw');
    const btnResetForm = document.getElementById('btn-reset-form');
    const btnCancelManage = document.getElementById('btn-cancel-manage');

    // Tab Elements
    const tabModeText = document.getElementById('tab-mode-text');
    const tabModeForm = document.getElementById('tab-mode-form');
    const manageModeTextContainer = document.getElementById('manage-mode-text-container');
    const manageModeFormContainer = document.getElementById('manage-mode-form-container');
    const questionsListContainer = document.getElementById('questions-list-container');
    const btnAddQuestionRow = document.getElementById('btn-add-question-row');

    // View 3: Practice Elements
    const practiceSetTitle = document.getElementById('practice-set-title');
    const practiceSidebarTitle = document.getElementById('practice-sidebar-title');
    const practiceSidebarCount = document.getElementById('practice-sidebar-count');
    const practiceProgressText = document.getElementById('practice-progress-text');
    const practiceProgressPercent = document.getElementById('practice-progress-percent');
    const practiceProgressBar = document.getElementById('practice-progress-bar');
    const practiceQuestionText = document.getElementById('practice-question-text');
    const practiceChoicesContainer = document.getElementById('practice-choices-container');
    const practiceInputGroup = document.getElementById('practice-input-group');
    const practiceAnswerInput = document.getElementById('practice-answer-input');
    const practiceFeedbackAlert = document.getElementById('practice-feedback-alert');
    const practiceFeedbackIcon = document.getElementById('practice-feedback-icon');
    const practiceFeedbackTitle = document.getElementById('practice-feedback-title');
    const practiceFeedbackDesc = document.getElementById('practice-feedback-desc');
    const btnPracticeCheck = document.getElementById('btn-practice-check');
    const btnPracticeNext = document.getElementById('btn-practice-next');
    const btnExitPractice = document.getElementById('btn-exit-practice');

    // View 4: Test Elements
    const testSetTitle = document.getElementById('test-set-title');
    const testQuestionsList = document.getElementById('test-questions-list');
    const testAnsweredCount = document.getElementById('test-answered-count');
    const testTotalCount = document.getElementById('test-total-count');
    const testTimer = document.getElementById('test-timer');
    const testNavGrid = document.getElementById('test-nav-grid');
    const testSubmissionForm = document.getElementById('test-submission-form');
    const btnExitTest = document.getElementById('btn-exit-test');

    // View 7: Flashcard Elements
    const viewFlashcard = document.getElementById('view-flashcard');
    const flashcardSetTitle = document.getElementById('flashcard-set-title');
    const btnExitFlashcard = document.getElementById('btn-exit-flashcard');
    const flashcardActiveWorkspace = document.getElementById('flashcard-active-workspace');

    // Tracker / Progress
    const flashcardDeckCount = document.getElementById('flashcard-deck-count');
    const fcBadgeHard = document.getElementById('fc-badge-hard');
    const fcBadgeMedium = document.getElementById('fc-badge-medium');
    const fcBadgeEasy = document.getElementById('fc-badge-easy');
    const fcProgressEasy = document.getElementById('fc-progress-easy');
    const fcProgressMedium = document.getElementById('fc-progress-medium');
    const fcProgressHard = document.getElementById('fc-progress-hard');

    // 3D Card Area
    const flashcardClickArea = document.getElementById('flashcard-click-area');
    const flashcardCard3d = document.getElementById('flashcard-card-3d');
    const fcQuestionText = document.getElementById('fc-question-text');
    const fcAnswerText = document.getElementById('fc-answer-text');
    const fcOptionsList = document.getElementById('fc-options-list');

    // Controls
    const fcControlFront = document.getElementById('fc-control-front');
    const btnFcFlip = document.getElementById('btn-fc-flip');
    const fcControlBack = document.getElementById('fc-control-back');
    const btnFcHard = document.getElementById('btn-fc-hard');
    const btnFcMedium = document.getElementById('btn-fc-medium');
    const btnFcEasy = document.getElementById('btn-fc-easy');

    // Complete Screen
    const flashcardCompletePanel = document.getElementById('flashcard-complete-panel');
    const fcConfettiCanvas = document.getElementById('fc-confetti-canvas');
    const fcTotalFinished = document.getElementById('fc-total-finished');
    const fcEasyCount = document.getElementById('fc-easy-count');
    const fcTotalTime = document.getElementById('fc-total-time');
    const btnFcRestart = document.getElementById('btn-fc-restart');
    const btnFcHome = document.getElementById('btn-fc-home');

    // View 5: Results Elements
    const resultsQuizTitle = document.getElementById('results-quiz-title');
    const resultProgressRing = document.getElementById('result-progress-ring');
    const resultPercentage = document.getElementById('result-percentage');
    const resultFraction = document.getElementById('result-fraction');
    const resultRatingText = document.getElementById('result-rating-text');
    const resultDuration = document.getElementById('result-duration');
    const resultCorrectCount = document.getElementById('result-correct-count');
    const resultIncorrectCount = document.getElementById('result-incorrect-count');
    const resultsReviewContainer = document.getElementById('results-review-container');
    const btnResultsHome = document.getElementById('btn-results-home');
    const btnResultsRetry = document.getElementById('btn-results-retry');
    const btnResultsPractice = document.getElementById('btn-results-practice');

    // View 6: Stats View Elements
    const btnClearHistory = document.getElementById('btn-clear-history');
    const historyTotalCount = document.getElementById('history-total-count');
    const historyMaxAcc = document.getElementById('history-max-acc');
    const historyAvgAcc = document.getElementById('history-avg-acc');
    const historyAvgTime = document.getElementById('history-avg-time');
    const historyCountBadge = document.getElementById('history-count-badge');
    const emptyHistoryState = document.getElementById('empty-history-state');
    const historyTableContainer = document.getElementById('history-table-container');
    const historyTableBody = document.getElementById('history-table-body');

    // Confirm Modal Elements
    const confirmModal = document.getElementById('confirm-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalBtnCancel = document.getElementById('modal-btn-cancel');
    const modalBtnConfirm = document.getElementById('modal-btn-confirm');

    // Trạng thái cho callback modal
    let confirmModalCallback = null;

    // --- 3. ĐỊNH DẠNG VÀ TIỆN ÍCH THỜI GIAN ---

    // Cập nhật ngày giờ ở Header
    function updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
        currentDatetimeEl.textContent = now.toLocaleDateString('vi-VN', options);
    }
    setInterval(updateDateTime, 60000);
    updateDateTime();

    // Định dạng chuỗi ngày thành DD/MM/YYYY HH:MM
    function formatDate(dateString) {
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    // Định dạng số giây thành MM:SS
    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    // --- 4. HỆ THỐNG XÁC NHẬN (CONFIRM MODAL) ---

    function showConfirmModal(title, text, onConfirm) {
        modalTitle.textContent = title;
        modalBody.textContent = text;
        confirmModalCallback = onConfirm;
        confirmModal.classList.add('active');
    }

    function hideConfirmModal() {
        confirmModal.classList.remove('active');
        confirmModalCallback = null;
    }

    modalBtnCancel.addEventListener('click', hideConfirmModal);
    modalBtnConfirm.addEventListener('click', () => {
        if (confirmModalCallback) {
            confirmModalCallback();
        }
        hideConfirmModal();
    });

    // --- 5. THEME SWITCHER (GIAO DIỆN SÁNG/TỐI) ---

    function initTheme() {
        const savedTheme = localStorage.getItem('eduquiz_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('eduquiz_theme', newTheme);
    });

    // --- 6. KHỞI TẠO VÀ LƯU TRỮ LOCALSTORAGE ---

    function loadData() {
        // Tải Quiz Sets
        const storedSets = localStorage.getItem('eduquiz_sets');
        if (storedSets) {
            const parsed = JSON.parse(storedSets);
            // Dọn sạch các bộ câu hỏi mẫu cũ (bắt đầu bằng 'mock-quiz-') để người dùng tự thêm mới
            quizSets = parsed.filter(set => !set.id.startsWith('mock-quiz-'));
            localStorage.setItem('eduquiz_sets', JSON.stringify(quizSets));
        } else {
            quizSets = [];
            localStorage.setItem('eduquiz_sets', JSON.stringify(quizSets));
        }

        // Tải Lịch sử Attempts
        const storedAttempts = localStorage.getItem('eduquiz_attempts');
        if (storedAttempts) {
            attempts = JSON.parse(storedAttempts);
        } else {
            attempts = [];
        }
    }

    function saveQuizSets() {
        localStorage.setItem('eduquiz_sets', JSON.stringify(quizSets));
    }

    function saveAttempts() {
        localStorage.setItem('eduquiz_attempts', JSON.stringify(attempts));
    }

    // --- 7. ROUTING GIỮA CÁC PHÂN HỆ (SPA ROUTER) ---

    function showView(viewId) {
        // Ẩn tất cả view
        views.forEach(v => v.classList.remove('active'));

        // Hiện view mong muốn
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
            targetView.classList.add('animate-fade-in');
        }

        currentActiveView = viewId;

        // Cập nhật trạng thái Active trên Sidebar
        navItems.forEach(item => {
            if (item.getAttribute('data-target') === viewId) {
                item.classList.add('active');
            } else {
                // Ngoại lệ: Nút Tạo câu hỏi cũng chuyển view nên đồng bộ
                if (viewId === 'view-manage-quiz' && item.getAttribute('data-target') === 'view-manage-quiz') {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            }
        });

        // Chỉ hiển thị thanh tìm kiếm ở Dashboard chính
        if (viewId === 'view-dashboard') {
            searchBarContainer.style.visibility = 'visible';
            searchBarContainer.style.opacity = '1';
        } else {
            searchBarContainer.style.visibility = 'hidden';
            searchBarContainer.style.opacity = '0';
        }

        // Trigger cập nhật giao diện tương ứng khi chuyển View
        if (viewId === 'view-dashboard') {
            calculateStats();
            renderQuizGrid();
        } else if (viewId === 'view-stats') {
            renderStatsHistory();
        }

        // Cuộn đầu trang
        window.scrollTo(0, 0);
    }

    // Gắn sự kiện chuyển trang cho Sidebar Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-target');

            // Nếu đang trong chế độ làm kiểm tra, cảnh báo trước khi thoát
            if (currentActiveView === 'view-test') {
                showConfirmModal(
                    'Hủy bài kiểm tra?',
                    'Tiến trình làm bài kiểm tra hiện tại sẽ bị mất. Bạn vẫn muốn thoát chứ?',
                    () => {
                        stopTestTimer();
                        showView(target);
                    }
                );
            } else if (currentActiveView === 'view-flashcard') {
                showConfirmModal(
                    'Thoát ôn tập Flashcard?',
                    'Phiên học Flashcard hiện tại sẽ bị dừng và kết quả tạm thời không được lưu. Bạn vẫn muốn thoát?',
                    () => {
                        stopFlashcardTimer();
                        showView(target);
                    }
                );
            } else {
                showView(target);
            }
        });
    });

    // --- 8. THỐNG KÊ DASHBOARD (STATISTICS) ---

    function calculateStats() {
        // 1. Số lượng bộ câu hỏi
        statsTotalSets.textContent = quizSets.length;

        // 2. Tổng số lượt làm bài
        statsTotalAttempts.textContent = attempts.length;

        if (attempts.length === 0) {
            statsHighestScore.textContent = '0%';
            statsAverageAccuracy.textContent = '0%';
            return;
        }

        // 3. Điểm cao nhất (Tỉ lệ % cao nhất)
        const highest = Math.max(...attempts.map(a => a.accuracy));
        statsHighestScore.textContent = `${Math.round(highest)}%`;

        // 4. Tỉ lệ chính xác trung bình
        const sumAccuracy = attempts.reduce((sum, current) => sum + current.accuracy, 0);
        const avg = sumAccuracy / attempts.length;
        statsAverageAccuracy.textContent = `${Math.round(avg)}%`;
    }

    // --- 9. HIỂN THỊ DANH SÁCH BỘ CÂU HỎI & TÌM KIẾM ---

    function renderQuizGrid(filterText = '') {
        quizSetsGrid.innerHTML = '';
        const filtered = quizSets.filter(set =>
            set.title.toLowerCase().includes(filterText.toLowerCase())
        );

        quizCountBadge.textContent = `${filtered.length} bộ câu hỏi`;

        if (filtered.length === 0) {
            emptyQuizState.style.display = 'flex';
            quizSetsGrid.style.display = 'none';
        } else {
            emptyQuizState.style.display = 'none';
            quizSetsGrid.style.display = 'grid';

            filtered.forEach(set => {
                const card = document.createElement('div');
                card.className = 'quiz-card';
                card.setAttribute('data-id', set.id);

                card.innerHTML = `
                    <button class="quiz-card-edit-btn" title="Chỉnh sửa bộ câu hỏi" aria-label="Edit quiz">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="quiz-card-delete-btn" title="Xóa bộ câu hỏi" aria-label="Delete quiz">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                    <div class="quiz-card-header">
                        <h3 class="quiz-card-title">${escapeHTML(set.title)}</h3>
                    </div>
                    <div class="quiz-card-meta">
                        <div class="quiz-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                            <span>${set.questions.length} câu hỏi</span>
                        </div>
                        <div class="quiz-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            <span>${formatDate(set.createdAt).split(' ')[0]}</span>
                        </div>
                    </div>
                    <div class="quiz-card-actions">
                        <button class="btn btn-outline-primary btn-flashcard-trigger" style="grid-column: span 2;">Học Flashcard 3D 🔄</button>
                        <button class="btn btn-outline btn-practice-trigger">Luyện Tập</button>
                        <button class="btn btn-primary btn-test-trigger">Kiểm Tra</button>
                    </div>
                `;

                // Gắn sự kiện trực tiếp cho các nút của thẻ
                card.querySelector('.btn-flashcard-trigger').addEventListener('click', () => {
                    startFlashcards(set.id);
                });

                card.querySelector('.btn-practice-trigger').addEventListener('click', () => {
                    startPractice(set.id);
                });

                card.querySelector('.btn-test-trigger').addEventListener('click', () => {
                    startTest(set.id);
                });

                card.querySelector('.quiz-card-edit-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    editQuizSet(set.id);
                });

                card.querySelector('.quiz-card-delete-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteQuizSet(set.id);
                });

                quizSetsGrid.appendChild(card);
            });
        }
    }

    // Tìm kiếm bộ câu hỏi
    searchQuizInput.addEventListener('input', (e) => {
        renderQuizGrid(e.target.value);
    });

    // Thao tác chuyển từ dashboard
    btnQuickCreate.addEventListener('click', () => {
        editingQuizId = null;
        showView('view-manage-quiz');
        initManageForm();
    });
    btnEmptyCreate.addEventListener('click', () => {
        editingQuizId = null;
        showView('view-manage-quiz');
        initManageForm();
    });

    // --- 10. QUẢN LÝ BỘ CÂU HỎI (HỖ TRỢ SONG SONG 2 CHẾ ĐỘ NHẬP) ---

    let activeInputMode = 'text'; // 'text' hoặc 'form'

    // Hàm chuyển mảng câu hỏi thành văn bản định dạng thô
    function formatQuestionsToRawText(questions) {
        return questions.map((q, index) => {
            return `câu ${index + 1}: ${q.question}\nAnswer: ${q.answer}`;
        }).join('\n\n');
    }

    // Hàm phân tích cú pháp chuỗi văn bản thô thành mảng câu hỏi
    function parseRawTextToQuestions(text) {
        const blocks = text.split(/(?=câu\s+\d+\s*[:\.\-]\s*)/i);
        const questions = [];

        blocks.forEach(block => {
            const blockTrimmed = block.trim();
            if (!blockTrimmed) return;

            const lines = blockTrimmed.split('\n').map(l => l.trim()).filter(l => l !== '');
            if (lines.length < 2) return;

            let questionText = lines[0].replace(/^câu\s+\d+\s*[:\.\-]\s*/i, '');
            let choices = [];
            let answer = '';

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                const answerMatch = line.match(/^(?:Answer|Đáp án|Đáp án đúng|Ans)\s*:\s*(.+)/i);

                if (answerMatch) {
                    answer = answerMatch[1].trim();
                    continue;
                }

                if (/^[A-Za-z0-9]\s*[\.\-\)]\s*/i.test(line)) {
                    choices.push(line);
                } else {
                    if (choices.length === 0 && !answer) {
                        questionText += '\n' + line;
                    } else if (!answer) {
                        choices[choices.length - 1] += '\n' + line;
                    }
                }
            }

            if (questionText && answer) {
                let finalQuestion = questionText;
                if (choices.length > 0) {
                    finalQuestion += '\n' + choices.join('\n');
                }
                questions.push({
                    question: finalQuestion,
                    answer: answer
                });
            }
        });

        return questions;
    }

    // Trích xuất câu hỏi riêng và các lựa chọn đa phương án (A, B, C, D)
    function extractQuestionAndOptions(fullText) {
        const lines = fullText.split('\n');
        let questionDesc = '';
        const options = [];

        lines.forEach(line => {
            const trimmed = line.trim();
            if (/^[A-D]\s*[\.\-\)]\s*/i.test(trimmed)) {
                const match = trimmed.match(/^([A-D])\s*[\.\-\)]\s*(.*)/i);
                if (match) {
                    options.push({
                        letter: match[1].toUpperCase(),
                        text: match[2].trim()
                    });
                }
            } else {
                if (options.length === 0) {
                    if (questionDesc) questionDesc += '\n';
                    questionDesc += trimmed;
                }
            }
        });

        return {
            description: questionDesc,
            options: options
        };
    }

    // Đảo mảng ngẫu nhiên (Fisher-Yates Shuffle)
    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Khởi tạo dòng câu hỏi thủ công (Manual Row Mode)
    function addQuestionRow(questionVal = '', answerVal = '') {
        const rowId = 'q-row-' + Date.now() + Math.random().toString(36).substr(2, 5);
        const questionCard = document.createElement('div');
        questionCard.className = 'question-form-card animate-fade-in';
        questionCard.id = rowId;

        questionCard.innerHTML = `
            <div class="question-card-header">
                <span class="question-card-title">Câu hỏi tiếp theo</span>
                <button type="button" class="btn-remove-question" aria-label="Xóa câu hỏi">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Xóa Câu Hỏi
                </button>
            </div>
            <div class="question-grid-fields">
                <div class="form-group">
                    <label class="form-label">Nội dung câu hỏi & Các lựa chọn A,B,C,D <span class="required">*</span></label>
                    <textarea class="form-input q-text-input" placeholder="Ví dụ:\nĐâu là từ khóa khai báo hằng số?\nA. var\nB. let\nC. const\nD. static" required rows="4" style="line-height:1.5; font-size:13px;">${escapeHTML(questionVal)}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Đáp án đúng <span class="required">*</span></label>
                    <input type="text" class="form-input q-ans-input" placeholder="Ví dụ: C" required value="${escapeHTML(answerVal)}" autocomplete="off">
                </div>
            </div>
        `;

        questionCard.querySelector('.btn-remove-question').addEventListener('click', () => {
            const rowCount = questionsListContainer.querySelectorAll('.question-form-card').length;
            if (rowCount <= 1) {
                alert('Một bộ câu hỏi cần có ít nhất 1 câu hỏi.');
                return;
            }
            questionCard.remove();
            updateFormQuestionsCount();
        });

        questionsListContainer.appendChild(questionCard);
        updateFormQuestionsCount();
    }

    function updateFormQuestionsCount() {
        const count = questionsListContainer.querySelectorAll('.question-form-card').length;
        if (activeInputMode === 'form') {
            manageQuestionsCount.textContent = `Chế độ form: ${count} câu hỏi`;
        }
        questionsListContainer.querySelectorAll('.question-form-card').forEach((card, index) => {
            card.querySelector('.question-card-title').textContent = `Câu Hỏi ${index + 1}`;
        });
    }

    // Đọc câu hỏi từ giao diện Form thủ công
    function getQuestionsFromForm() {
        const cards = questionsListContainer.querySelectorAll('.question-form-card');
        const questions = [];
        cards.forEach(card => {
            const text = card.querySelector('.q-text-input').value.trim();
            const ans = card.querySelector('.q-ans-input').value.trim();
            if (text && ans) {
                questions.push({ question: text, answer: ans });
            }
        });
        return questions;
    }

    // Đồng bộ hóa dữ liệu giữa 2 tab nhập
    function switchInputMode(targetMode) {
        if (activeInputMode === targetMode) return;

        if (targetMode === 'text') {
            // Chuyển từ Form sang Textarea
            const questions = getQuestionsFromForm();
            if (questions.length > 0) {
                quizQuestionsRaw.value = formatQuestionsToRawText(questions);
            }

            manageModeTextContainer.style.display = 'block';
            manageModeFormContainer.style.display = 'none';
            tabModeText.classList.add('active');
            tabModeText.classList.remove('btn-outline');
            tabModeForm.classList.remove('active');
            tabModeForm.classList.add('btn-outline');
            tabModeForm.style.color = 'var(--text-muted)';
            tabModeText.style.color = 'var(--text-on-primary)';

            manageQuestionsCount.textContent = 'Chế độ văn bản';
        } else {
            // Chuyển từ Textarea sang Form
            const rawText = quizQuestionsRaw.value.trim();
            const questions = parseRawTextToQuestions(rawText);

            questionsListContainer.innerHTML = '';
            if (questions.length > 0) {
                questions.forEach(q => {
                    addQuestionRow(q.question, q.answer);
                });
            } else {
                addQuestionRow();
            }

            manageModeTextContainer.style.display = 'none';
            manageModeFormContainer.style.display = 'block';
            tabModeForm.classList.add('active');
            tabModeForm.classList.remove('btn-outline');
            tabModeText.classList.remove('active');
            tabModeText.classList.add('btn-outline');
            tabModeText.style.color = 'var(--text-muted)';
            tabModeForm.style.color = 'var(--text-on-primary)';

            updateFormQuestionsCount();
        }

        activeInputMode = targetMode;
    }

    tabModeText.addEventListener('click', () => switchInputMode('text'));
    tabModeForm.addEventListener('click', () => switchInputMode('form'));

    // Khởi tạo Form Quản lý bộ câu hỏi
    function initManageForm(quizId = null) {
        quizQuestionsRaw.value = '';
        questionsListContainer.innerHTML = '';

        // Mặc định về tab văn bản
        activeInputMode = 'text';
        manageModeTextContainer.style.display = 'block';
        manageModeFormContainer.style.display = 'none';
        tabModeText.classList.add('active');
        tabModeText.classList.remove('btn-outline');
        tabModeForm.classList.remove('active');
        tabModeForm.classList.add('btn-outline');
        tabModeText.style.color = 'var(--text-on-primary)';
        tabModeForm.style.color = 'var(--text-muted)';
        manageQuestionsCount.textContent = 'Chế độ văn bản';

        if (quizId) {
            editingQuizId = quizId;
            const set = quizSets.find(s => s.id === quizId);
            manageTitle.textContent = "Chỉnh Sửa Bộ Câu Hỏi";
            manageQuizIdInput.value = set.id;
            quizTitleInput.value = set.title;

            quizQuestionsRaw.value = formatQuestionsToRawText(set.questions);
        } else {
            editingQuizId = null;
            manageTitle.textContent = "Tạo Bộ Câu Hỏi Mới";
            manageQuizIdInput.value = "";
            quizTitleInput.value = "";

            quizQuestionsRaw.value = `câu 1: Đây là câu hỏi ví dụ thứ nhất?
A. Lựa chọn 1
B. Lựa chọn 2
C. Lựa chọn 3
D. Lựa chọn 4
Answer: B

câu 2: Đây là câu hỏi ví dụ thứ hai?
A. Lựa chọn A
B. Lựa chọn B
C. Lựa chọn C
D. Lựa chọn D
Answer: C`;
        }
    }

    // Làm mới Form / Xóa hết chữ
    btnResetForm.addEventListener('click', () => {
        if (confirm('Bạn có muốn làm trống toàn bộ dữ liệu đang nhập để viết lại?')) {
            if (activeInputMode === 'text') {
                quizQuestionsRaw.value = '';
                quizQuestionsRaw.focus();
            } else {
                questionsListContainer.innerHTML = '';
                addQuestionRow();
            }
        }
    });

    // Quay lại/ Hủy
    btnCancelManage.addEventListener('click', () => {
        showView('view-dashboard');
    });

    // Lưu bộ câu hỏi (Submit Form)
    quizManageForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const titleVal = quizTitleInput.value.trim();
        if (!titleVal) return;

        let questionsArr = [];

        if (activeInputMode === 'text') {
            const rawText = quizQuestionsRaw.value.trim();
            questionsArr = parseRawTextToQuestions(rawText);
        } else {
            questionsArr = getQuestionsFromForm();
        }

        if (questionsArr.length === 0) {
            alert('Không tìm thấy câu hỏi hợp lệ. Vui lòng kiểm tra lại cấu trúc nhập liệu.');
            return;
        }

        if (editingQuizId) {
            const idx = quizSets.findIndex(s => s.id === editingQuizId);
            if (idx !== -1) {
                quizSets[idx].title = titleVal;
                quizSets[idx].questions = questionsArr;
            }
        } else {
            const newQuiz = {
                id: 'quiz-' + Date.now(),
                title: titleVal,
                createdAt: new Date().toISOString(),
                questions: questionsArr
            };
            quizSets.push(newQuiz);
        }

        saveQuizSets();
        showView('view-dashboard');

        const actionText = editingQuizId ? "Cập nhật" : "Tạo mới";
        alert(`${actionText} bộ câu hỏi "${titleVal}" thành công với ${questionsArr.length} câu hỏi!`);
        editingQuizId = null;
    });

    // Kích hoạt Sửa bộ câu hỏi từ Dashboard
    function editQuizSet(quizId) {
        showView('view-manage-quiz');
        initManageForm(quizId);
    }

    // Kích hoạt Xóa bộ câu hỏi
    function deleteQuizSet(quizId) {
        const set = quizSets.find(s => s.id === quizId);
        if (!set) return;

        showConfirmModal(
            'Xóa Bộ Câu Hỏi?',
            `Bạn có chắc muốn xóa bộ câu hỏi "${set.title}"? Hành động này không thể hoàn tác.`,
            () => {
                quizSets = quizSets.filter(s => s.id !== quizId);
                saveQuizSets();

                attempts = attempts.filter(a => a.quizId !== quizId);
                saveAttempts();

                calculateStats();
                renderQuizGrid();
            }
        );
    }

    // --- 11. CHẾ ĐỘ LUYỆN TẬP (PRACTICE MODE - NGẪU NHIÊN TỐI ĐA 20 CÂU & TRẮC NGHIỆM ĐA LỰA CHỌN) ---

    function startPractice(quizId) {
        const set = quizSets.find(s => s.id === quizId);
        if (!set || set.questions.length === 0) {
            alert('Bộ câu hỏi này không hợp lệ.');
            return;
        }

        // Lấy ngẫu nhiên tối đa 20 câu
        const shuffled = shuffleArray(set.questions);
        const sliced = shuffled.slice(0, 20);

        activeQuizSet = {
            id: set.id,
            title: set.title,
            questions: sliced
        };

        practiceIndex = 0;

        practiceSetTitle.textContent = "Chế độ: Luyện Tập (Ngẫu nhiên 20 câu)";
        practiceSidebarTitle.textContent = set.title;
        practiceSidebarCount.textContent = `${sliced.length} / ${set.questions.length} câu ngẫu nhiên`;

        showView('view-practice');
        renderPracticeQuestion();
    }

    function renderPracticeQuestion() {
        const q = activeQuizSet.questions[practiceIndex];

        // Tiến trình
        const total = activeQuizSet.questions.length;
        const currentNum = practiceIndex + 1;
        const percentVal = Math.round((currentNum / total) * 100);

        practiceProgressText.textContent = `Câu hỏi ${currentNum} / ${total}`;
        practiceProgressPercent.textContent = `${percentVal}%`;
        practiceProgressBar.style.width = `${percentVal}%`;

        // Reset Inputs & Feedback
        practiceAnswerInput.value = '';
        practiceFeedbackAlert.style.display = 'none';

        // Cấu hình lại nút
        btnPracticeCheck.style.display = 'block';
        btnPracticeNext.style.display = 'none';

        // Phân tích câu hỏi trắc nghiệm
        const parsed = extractQuestionAndOptions(q.question);
        practiceQuestionText.textContent = parsed.description;

        if (parsed.options.length > 0) {
            // Hiển thị lựa chọn trắc nghiệm
            practiceChoicesContainer.innerHTML = '';
            practiceChoicesContainer.style.display = 'grid';
            practiceInputGroup.style.display = 'none';

            parsed.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn animate-fade-in';
                btn.setAttribute('data-letter', opt.letter);
                btn.innerHTML = `
                    <span class="choice-letter">${opt.letter}</span>
                    <span class="choice-text">${escapeHTML(opt.text)}</span>
                `;

                btn.addEventListener('click', () => {
                    // Loại bỏ class selected ở các nút khác
                    practiceChoicesContainer.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    // Ghi giá trị lựa chọn vào ô input ẩn
                    practiceAnswerInput.value = opt.letter;
                });

                practiceChoicesContainer.appendChild(btn);
            });
        } else {
            // Không có A, B, C, D -> Quay về ô nhập văn bản tự do
            practiceChoicesContainer.style.display = 'none';
            practiceInputGroup.style.display = 'block';
            practiceAnswerInput.disabled = false;
        }
    }

    // Nhấn nút kiểm tra đáp án luyện tập
    btnPracticeCheck.addEventListener('click', () => {
        const userAns = practiceAnswerInput.value.trim();
        if (!userAns) {
            alert('Vui lòng lựa chọn hoặc nhập đáp án trước.');
            return;
        }

        const q = activeQuizSet.questions[practiceIndex];
        const isCorrect = userAns.toLowerCase() === q.answer.toLowerCase();

        btnPracticeCheck.style.display = 'none';

        // Vô hiệu hóa lựa chọn sau khi check
        if (practiceChoicesContainer.style.display !== 'none') {
            practiceChoicesContainer.querySelectorAll('.choice-btn').forEach(btn => {
                btn.disabled = true;
                const letter = btn.getAttribute('data-letter');

                // Tô màu xanh cho đáp án đúng hệ thống
                if (letter.toLowerCase() === q.answer.toLowerCase()) {
                    btn.classList.add('correct');
                }

                // Tô màu đỏ nếu người dùng chọn sai
                if (letter.toLowerCase() === userAns.toLowerCase() && !isCorrect) {
                    btn.classList.add('incorrect');
                }
            });
        } else {
            practiceAnswerInput.disabled = true;
        }

        // Cập nhật alert phản hồi
        practiceFeedbackAlert.className = `feedback-alert ${isCorrect ? 'correct' : 'incorrect'}`;

        if (isCorrect) {
            practiceFeedbackIcon.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            practiceFeedbackTitle.textContent = "Hoàn toàn chính xác! 🎉";
            practiceFeedbackDesc.textContent = `Lựa chọn của bạn trùng khớp hoàn toàn với đáp án hệ thống.`;
        } else {
            practiceFeedbackIcon.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            practiceFeedbackTitle.textContent = "Rất tiếc, chưa chính xác!";
            practiceFeedbackDesc.textContent = `Đáp án đúng là: "${q.answer.toUpperCase()}"`;
        }

        practiceFeedbackAlert.style.display = 'flex';
        btnPracticeNext.style.display = 'block';

        if (practiceIndex === activeQuizSet.questions.length - 1) {
            btnPracticeNext.innerHTML = `
                Hoàn Thành Luyện Tập
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" style="margin-left: 8px; display:inline;">
                    <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        } else {
            btnPracticeNext.innerHTML = `
                Câu Tiếp Theo
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" style="margin-left: 8px; display:inline;">
                    <path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        }
    });

    btnPracticeNext.addEventListener('click', () => {
        if (practiceIndex < activeQuizSet.questions.length - 1) {
            practiceIndex++;
            renderPracticeQuestion();
        } else {
            showView('view-dashboard');
            alert(`Chúc mừng! Bạn đã hoàn thành việc ôn luyện bộ câu hỏi "${activeQuizSet.title}".`);
        }
    });

    btnExitPractice.addEventListener('click', () => {
        showView('view-dashboard');
    });

    // --- 12. CHẾ ĐỘ KIỂM TRA (TEST MODE - NGẪU NHIÊN TỐI ĐA 20 CÂU & TRẮC NGHIỆM ĐA LỰA CHỌN) ---

    function startTest(quizId) {
        const set = quizSets.find(s => s.id === quizId);
        if (!set || set.questions.length === 0) {
            alert('Bộ câu hỏi này không hợp lệ.');
            return;
        }

        // Lấy ngẫu nhiên tối đa 20 câu làm bài kiểm tra
        const shuffled = shuffleArray(set.questions);
        const sliced = shuffled.slice(0, 20);

        activeQuizSet = {
            id: set.id,
            title: set.title,
            questions: sliced
        };

        testSeconds = 0;
        testTimer.textContent = "00:00";

        testSetTitle.textContent = `Bài thi ngẫu nhiên: ${set.title}`;
        testTotalCount.textContent = sliced.length;
        testAnsweredCount.textContent = "0";

        renderTestQuestions(activeQuizSet);
        startTestTimer();
        showView('view-test');
    }

    function startTestTimer() {
        stopTestTimer();
        testTimerInterval = setInterval(() => {
            testSeconds++;
            testTimer.textContent = formatTime(testSeconds);
        }, 1000);
    }

    function stopTestTimer() {
        if (testTimerInterval) {
            clearInterval(testTimerInterval);
            testTimerInterval = null;
        }
    }

    // Hiển thị tất cả câu hỏi kiểm tra dưới dạng trắc nghiệm / tự do
    function renderTestQuestions(set) {
        testQuestionsList.innerHTML = '';
        testNavGrid.innerHTML = '';

        set.questions.forEach((q, idx) => {
            const card = document.createElement('div');
            card.className = 'test-question-card card-panel';
            card.id = `test-q-card-${idx}`;

            const parsed = extractQuestionAndOptions(q.question);

            let answerMarkup = '';
            if (parsed.options.length > 0) {
                // Render các lựa chọn trắc nghiệm dạng list label clickable
                let optionsListHtml = '';
                parsed.options.forEach(opt => {
                    optionsListHtml += `
                        <label class="test-choice-item" id="test-choice-item-${idx}-${opt.letter}" style="margin-bottom:8px;">
                            <input type="radio" name="test-ans-${idx}" value="${opt.letter}" data-index="${idx}" style="cursor:pointer;">
                            <span class="test-choice-text"><strong>${opt.letter}.</strong> ${escapeHTML(opt.text)}</span>
                        </label>
                    `;
                });
                answerMarkup = `
                    <div class="test-choices-list" style="margin-top:12px;">
                        ${optionsListHtml}
                    </div>
                `;
            } else {
                // Tự luận nhập tự do
                answerMarkup = `
                    <div class="form-group" style="margin-top:12px;">
                        <textarea class="form-input test-ans-textarea" data-index="${idx}" placeholder="Nhập câu trả lời của bạn..." rows="2"></textarea>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="test-question-header">
                    <span class="test-question-num">CÂU HỎI ${idx + 1} / ${set.questions.length}</span>
                </div>
                <div class="test-question-desc">
                    ${escapeHTML(parsed.description)}
                </div>
                ${answerMarkup}
            `;

            testQuestionsList.appendChild(card);

            // Gắn sự kiện đánh dấu tiến trình
            if (parsed.options.length > 0) {
                card.querySelectorAll(`input[name="test-ans-${idx}"]`).forEach(radio => {
                    radio.addEventListener('change', () => {
                        // Highlight nhãn được lựa chọn
                        card.querySelectorAll('.test-choice-item').forEach(lbl => lbl.classList.remove('selected'));
                        const selectedLabel = card.querySelector(`#test-choice-item-${idx}-${radio.value}`);
                        if (selectedLabel) selectedLabel.classList.add('selected');

                        updateTestProgressFeedback();
                    });
                });
            } else {
                const textarea = card.querySelector('.test-ans-textarea');
                textarea.addEventListener('input', () => {
                    updateTestProgressFeedback();
                });
            }

            // Tạo nút định vị nhanh
            const navBadge = document.createElement('a');
            navBadge.href = `#test-q-card-${idx}`;
            navBadge.className = 'nav-badge';
            navBadge.id = `test-nav-badge-${idx}`;
            navBadge.textContent = idx + 1;

            navBadge.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById(`test-q-card-${idx}`).scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            });

            testNavGrid.appendChild(navBadge);
        });
    }

    // Đếm số câu hoàn tất bài thi
    function updateTestProgressFeedback() {
        let answered = 0;

        activeQuizSet.questions.forEach((q, idx) => {
            const navBadge = document.getElementById(`test-nav-badge-${idx}`);
            let isAnswered = false;

            // Kiểm tra xem là trắc nghiệm hay tự luận
            const radioChecked = testQuestionsList.querySelector(`input[name="test-ans-${idx}"]:checked`);
            if (radioChecked) {
                isAnswered = true;
            } else {
                const textarea = testQuestionsList.querySelector(`.test-ans-textarea[data-index="${idx}"]`);
                if (textarea && textarea.value.trim() !== '') {
                    isAnswered = true;
                }
            }

            if (isAnswered) {
                answered++;
                if (navBadge) navBadge.classList.add('answered');
            } else {
                if (navBadge) navBadge.classList.remove('answered');
            }
        });

        testAnsweredCount.textContent = answered;
    }

    // Hủy thi
    btnExitTest.addEventListener('click', () => {
        showConfirmModal(
            'Hủy làm bài thi?',
            'Bạn có chắc chắn muốn hủy bài làm này? Mọi câu trả lời của bạn sẽ không được lưu lại.',
            () => {
                stopTestTimer();
                showView('view-dashboard');
            }
        );
    });

    // Nộp bài thi
    testSubmissionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let answered = 0;
        activeQuizSet.questions.forEach((q, idx) => {
            const radioChecked = testQuestionsList.querySelector(`input[name="test-ans-${idx}"]:checked`);
            if (radioChecked) {
                answered++;
            } else {
                const textarea = testQuestionsList.querySelector(`.test-ans-textarea[data-index="${idx}"]`);
                if (textarea && textarea.value.trim() !== "") answered++;
            }
        });

        const total = activeQuizSet.questions.length;

        if (answered < total) {
            showConfirmModal(
                'Nộp bài thi chưa hoàn tất?',
                `Bạn mới hoàn thành ${answered} / ${total} câu hỏi. Bạn vẫn muốn nộp bài thi chứ?`,
                () => {
                    processSubmitTest();
                }
            );
        } else {
            showConfirmModal(
                'Nộp bài thi?',
                'Xác nhận nộp bài làm để tính toán điểm số.',
                () => {
                    processSubmitTest();
                }
            );
        }
    });

    // Tính điểm nộp bài thi trắc nghiệm & tự luận
    function processSubmitTest() {
        stopTestTimer();

        const userAnswers = [];
        let correctCount = 0;

        activeQuizSet.questions.forEach((q, idx) => {
            let userAns = '';

            const radioChecked = testQuestionsList.querySelector(`input[name="test-ans-${idx}"]:checked`);
            if (radioChecked) {
                userAns = radioChecked.value;
            } else {
                const textarea = testQuestionsList.querySelector(`.test-ans-textarea[data-index="${idx}"]`);
                if (textarea) userAns = textarea.value.trim();
            }

            userAnswers.push(userAns);

            const correctAns = q.answer;
            if (userAns.toLowerCase() === correctAns.toLowerCase()) {
                correctCount++;
            }
        });

        const totalQuestions = activeQuizSet.questions.length;
        const accuracyRate = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

        const newAttempt = {
            id: 'attempt-' + Date.now(),
            quizId: activeQuizSet.id,
            quizTitle: activeQuizSet.title,
            date: new Date().toISOString(),
            score: correctCount,
            total: totalQuestions,
            duration: testSeconds,
            accuracy: accuracyRate,
            userAnswers: userAnswers,
            questions: activeQuizSet.questions // lưu lại danh sách câu hỏi đã được trộn để xem lại bài thi chuẩn xác
        };

        attempts.push(newAttempt);
        saveAttempts();

        renderResults(newAttempt);
        showView('view-results');
    }

    // --- 13. MÀN HIỂN THỊ KẾT QUẢ THI (RESULTS VIEW) ---

    function renderResults(attempt) {
        resultsQuizTitle.textContent = attempt.quizTitle;
        resultFraction.textContent = `${attempt.score} / ${attempt.total} câu đúng`;
        resultDuration.textContent = `Thời gian làm bài: ${formatTime(attempt.duration)}`;
        resultCorrectCount.textContent = attempt.score;
        resultIncorrectCount.textContent = attempt.total - attempt.score;

        const percentage = Math.round(attempt.accuracy);
        resultPercentage.textContent = `${percentage}%`;

        const circumference = 502.65;
        resultProgressRing.style.strokeDasharray = `${circumference} ${circumference}`;
        const offset = circumference - (percentage / 100) * circumference;
        resultProgressRing.style.strokeDashoffset = offset;

        if (percentage === 100) {
            resultRatingText.textContent = "Tuyệt đối! Xuất sắc! 🏆";
        } else if (percentage >= 80) {
            resultRatingText.textContent = "Rất tốt! Cố gắng phát huy! 🌟";
        } else if (percentage >= 50) {
            resultRatingText.textContent = "Khá tốt! Bạn cần ôn luyện thêm. 👍";
        } else {
            resultRatingText.textContent = "Chưa đạt! Hãy rèn luyện thêm nữa nhé. 📚";
        }

        resultsReviewContainer.innerHTML = '';

        // Sử dụng danh sách câu hỏi đã được lưu theo lượt làm (attempt.questions)
        const questionsList = attempt.questions || [];

        questionsList.forEach((q, idx) => {
            const userAns = attempt.userAnswers[idx] || '';
            const correctAns = q.answer;
            const isCorrect = userAns.toLowerCase() === correctAns.toLowerCase();

            const reviewCard = document.createElement('div');
            reviewCard.className = `review-item`;

            // Tách câu hỏi
            const parsed = extractQuestionAndOptions(q.question);

            reviewCard.innerHTML = `
                <div class="review-header">
                    <span class="badge ${isCorrect ? 'success' : 'danger'}">
                        ${isCorrect ? 'Đúng' : 'Sai'}
                    </span>
                    <span class="review-num">Câu hỏi ${idx + 1}</span>
                </div>
                <div class="review-question">
                    ${escapeHTML(parsed.description)}
                </div>
                <div class="review-answer-split">
                    <div class="review-answer-box user-ans ${isCorrect ? 'correct-ans' : ''}">
                        <small>Lựa chọn của bạn:</small>
                        <strong>${userAns !== '' ? escapeHTML(userAns.toUpperCase()) : '(Để trống)'}</strong>
                    </div>
                    ${!isCorrect ? `
                    <div class="review-answer-box correct-ans">
                        <small>Đáp án đúng hệ thống:</small>
                        <strong>${escapeHTML(correctAns.toUpperCase())}</strong>
                    </div>
                    ` : ''}
                </div>
            `;

            resultsReviewContainer.appendChild(reviewCard);
        });

        btnResultsHome.onclick = () => { showView('view-dashboard'); };
        btnResultsRetry.onclick = () => { startTest(attempt.quizId); };
        btnResultsPractice.onclick = () => { startPractice(attempt.quizId); };
    }

    // --- 14. TRANG LỊCH SỬ CHI TIẾT (STATS & HISTORY) ---

    function renderStatsHistory() {
        historyTotalCount.textContent = `${attempts.length} lần`;

        if (attempts.length === 0) {
            historyMaxAcc.textContent = '0%';
            historyAvgAcc.textContent = '0%';
            historyAvgTime.textContent = '00:00';
            emptyHistoryState.style.display = 'flex';
            historyTableContainer.style.display = 'none';
            historyCountBadge.textContent = '0 lượt làm bài';
            return;
        }

        emptyHistoryState.style.display = 'none';
        historyTableContainer.style.display = 'block';
        historyCountBadge.textContent = `${attempts.length} lượt làm bài`;

        const maxAcc = Math.max(...attempts.map(a => a.accuracy));
        historyMaxAcc.textContent = `${Math.round(maxAcc)}%`;

        const sumAcc = attempts.reduce((sum, item) => sum + item.accuracy, 0);
        historyAvgAcc.textContent = `${Math.round(sumAcc / attempts.length)}%`;

        const sumTime = attempts.reduce((sum, item) => sum + item.duration, 0);
        historyAvgTime.textContent = formatTime(Math.round(sumTime / attempts.length));

        historyTableBody.innerHTML = '';

        const sortedAttempts = [...attempts].reverse();

        sortedAttempts.forEach(item => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td><strong>${escapeHTML(item.quizTitle)}</strong></td>
                <td><span>${formatDate(item.date)}</span></td>
                <td><span>${item.score} / ${item.total}</span></td>
                <td><span class="badge ${item.accuracy >= 80 ? 'success' : (item.accuracy >= 50 ? '' : 'danger')}">${Math.round(item.accuracy)}%</span></td>
                <td><span>${formatTime(item.duration)}</span></td>
                <td>
                    <button class="btn btn-outline btn-delete-attempt-row" style="padding: 6px 12px; font-size: 12px;" data-id="${item.id}">
                        Xóa dòng
                    </button>
                </td>
            `;

            tr.querySelector('.btn-delete-attempt-row').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteAttempt(item.id);
            });

            historyTableBody.appendChild(tr);
        });
    }

    function deleteAttempt(attemptId) {
        showConfirmModal(
            'Xóa Bản Ghi Lịch Sử?',
            'Bạn có chắc chắn muốn xóa bản ghi kết quả làm bài này khỏi nhật ký?',
            () => {
                attempts = attempts.filter(a => a.id !== attemptId);
                saveAttempts();
                renderStatsHistory();
                calculateStats();
            }
        );
    }

    btnClearHistory.addEventListener('click', () => {
        if (attempts.length === 0) {
            alert('Nhật ký lịch sử hiện đang trống.');
            return;
        }

        showConfirmModal(
            'Xóa Toàn Bộ Lịch Sử?',
            'Mọi bản ghi lịch sử làm bài kiểm tra và điểm thống kê của bạn sẽ bị dọn dẹp sạch sẽ. Bạn vẫn muốn xóa chứ?',
            () => {
                attempts = [];
                saveAttempts();
                renderStatsHistory();
                calculateStats();
            }
        );
    });

    // --- 14b. CHẾ ĐỘ THẺ GHI NHỚ 3D (3D FLASHCARDS SYSTEM) ---

    // Bắt đầu học Flashcard
    function startFlashcards(quizId) {
        const set = quizSets.find(s => s.id === quizId);
        if (!set || set.questions.length === 0) {
            alert('Bộ câu hỏi này không hợp lệ.');
            return;
        }

        // Tạo bộ thẻ ghi nhớ xáo trộn từ bộ câu hỏi
        const shuffled = shuffleArray(set.questions);

        // Cấu trúc của mỗi thẻ đang học: { question, answer, id, recallLevel, easyFirstTry }
        flashcardDeck = shuffled.map((q, idx) => ({
            question: q.question,
            answer: q.answer,
            id: 'fc-' + idx + '-' + Date.now(),
            recallLevel: 'new',
            easyFirstTry: true
        }));

        flashcardIndex = 0;
        flashcardEasyOriginalCount = 0;
        isFlashcardFlipped = false;

        // Quản lý thời gian học
        flashcardSeconds = 0;
        stopFlashcardTimer();
        startFlashcardTimer();

        // Giao diện
        flashcardSetTitle.textContent = `Thẻ ghi nhớ: ${set.title}`;
        flashcardActiveWorkspace.style.display = 'grid';
        flashcardCompletePanel.style.display = 'none';

        // Reset lật thẻ ban đầu trên giao diện
        flashcardCard3d.classList.remove('flipped');

        showView('view-flashcard');
        renderFlashcard();
    }

    function startFlashcardTimer() {
        flashcardTimerInterval = setInterval(() => {
            flashcardSeconds++;
        }, 1000);
    }

    function stopFlashcardTimer() {
        if (flashcardTimerInterval) {
            clearInterval(flashcardTimerInterval);
            flashcardTimerInterval = null;
        }
    }

    // Lật thẻ (xoay 180 độ)
    function flipFlashcard() {
        if (flashcardDeck.length === 0) return;

        isFlashcardFlipped = !isFlashcardFlipped;
        if (isFlashcardFlipped) {
            flashcardCard3d.classList.add('flipped');
            fcControlFront.style.display = 'none';
            fcControlBack.style.display = 'flex';
        } else {
            flashcardCard3d.classList.remove('flipped');
            fcControlFront.style.display = 'block';
            fcControlBack.style.display = 'none';
        }
        playChime(400, 0.05); // Âm thanh click lật thẻ nhẹ nhàng
    }

    // Hiển thị nội dung thẻ hiện tại
    function renderFlashcard() {
        if (flashcardDeck.length === 0) {
            finishFlashcardSession();
            return;
        }

        // Đảm bảo thẻ ở trạng thái mặt trước khi hiển thị thẻ mới
        isFlashcardFlipped = false;
        flashcardCard3d.classList.remove('flipped');
        fcControlFront.style.display = 'block';
        fcControlBack.style.display = 'none';

        const currentCard = flashcardDeck[flashcardIndex];

        // Tách câu hỏi và phương án nếu có trắc nghiệm
        const parsed = extractQuestionAndOptions(currentCard.question);
        fcQuestionText.textContent = parsed.description;

        // Hiển thị đáp án đúng
        fcAnswerText.textContent = currentCard.answer;

        // Nếu là trắc nghiệm, hiển thị danh sách các đáp án ở mặt sau thẻ
        if (parsed.options.length > 0) {
            fcOptionsList.innerHTML = '';
            fcOptionsList.style.display = 'flex';

            parsed.options.forEach(opt => {
                const optEl = document.createElement('div');
                optEl.className = 'fc-option-card';
                optEl.innerHTML = `<strong>${opt.letter}.</strong>&nbsp;${escapeHTML(opt.text)}`;

                // Tô viền xanh cho lựa chọn đúng
                if (opt.letter.toLowerCase() === currentCard.answer.toLowerCase()) {
                    optEl.classList.add('correct');
                }
                fcOptionsList.appendChild(optEl);
            });
        } else {
            fcOptionsList.style.display = 'none';
        }

        // Cập nhật thông số tiến trình
        updateFlashcardProgress();
    }

    // Tính toán và cập nhật thanh tiến độ 3 màu
    function updateFlashcardProgress() {
        const remainingCount = flashcardDeck.length;
        flashcardDeckCount.textContent = `Còn lại: ${remainingCount} thẻ trong deck`;

        // Thống kê phân loại theo trạng thái nhớ bài
        const hard = flashcardDeck.filter(c => c.recallLevel === 'hard').length;
        const medium = flashcardDeck.filter(c => c.recallLevel === 'medium').length;
        const newCards = flashcardDeck.filter(c => c.recallLevel === 'new').length;

        fcBadgeHard.textContent = `Chưa nhớ: ${hard}`;
        fcBadgeMedium.textContent = `Đang học: ${medium}`;
        fcBadgeEasy.textContent = `Đã thuộc: ${flashcardEasyOriginalCount}`;

        // Tính tỷ lệ phần trăm tiến trình
        const totalSessionCards = remainingCount + flashcardEasyOriginalCount;

        if (totalSessionCards > 0) {
            const easyPercent = (flashcardEasyOriginalCount / totalSessionCards) * 100;
            const mediumPercent = (medium / totalSessionCards) * 100;
            const hardPercent = ((hard + newCards) / totalSessionCards) * 100;

            fcProgressEasy.style.width = `${easyPercent}%`;
            fcProgressMedium.style.width = `${mediumPercent}%`;
            fcProgressHard.style.width = `${hardPercent}%`;
        } else {
            fcProgressEasy.style.width = '0%';
            fcProgressMedium.style.width = '0%';
            fcProgressHard.style.width = '0%';
        }
    }

    // Thuật toán Active Recall - Lặp lại ngắt quãng dựa trên mức độ nhớ bài
    function rateRecall(level) {
        if (flashcardDeck.length === 0) return;

        const currentCard = flashcardDeck[flashcardIndex];

        if (level === 'easy') {
            // Đã thuộc bài -> Loại bỏ hoàn toàn khỏi hàng chờ
            currentCard.recallLevel = 'easy';
            if (currentCard.easyFirstTry) {
                flashcardEasyOriginalCount++;
            }

            // Xóa thẻ khỏi mảng
            flashcardDeck.splice(flashcardIndex, 1);

            playChime(600, 0.08); // Âm thanh phản hồi tích cực
        } else if (level === 'medium') {
            // Mơ hồ -> Cho thẻ xuất hiện lại ở vị trí giữa hàng chờ (hoặc sau 2-3 thẻ tiếp theo)
            currentCard.recallLevel = 'medium';
            currentCard.easyFirstTry = false;

            // Xóa thẻ ở vị trí hiện tại
            flashcardDeck.splice(flashcardIndex, 1);

            // Chèn lại vào giữa danh sách (nhưng tối thiểu là sau 2 thẻ kế tiếp nếu danh sách đủ dài)
            const insertPos = Math.min(
                Math.max(2, Math.floor(flashcardDeck.length / 2)),
                flashcardDeck.length
            );
            flashcardDeck.splice(insertPos, 0, currentCard);

            playChime(350, 0.08);
        } else if (level === 'hard') {
            // Chưa thuộc bài -> Đưa thẻ xuống cuối hàng chờ học lại nhiều lần
            currentCard.recallLevel = 'hard';
            currentCard.easyFirstTry = false;

            // Xóa thẻ ở vị trí hiện tại
            flashcardDeck.splice(flashcardIndex, 1);

            // Đưa xuống cuối danh sách
            flashcardDeck.push(currentCard);

            playChime(250, 0.12);
        }

        // Render thẻ kế tiếp (chỉ số index giữ nguyên là 0 vì ta đã xóa thẻ hiện tại hoặc kết thúc)
        renderFlashcard();
    }

    // Hoàn thành phiên học (Confetti và Audio Victory)
    function finishFlashcardSession() {
        stopFlashcardTimer();

        flashcardActiveWorkspace.style.display = 'none';
        flashcardCompletePanel.style.display = 'block';

        // Tổng kết
        const totalFinished = flashcardEasyOriginalCount + flashcardDeck.filter(c => c.recallLevel === 'easy').length;
        fcTotalFinished.textContent = `${totalFinished} thẻ`;
        fcEasyCount.textContent = `${flashcardEasyOriginalCount} thẻ`;
        fcTotalTime.textContent = formatTime(flashcardSeconds);

        // Chạy âm thanh chiến thắng
        playVictorySound();

        // Kích hoạt pháo hoa confetti
        triggerConfetti(fcConfettiCanvas);
    }

    // Bộ phát âm thanh chime bằng Web Audio API để không cần tải file ngoài
    let audioCtx = null;
    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    function playChime(frequency, duration) {
        try {
            const ctx = getAudioContext();
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.value = frequency;

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.log("Audio not supported or blocked: ", e);
        }
    }

    function playVictorySound() {
        try {
            const ctx = getAudioContext();
            if (ctx.state === 'suspended') ctx.resume();

            const now = ctx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Hợp âm đô trưởng đi lên)
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.frequency.value = freq;
                osc.type = 'triangle';

                gain.gain.setValueAtTime(0.08, now + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.12 + 0.3);

                osc.start(now + idx * 0.12);
                osc.stop(now + idx * 0.12 + 0.3);
            });
        } catch (e) {
            console.log("Victory audio failed: ", e);
        }
    }

    // Hiệu ứng pháo hoa Confetti trên Canvas
    let confettiInterval = null;
    function triggerConfetti(canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#3B82F6'];
        const particles = [];

        // Tạo hạt confetti ban đầu
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height - height,
                r: Math.random() * 6 + 4,
                d: Math.random() * height,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.random() * 10 - 5,
                tiltAngleIncremental: Math.random() * 0.07 + 0.02,
                tiltAngle: 0,
                w: Math.random() * 15 + 5,
                h: Math.random() * 20 + 10,
                speedY: Math.random() * 3 + 2,
                speedX: Math.random() * 2 - 1
            });
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);

            let activeParticles = 0;

            particles.forEach(p => {
                p.tiltAngle += p.tiltAngleIncremental;
                p.y += p.speedY;
                p.x += p.speedX;
                p.tilt = Math.sin(p.tiltAngle) * 12;

                if (p.y <= height) {
                    activeParticles++;
                }

                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
                ctx.stroke();
            });

            if (activeParticles > 0 && canvas.style.display !== 'none') {
                requestAnimationFrame(draw);
            } else {
                ctx.clearRect(0, 0, width, height);
            }
        }

        draw();
    }

    // Hỗ trợ phím tắt khi đang học Flashcard
    document.addEventListener('keydown', (e) => {
        if (currentActiveView !== 'view-flashcard') return;

        // Tránh kích hoạt phím tắt khi đang nhập liệu hoặc modal hiện lên
        if (document.activeElement.tagName === 'INPUT' ||
            document.activeElement.tagName === 'TEXTAREA' ||
            confirmModal.classList.contains('active')) {
            return;
        }

        if (e.code === 'Space') {
            e.preventDefault();
            flipFlashcard();
        } else if (isFlashcardFlipped) {
            if (e.key === '1') {
                rateRecall('hard');
            } else if (e.key === '2') {
                rateRecall('medium');
            } else if (e.key === '3') {
                rateRecall('easy');
            }
        }
    });

    // --- 15. CÁC HÀM TIỆN ÍCH KHÁC ---

    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // View 7: Flashcard Events Setup
    btnExitFlashcard.addEventListener('click', () => {
        showConfirmModal(
            'Thoát ôn tập Flashcard?',
            'Phiên học Flashcard hiện tại sẽ bị dừng và kết quả tạm thời không được lưu. Bạn vẫn muốn thoát?',
            () => {
                stopFlashcardTimer();
                showView('view-dashboard');
            }
        );
    });

    flashcardClickArea.addEventListener('click', flipFlashcard);
    btnFcFlip.addEventListener('click', flipFlashcard);

    btnFcHard.addEventListener('click', () => rateRecall('hard'));
    btnFcMedium.addEventListener('click', () => rateRecall('medium'));
    btnFcEasy.addEventListener('click', () => rateRecall('easy'));

    btnFcRestart.addEventListener('click', () => {
        if (activeQuizSet) {
            startFlashcards(activeQuizSet.id);
        }
    });

    btnFcHome.addEventListener('click', () => {
        showView('view-dashboard');
    });

    // --- 16. KHỞI CHẠY HỆ THỐNG (INITIALIZE) ---
    initTheme();
    loadData();
    showView('view-dashboard');
});
