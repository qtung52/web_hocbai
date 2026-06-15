import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ManageQuizView from './components/ManageQuizView';
import PracticeView from './components/PracticeView';
import TestView from './components/TestView';
import ResultsView from './components/ResultsView';
import StatsView from './components/StatsView';
import FlashcardView from './components/FlashcardView';
import TestSetupModal from './components/TestSetupModal';

export default function App() {
    // --- 1. Global State ---
    const [quizSets, setQuizSets] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [currentView, setCurrentView] = useState('view-dashboard');
    const [activeQuizSet, setActiveQuizSet] = useState(null);
    const [editingQuizId, setEditingQuizId] = useState(null);
    const [activeAttempt, setActiveAttempt] = useState(null);
    
    // Test Setup Modal State
    const [isTestSetupOpen, setIsTestSetupOpen] = useState(false);
    const [testSetupQuiz, setTestSetupQuiz] = useState(null);
    const [activeTestConfig, setActiveTestConfig] = useState(null);

    // Theme & Search State
    const [theme, setTheme] = useState('light');
    const [searchQuery, setSearchQuery] = useState('');
    const [modalConfig, setModalConfig] = useState(null); // { type, message, title, onOk, onCancel }

    // --- 2. Load Initial Data ---
    useEffect(() => {
        // Load theme
        const savedTheme = localStorage.getItem('eduquiz_theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Load Quiz Sets
        const storedSets = localStorage.getItem('eduquiz_sets');
        if (storedSets) {
            const parsed = JSON.parse(storedSets);
            // Clean old mock quizzes
            const cleaned = parsed.filter(set => !set.id.startsWith('mock-quiz-'));
            setQuizSets(cleaned);
            localStorage.setItem('eduquiz_sets', JSON.stringify(cleaned));
        } else {
            setQuizSets([]);
            localStorage.setItem('eduquiz_sets', JSON.stringify([]));
        }

        // Load attempts
        const storedAttempts = localStorage.getItem('eduquiz_attempts');
        if (storedAttempts) {
            setAttempts(JSON.parse(storedAttempts));
        } else {
            setAttempts([]);
        }
    }, []);

    // --- 3. Save Data on changes ---
    const saveQuizSets = (newSets) => {
        setQuizSets(newSets);
        localStorage.setItem('eduquiz_sets', JSON.stringify(newSets));
    };

    const saveAttempts = (newAttempts) => {
        setAttempts(newAttempts);
        localStorage.setItem('eduquiz_attempts', JSON.stringify(newAttempts));
    };

    // --- 4. Theme switcher ---
    const handleToggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('eduquiz_theme', newTheme);
    };

    // --- 4.5 Custom modal helper triggers ---
    const showAlert = (message, title = 'Thông báo', onOk = null) => {
        setModalConfig({
            type: 'alert',
            title,
            message,
            onOk: () => {
                setModalConfig(null);
                if (onOk) onOk();
            }
        });
    };

    const showConfirm = (message, onConfirm, onCancel = null, title = 'Xác nhận') => {
        setModalConfig({
            type: 'confirm',
            title,
            message,
            onOk: () => {
                setModalConfig(null);
                if (onConfirm) onConfirm();
            },
            onCancel: () => {
                setModalConfig(null);
                if (onCancel) onCancel();
            }
        });
    };

    // --- 5. Navigation & Warnings ---
    const handleViewChange = (targetView) => {
        if (currentView === 'view-test') {
            showConfirm('Tiến trình làm bài kiểm tra hiện tại sẽ bị mất. Bạn vẫn muốn thoát chứ?', () => {
                setCurrentView(targetView);
            });
        } else if (currentView === 'view-flashcard') {
            showConfirm('Phiên học Flashcard hiện tại sẽ bị dừng. Bạn vẫn muốn thoát chứ?', () => {
                setCurrentView(targetView);
            });
        } else {
            setCurrentView(targetView);
        }
    };

    // --- 6. Quiz Set Operations ---
    const handleSaveQuizSet = ({ title, folder, questions }) => {
        let updatedSets = [...quizSets];
        if (editingQuizId) {
            updatedSets = quizSets.map(set => {
                if (set.id === editingQuizId) {
                    return {
                        ...set,
                        title,
                        folder: folder || 'Chưa phân loại',
                        questions
                    };
                }
                return set;
            });
        } else {
            const newQuiz = {
                id: 'quiz-' + Date.now(),
                title,
                folder: folder || 'Chưa phân loại',
                questions,
                createdAt: new Date().toISOString()
            };
            updatedSets.push(newQuiz);
        }

        saveQuizSets(updatedSets);
        setEditingQuizId(null);
        setCurrentView('view-dashboard');
    };

    const handleEditQuizSet = (quizId) => {
        setEditingQuizId(quizId);
        setCurrentView('view-manage-quiz');
    };

    const handleDeleteQuizSet = (quizId) => {
        const set = quizSets.find(s => s.id === quizId);
        if (!set) return;

        showConfirm(`Bạn có chắc chắn muốn xóa bộ câu hỏi "${set.title}" không?`, () => {
            const updated = quizSets.filter(s => s.id !== quizId);
            saveQuizSets(updated);
        });
    };

    // --- 7. Play modes triggers ---
    const handleStartFlashcard = (quizId) => {
        const set = quizSets.find(s => s.id === quizId);
        if (set) {
            setActiveQuizSet(set);
            setCurrentView('view-flashcard');
        }
    };

    const handleStartPractice = (quizId) => {
        const set = quizSets.find(s => s.id === quizId);
        if (set) {
            setActiveQuizSet(set);
            setCurrentView('view-practice');
        }
    };

    const handleStartTestTrigger = (quizId) => {
        const set = quizSets.find(s => s.id === quizId);
        if (set) {
            setTestSetupQuiz(set);
            setIsTestSetupOpen(true);
        }
    };

    const handleStartTestConfirm = (config) => {
        setIsTestSetupOpen(false);
        setActiveTestConfig(config);
        setActiveQuizSet(testSetupQuiz);
        setCurrentView('view-test');
    };

    const handleTestSubmit = (attempt) => {
        const newAttempts = [attempt, ...attempts];
        saveAttempts(newAttempts);
        setActiveAttempt(attempt);
        setCurrentView('view-results');
    };

    const handleClearHistory = () => {
        saveAttempts([]);
    };

    const handleViewAttemptDetails = (attempt) => {
        setActiveAttempt(attempt);
        setCurrentView('view-results');
    };

    return (
        <div className="app-container">
            {/* Sidebar Navigation */}
            <Sidebar 
                currentView={currentView}
                onViewChange={handleViewChange}
                theme={theme}
                onToggleTheme={handleToggleTheme}
            />

            {/* Main Content Area */}
            <main className="main-content">
                {/* Header */}
                <Header 
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    showSearch={currentView === 'view-dashboard'}
                />

                {/* Views Wrapper */}
                <div className="views-wrapper">
                    {currentView === 'view-dashboard' && (
                        <DashboardView 
                            quizSets={quizSets}
                            attempts={attempts}
                            searchQuery={searchQuery}
                            onStartFlashcard={handleStartFlashcard}
                            onStartPractice={handleStartPractice}
                            onStartTest={handleStartTestTrigger}
                            onEditQuiz={handleEditQuizSet}
                            onDeleteQuiz={handleDeleteQuizSet}
                            onQuickCreate={() => { setEditingQuizId(null); setCurrentView('view-manage-quiz'); }}
                        />
                    )}

                    {currentView === 'view-manage-quiz' && (
                        <ManageQuizView 
                            quizSets={quizSets}
                            editingQuizSet={quizSets.find(s => s.id === editingQuizId)}
                            onSave={handleSaveQuizSet}
                            onCancel={() => setCurrentView('view-dashboard')}
                            showAlert={showAlert}
                            showConfirm={showConfirm}
                        />
                    )}

                    {currentView === 'view-practice' && (
                        <PracticeView 
                            quizSet={activeQuizSet}
                            onExit={() => setCurrentView('view-dashboard')}
                            showAlert={showAlert}
                        />
                    )}

                    {currentView === 'view-test' && (
                        <TestView 
                            quizSet={activeQuizSet}
                            config={activeTestConfig}
                            onCancel={() => setCurrentView('view-dashboard')}
                            onSubmit={handleTestSubmit}
                            showAlert={showAlert}
                            showConfirm={showConfirm}
                        />
                    )}

                    {currentView === 'view-results' && (
                        <ResultsView 
                            attempt={activeAttempt}
                            onRetry={() => handleStartTestTrigger(activeAttempt.quizId)}
                            onPracticeFlashcard={() => handleStartFlashcard(activeAttempt.quizId)}
                            onHome={() => setCurrentView('view-dashboard')}
                        />
                    )}

                    {currentView === 'view-stats' && (
                        <StatsView 
                            attempts={attempts}
                            onClearHistory={handleClearHistory}
                            onViewAttemptDetails={handleViewAttemptDetails}
                            showConfirm={showConfirm}
                        />
                    )}

                    {currentView === 'view-flashcard' && (
                        <FlashcardView 
                            quizSet={activeQuizSet}
                            onExit={() => setCurrentView('view-dashboard')}
                        />
                    )}
                </div>
            </main>

            {/* Test Setup Modal */}
            <TestSetupModal 
                isOpen={isTestSetupOpen}
                quizSet={testSetupQuiz}
                onCancel={() => setIsTestSetupOpen(false)}
                onStart={handleStartTestConfirm}
            />

            {/* Custom Alert & Confirm Modal Overlay */}
            {modalConfig && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal-card">
                        <div className="custom-modal-header">
                            <div className={`custom-modal-icon ${modalConfig.type}`}>
                                {modalConfig.type === 'alert' ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="16" x2="12" y2="12" />
                                        <line x1="12" y1="8" x2="12.01" y2="8" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                )}
                            </div>
                            <h3 className="custom-modal-title">{modalConfig.title}</h3>
                        </div>
                        <div className="custom-modal-body">{modalConfig.message}</div>
                        <div className="custom-modal-footer">
                            {modalConfig.type === 'confirm' && (
                                <button type="button" className="btn btn-outline" onClick={modalConfig.onCancel}>Hủy</button>
                            )}
                            <button type="button" className="btn btn-primary" onClick={modalConfig.onOk}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
