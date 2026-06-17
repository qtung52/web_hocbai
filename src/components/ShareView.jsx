import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { formatShortDate } from '../utils/quizParser';

export default function ShareView({
    sharedQuizId,
    user,
    onImport,
    onStartPractice,
    onHome,
    showAlert
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
                const { data, error: fetchError } = await supabase
                    .from('quiz_sets')
                    .select('*')
                    .eq('id', sharedQuizId)
                    .maybeSingle(); // Use maybeSingle to avoid errors if 0 rows returned

                if (fetchError) throw fetchError;

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
                
                <div style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'left', background: 'var(--bg-app)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                    💡 <strong>Lưu ý cho Quản trị viên:</strong> Nếu bộ câu hỏi tồn tại nhưng vẫn báo lỗi, hãy đảm bảo bạn đã cấu hình RLS Policy <code>SELECT</code> trên Supabase Console cho phép người dùng khác đọc bảng <code>quiz_sets</code>.
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
                    <button className="btn btn-sm btn-primary" onClick={onHome} style={{ fontSize: '13px', padding: '6px 12px' }}>
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
                    {quizSet.questions.map((q, idx) => (
                        <div className="question-preview-item" key={idx}>
                            <div className="question-preview-title">
                                Câu {idx + 1}: {q.questionText}
                            </div>
                            <div className="answers-preview-grid">
                                {q.options.map((opt, oIdx) => {
                                    const isCorrect = oIdx === q.correctOptionIndex;
                                    return (
                                        <div 
                                            key={oIdx} 
                                            className={`answer-preview-option ${isCorrect ? 'correct' : ''}`}
                                        >
                                            <span style={{ fontWeight: '600' }}>
                                                {String.fromCharCode(65 + oIdx)}.
                                            </span>
                                            <span>{opt}</span>
                                            {isCorrect && <span style={{ marginLeft: 'auto' }}>✓ Đáp án đúng</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
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
                                showAlert('Vui lòng đăng nhập để thực hiện tính năng này.', 'Yêu cầu đăng nhập');
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
