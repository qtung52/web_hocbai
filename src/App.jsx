import { useState, useEffect } from 'react';
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
import AuthView from './components/AuthView';
import ProfileSettingsView from './components/ProfileSettingsView';
import { supabase } from './utils/supabase';

const viewToHash = {
    'view-dashboard': '#/home',
    'view-manage-quiz': '#/create-quiz',
    'view-stats': '#/stats',
    'view-profile-settings': '#/profile-settings',
    'view-practice': '#/practice',
    'view-test': '#/test',
    'view-results': '#/results',
    'view-flashcard': '#/flashcard'
};

const hashToView = {
    '#/home': 'view-dashboard',
    '#/dashboard': 'view-dashboard',
    '#/create-quiz': 'view-manage-quiz',
    '#/stats': 'view-stats',
    '#/profile-settings': 'view-profile-settings',
    '#/practice': 'view-practice',
    '#/test': 'view-test',
    '#/results': 'view-results',
    '#/flashcard': 'view-flashcard'
};

export default function App() {
    // --- 1. Global State ---
    const [user, setUser] = useState(null);
    const [sessionLoading, setSessionLoading] = useState(true);
    const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
    const [quizSets, setQuizSets] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [currentView, setCurrentView] = useState(() => {
        const initialHash = window.location.hash;
        return (initialHash && hashToView[initialHash]) ? hashToView[initialHash] : 'view-dashboard';
    });
    const [activeQuizSet, setActiveQuizSet] = useState(null);
    const [editingQuizId, setEditingQuizId] = useState(null);
    const [activeAttempt, setActiveAttempt] = useState(null);
    
    // Test Setup Modal State
    const [isTestSetupOpen, setIsTestSetupOpen] = useState(false);
    const [testSetupQuiz, setTestSetupQuiz] = useState(null);
    const [activeTestConfig, setActiveTestConfig] = useState(null);

    // Theme & Search State
    const [theme, setTheme] = useState(() => localStorage.getItem('eduquiz_theme') || 'light');
    const [searchQuery, setSearchQuery] = useState('');
    const [modalConfig, setModalConfig] = useState(null); // { type, message, title, onOk, onCancel }
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- 1.5 Custom modal helper triggers ---
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

    // --- 2. Load Initial Session, Theme, and Routing ---
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Scroll to top on view changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentView]);



    // Listen for browser back/forward buttons (hash changes)
    useEffect(() => {
        const handleHashChange = () => {
            const currentHash = window.location.hash || '#/home';
            const targetView = hashToView[currentHash];
            if (targetView && targetView !== currentView) {
                setCurrentView(targetView);
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [currentView]);

    // Sync React state views to hash URL
    useEffect(() => {
        const targetHash = viewToHash[currentView] || '#/home';
        if (window.location.hash !== targetHash) {
            window.location.hash = targetHash;
        }
    }, [currentView]);

    useEffect(() => {
        // Fetch current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setSessionLoading(false);
        });

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            setSessionLoading(false);
            if (event === 'PASSWORD_RECOVERY') {
                setIsPasswordRecovery(true);
            }
            if (!session?.user) {
                // Clear states on logout
                setQuizSets([]);
                setAttempts([]);
                setCurrentView('view-dashboard');
                setActiveQuizSet(null);
                setEditingQuizId(null);
                setActiveAttempt(null);
                setIsPasswordRecovery(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // --- 3. Synchronize Data with Supabase when User Changes ---
    useEffect(() => {
        if (!user) return;

        const fetchUserData = async () => {
            try {
                // Fetch Quiz Sets
                const { data: fetchedQuizSets, error: quizError } = await supabase
                    .from('quiz_sets')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (quizError) throw quizError;

                const mappedQuizzes = (fetchedQuizSets || []).map(q => ({
                    id: q.id,
                    title: q.title,
                    folder: q.folder || 'Chưa phân loại',
                    questions: q.questions,
                    createdAt: q.created_at
                }));
                setQuizSets(mappedQuizzes);

                // Fetch Attempts
                const { data: fetchedAttempts, error: attemptError } = await supabase
                    .from('attempts')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (attemptError) throw attemptError;

                const mappedAttempts = (fetchedAttempts || []).map(a => ({
                    id: a.id,
                    quizId: a.quiz_id,
                    quizTitle: a.quiz_title,
                    createdAt: a.created_at,
                    duration: a.duration,
                    correctCount: a.correct_count,
                    totalCount: a.total_count,
                    accuracy: parseFloat(a.accuracy),
                    reviewDetails: a.review_details
                }));
                setAttempts(mappedAttempts);
            } catch (err) {
                console.error('Error synchronizing with Supabase:', err);
                showAlert('Không thể tải dữ liệu đồng bộ từ đám mây.', 'Lỗi đồng bộ');
            }
        };

        fetchUserData();
    }, [user]);

    // --- 4. Theme switcher ---
    const handleToggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('eduquiz_theme', newTheme);
    };

    // --- 5. Navigation & Warnings ---
    const handleViewChange = (targetView) => {
        setIsSidebarOpen(false);
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
    const handleSaveQuizSet = async ({ title, folder, questions }) => {
        if (!user) return;
        
        const isNew = !editingQuizId;
        const targetId = editingQuizId || 'quiz-' + Date.now();
        const existingSet = editingQuizId ? quizSets.find(s => s.id === editingQuizId) : null;
        const createdAt = existingSet ? existingSet.createdAt : new Date().toISOString();

        try {
            const dbData = {
                id: targetId,
                user_id: user.id,
                title,
                folder: folder || 'Chưa phân loại',
                questions,
                created_at: createdAt
            };

            const { error } = await supabase
                .from('quiz_sets')
                .upsert(dbData);

            if (error) throw error;

            let updatedSets;
            if (isNew) {
                updatedSets = [...quizSets, {
                    id: targetId,
                    title,
                    folder: folder || 'Chưa phân loại',
                    questions,
                    createdAt
                }];
            } else {
                updatedSets = quizSets.map(set => {
                    if (set.id === targetId) {
                        return {
                            ...set,
                            title,
                            folder: folder || 'Chưa phân loại',
                            questions
                        };
                    }
                    return set;
                });
            }

            setQuizSets(updatedSets);
            setEditingQuizId(null);
            setCurrentView('view-dashboard');
        } catch (err) {
            console.error('Error saving quiz set:', err);
            showAlert('Không thể lưu bộ câu hỏi lên hệ thống đám mây. Vui lòng thử lại.', 'Lỗi lưu dữ liệu');
        }
    };

    const handleEditQuizSet = (quizId) => {
        setEditingQuizId(quizId);
        setCurrentView('view-manage-quiz');
    };

    const handleDeleteQuizSet = (quizId) => {
        if (!user) return;
        const set = quizSets.find(s => s.id === quizId);
        if (!set) return;

        showConfirm(`Bạn có chắc chắn muốn xóa bộ câu hỏi "${set.title}" không?`, async () => {
            try {
                const { error } = await supabase
                    .from('quiz_sets')
                    .delete()
                    .eq('id', quizId)
                    .eq('user_id', user.id);

                if (error) throw error;

                const updated = quizSets.filter(s => s.id !== quizId);
                setQuizSets(updated);
            } catch (err) {
                console.error('Error deleting quiz set:', err);
                showAlert('Không thể xóa bộ câu hỏi khỏi đám mây.', 'Lỗi xóa dữ liệu');
            }
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

    const handleTestSubmit = async (attempt) => {
        if (!user) return;
        try {
            const dbData = {
                id: attempt.id,
                user_id: user.id,
                quiz_id: attempt.quizId,
                quiz_title: attempt.quizTitle,
                created_at: attempt.createdAt,
                duration: attempt.duration,
                correct_count: attempt.correctCount,
                total_count: attempt.totalCount,
                accuracy: attempt.accuracy,
                review_details: attempt.reviewDetails
            };

            const { error } = await supabase
                .from('attempts')
                .insert(dbData);

            if (error) throw error;

            const newAttempts = [attempt, ...attempts];
            setAttempts(newAttempts);
            setActiveAttempt(attempt);
            setCurrentView('view-results');
        } catch (err) {
            console.error('Error saving attempt:', err);
            showAlert('Không thể lưu kết quả làm bài lên đám mây.', 'Lỗi lưu kết quả');
            // Fallback to local state update even on db failure so the user doesn't lose current view
            const newAttempts = [attempt, ...attempts];
            setAttempts(newAttempts);
            setActiveAttempt(attempt);
            setCurrentView('view-results');
        }
    };

    const handleClearHistory = async () => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('attempts')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;

            setAttempts([]);
        } catch (err) {
            console.error('Error clearing history:', err);
            showAlert('Không thể xóa lịch sử làm bài trên đám mây.', 'Lỗi xóa lịch sử');
        }
    };

    const handleViewAttemptDetails = (attempt) => {
        setActiveAttempt(attempt);
        setCurrentView('view-results');
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (err) {
            console.error('Error signing out:', err);
            showAlert('Đã có lỗi xảy ra khi đăng xuất.', 'Lỗi đăng xuất');
        }
    };

    if (sessionLoading) {
        return (
            <div className="auth-loading-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px', background: 'var(--bg-app)' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Đang tải phiên làm việc...</span>
            </div>
        );
    }

    if (!user || isPasswordRecovery) {
        return (
            <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-app)' }}>
                <AuthView 
                    showAlert={showAlert} 
                    recoveryMode={isPasswordRecovery}
                    onPasswordResetComplete={() => setIsPasswordRecovery(false)}
                />
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

    return (
        <div className="app-container">
            {/* Sidebar Navigation */}
            <Sidebar 
                currentView={currentView}
                onViewChange={handleViewChange}
                theme={theme}
                onToggleTheme={handleToggleTheme}
                isOpen={isSidebarOpen}
                user={user}
                onLogout={handleLogout}
            />

            {/* Sidebar Backdrop Overlay on Mobile */}
            {isSidebarOpen && (
                <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Main Content Area */}
            <main className="main-content">
                {/* Header */}
                <Header 
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    showSearch={currentView === 'view-dashboard'}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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

                    {currentView === 'view-profile-settings' && (
                        <ProfileSettingsView 
                            user={user}
                            showAlert={showAlert}
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
