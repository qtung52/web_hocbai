import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { formatShortDate } from '../utils/quizParser';

export default function ShareView({
    sharedQuizId,
    user,
    onImport,
    onStartPractice,
    onHome,
    showAlert,
    showConfirm
}) {
    const [quizSet, setQuizSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!sharedQuizId) return;

        async function fetchSharedQuiz() {
            setLoading(true);
            setError(null);
            try {
                // Use the Supabase REST API directly with anon key to bypass any session-based RLS
                const response = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/quiz_sets?id=eq.${encodeURIComponent(sharedQuizId)}&select=*`,
                    {
                        headers: {
                            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                            'Accept': 'application/json',
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const rows = await response.json();
                const data = rows && rows.length > 0 ? rows[0] : null;

                if (!data) {
                    setError('Không tìm thấy bộ câu hỏi được chia sẻ hoặc dữ liệu đã bị xóa.');
                } else {
                    setQuizSet({
                        id: data.id,
                        title: data.title,
                        folder: data.folder || 'Chưa phân loại',
                        questions: data.questions || [],
                        createdAt: data.created_at
                    });
                }
            } catch (err) {
                console.error('Error fetching shared quiz:', err);
                setError('Có lỗi xảy ra khi tải bộ câu hỏi. Vui lòng đảm bảo liên kết chính xác.');
            } finally {
                setLoading(false);
            }
        }

        fetchSharedQuiz();
    }, [sharedQuizId]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: '16px' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Đang tải bộ câu hỏi chia sẻ...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="empty-state animate-fade-in" style={{ padding: '48px 24px', maxWidth: '600px', margin: '40px auto 0' }}>
                <div className="empty-icon" style={{ backgroundColor: 'var(--danger-soft)', color: 'var(--danger)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                </div>
                <h3>Lỗi truy cập liên kết</h3>
                <p style={{ marginBottom: '24px' }}>{error}</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" onClick={onHome}>Quay về Trang Chủ</button>
                </div>
            </div>
        );
    }

    return (
        <div className="share-view-container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="view-header" style={{ marginBottom: '20px' }}>
                <div>
                    <h1>Bộ câu hỏi được chia sẻ 🔗</h1>
                    <p className="subtitle">Xem trước nội dung và lưu về thư viện học tập của bạn.</p>
                </div>
                <button className="btn btn-outline" onClick={onHome}>
                    Quay lại Trang Chủ
                </button>
            </div>

            {!user && (
                <div className="share-login-banner animate-fade-in">
                    <span className="share-login-banner-text">
                        🔒 Bạn chưa đăng nhập. Vui lòng đăng nhập hoặc đăng ký tài khoản để có thể lưu bộ câu hỏi này vào thư viện học tập.
                    </span>
                    <button 
                        className="btn btn-sm btn-primary" 
                        onClick={() => {
                            try {
                                sessionStorage.setItem('redirect_hash', window.location.hash);
                            } catch (storageErr) {
                                console.warn('Could not set sessionStorage:', storageErr);
                            }
                            onHome();
                        }} 
                        style={{ fontSize: '13px', padding: '6px 12px' }}
                    >
                        Đăng nhập ngay
                    </button>
                </div>
            )}

            <div className="share-view-card">
                <div className="share-preview-header">
                    <div>
                        <span className="quiz-folder-badge" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'var(--primary-soft)',
                            color: 'var(--primary)',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '11px',
                            fontWeight: '600',
                            marginBottom: '10px'
                        }}>
                            📁 {quizSet.folder}
                        </span>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
                            {quizSet.title}
                        </h2>
                        <div className="quiz-card-meta" style={{ margin: 0 }}>
                            <span style={{ marginRight: '16px' }}>📝 {quizSet.questions.length} câu hỏi</span>
                            <span>📅 Ngày tạo: {formatShortDate(quizSet.createdAt)}</span>
                        </div>
                    </div>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    👀 Xem trước câu hỏi ({quizSet.questions.length})
                </h3>

                <div className="questions-preview-list">
                    {quizSet.questions.map((q, idx) => {
                        // Parse raw DB format: { question: "...\nA. ...", answer: "B", image: "" }
                        const questionText = q.question || q.questionText || '';
                        const answerText = (q.answer || '').trim().toUpperCase().charAt(0);
                        const lines = questionText.split('\n');
                        const descLines = [];
                        const optionLines = [];
                        lines.forEach(line => {
                            const trimmed = line.trim();
                            if (/^[A-Z]\s*[\.\-\)]\s*/i.test(trimmed)) {
                                optionLines.push(trimmed);
                            } else if (trimmed) {
                                descLines.push(trimmed);
                            }
                        });
                        const description = descLines.join(' ');

                        return (
                            <div className="question-preview-item" key={idx}>
                                <div className="question-preview-title">
                                    Câu {idx + 1}: {description || questionText}
                                </div>
                                {optionLines.length > 0 && (
                                    <div className="answers-preview-grid">
                                        {optionLines.map((optLine, oIdx) => {
                                            const optLetter = optLine.charAt(0).toUpperCase();
                                            const isCorrect = optLetter === answerText;
                                            return (
                                                <div
                                                    key={oIdx}
                                                    className={`answer-preview-option ${isCorrect ? 'correct' : ''}`}
                                                >
                                                    <span style={{ fontWeight: '600' }}>{optLetter}.</span>
                                                    <span>{optLine.replace(/^[A-Z]\s*[\.\-\)]\s*/i, '')}</span>
                                                    {isCorrect && <span style={{ marginLeft: 'auto' }}>✓ Đáp án đúng</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="share-actions">
                    <button 
                        className="btn btn-outline-primary" 
                        style={{ flex: 1, padding: '12px' }}
                        onClick={() => onStartPractice(quizSet)}
                    >
                        Luyện Tập Ngay 🚀
                    </button>
                    
                    <button 
                        className="btn btn-primary" 
                        style={{ flex: 1.5, padding: '12px' }}
                        onClick={() => {
                            if (!user) {
                                if (showConfirm) {
                                    showConfirm(
                                        'Bạn cần đăng nhập để lưu bộ câu hỏi này vào thư viện. Bạn có muốn đăng nhập ngay không?',
                                        () => {
                                            try {
                                                sessionStorage.setItem('redirect_hash', window.location.hash);
                                            } catch (storageErr) {
                                                console.warn('Could not set sessionStorage:', storageErr);
                                            }
                                            onHome();
                                        },
                                        null,
                                        'Yêu cầu đăng nhập'
                                    );
                                } else {
                                    showAlert('Vui lòng đăng nhập để thực hiện tính năng này.', 'Yêu cầu đăng nhập');
                                }
                                return;
                            }
                            onImport(quizSet);
                        }}
                    >
                        Lưu vào thư viện của tôi 📥
                    </button>
                </div>
            </div>
        </div>
    );
}
