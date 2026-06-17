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
import ShareView from './components/ShareView';
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
        if (initialHash && initialHash.startsWith('#/share/')) {
            return 'view-share';
        }
        return (initialHash && hashToView[initialHash]) ? hashToView[initialHash] : 'view-dashboard';
    });
    const [sharedQuizId, setSharedQuizId] = useState(() => {
        const initialHash = window.location.hash;
        return (initialHash && initialHash.startsWith('#/share/')) ? initialHash.replace('#/share/', '') : null;
    });
    const [shareModalConfig, setShareModalConfig] = useState(null); // { isOpen, quizTitle, shareUrl, copied }
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

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isSidebarOpen]);



    // Listen for browser back/forward buttons (hash changes)
    useEffect(() => {
        const handleHashChange = () => {
            const currentHash = window.location.hash || '#/home';
            if (currentHash.startsWith('#/share/')) {
                const quizId = currentHash.replace('#/share/', '');
                setSharedQuizId(quizId);
                setCurrentView('view-share');
            } else {
                const targetView = hashToView[currentHash];
                if (targetView && targetView !== currentView) {
                    setCurrentView(targetView);
                }
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [currentView]);

    // Sync React state views to hash URL
    useEffect(() => {
        if (currentView === 'view-share') {
            if (sharedQuizId) {
                const targetHash = `#/share/${sharedQuizId}`;
                if (window.location.hash !== targetHash) {
                    window.location.hash = targetHash;
                }
            }
        } else {
            const targetHash = viewToHash[currentView] || '#/home';
            if (window.location.hash !== targetHash) {
                window.location.hash = targetHash;
            }
        }
    }, [currentView, sharedQuizId]);

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
            if (session?.user) {
                // If there is a redirect hash stored, restore it
                try {
                    const redirectHash = sessionStorage.getItem('redirect_hash');
                    if (redirectHash) {
                        sessionStorage.removeItem('redirect_hash');
                        window.location.hash = redirectHash;
                    }
                } catch (storageErr) {
                    console.warn('Could not access sessionStorage:', storageErr);
                }
            } else if (event === 'SIGNED_OUT') {
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

    const handleShareQuiz = (quiz) => {
        const origin = window.location.origin;
        const shareUrl = `${origin}/#/share/${quiz.id}`;
        setShareModalConfig({
            isOpen: true,
            quizTitle: quiz.title,
            shareUrl,
            copied: false
        });
    };

    const handleImportQuizSet = async (sharedQuiz) => {
        if (!user) return;
        const targetId = 'quiz-' + Date.now();
        const createdAt = new Date().toISOString();

        try {
            const dbData = {
                id: targetId,
                user_id: user.id,
                title: sharedQuiz.title,
                folder: sharedQuiz.folder,
                questions: sharedQuiz.questions,
                created_at: createdAt
            };

            const { error } = await supabase
                .from('quiz_sets')
                .upsert(dbData);

            if (error) throw error;

            const newSet = {
                id: targetId,
                title: dbData.title,
                folder: dbData.folder,
                questions: dbData.questions,
                createdAt: dbData.created_at
            };

            setQuizSets(prev => [newSet, ...prev]);
            showAlert('Lưu bộ câu hỏi vào thư viện thành công!', 'Thành công', () => {
                setCurrentView('view-dashboard');
            });
        } catch (err) {
            console.error('Error importing quiz set:', err);
            showAlert('Không thể lưu bộ câu hỏi vào đám mây. Vui lòng thử lại.', 'Lỗi lưu dữ liệu');
        }
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

    const isPublicView = currentView === 'view-share' || (currentView === 'view-practice' && activeQuizSet);

    if ((!user && !isPublicView) || isPasswordRecovery) {
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
                onClose={() => setIsSidebarOpen(false)}
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
                            onShareQuiz={handleShareQuiz}
                            onQuickCreate={() => { setEditingQuizId(null); setCurrentView('view-manage-quiz'); }}
                        />
                    )}

                    {currentView === 'view-share' && (
                        <ShareView 
                            sharedQuizId={sharedQuizId}
                            user={user}
                            onImport={handleImportQuizSet}
                            onStartPractice={(quiz) => {
                                setActiveQuizSet(quiz);
                                setCurrentView('view-practice');
                            }}
                            onHome={() => setCurrentView('view-dashboard')}
                            showAlert={showAlert}
                            showConfirm={showConfirm}
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

            {/* Share Modal */}
            {shareModalConfig && shareModalConfig.isOpen && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal-card" style={{ maxWidth: '500px' }}>
                        <div className="custom-modal-header">
                            <div className="custom-modal-icon alert" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 className="custom-modal-title">Chia sẻ bộ câu hỏi</h3>
                        </div>
                        <div className="custom-modal-body">
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                Chia sẻ liên kết dưới đây để người dùng khác có thể luyện tập hoặc lưu bộ câu hỏi <strong>"{shareModalConfig.quizTitle}"</strong> vào thư viện của họ.
                            </p>
                             <div className="share-link-container">
                                <input 
                                    type="text" 
                                    className="share-link-input" 
                                    value={shareModalConfig.shareUrl} 
                                    readOnly 
                                    onClick={(e) => e.target.select()}
                                />
                                <button 
                                    type="button" 
                                    className={`btn btn-sm ${shareModalConfig.copied ? 'btn-success' : 'btn-primary'} share-copy-btn`}
                                    onClick={() => {
                                        const text = shareModalConfig.shareUrl;
                                        const doCopy = () => {
                                            if (navigator.clipboard && navigator.clipboard.writeText) {
                                                return navigator.clipboard.writeText(text);
                                            } else {
                                                const textArea = document.createElement("textarea");
                                                textArea.value = text;
                                                textArea.style.position = "fixed";
                                                document.body.appendChild(textArea);
                                                textArea.focus();
                                                textArea.select();
                                                try {
                                                    document.execCommand('copy');
                                                    document.body.removeChild(textArea);
                                                    return Promise.resolve();
                                                } catch (err) {
                                                    document.body.removeChild(textArea);
                                                    return Promise.reject(err);
                                                }
                                            }
                                        };
                                        
                                        doCopy()
                                            .then(() => {
                                                setShareModalConfig(prev => ({ ...prev, copied: true }));
                                                setTimeout(() => {
                                                    setShareModalConfig(prev => ({ ...prev, copied: false }));
                                                }, 2000);
                                            })
                                            .catch(err => {
                                                console.error('Copy failed:', err);
                                                showAlert('Không thể tự động sao chép. Vui lòng chọn và sao chép thủ công liên kết.', 'Lỗi sao chép');
                                            });
                                    }}
                                >
                                    {shareModalConfig.copied ? 'Đã chép ✓' : 'Sao chép'}
                                </button>
                            </div>
                        </div>
                        <div className="custom-modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-outline" 
                                onClick={() => setShareModalConfig(null)}
                                style={{ width: '100%' }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
