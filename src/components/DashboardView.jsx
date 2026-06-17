import React, { useState } from 'react';
import { formatDate, formatShortDate } from '../utils/quizParser';

export default function DashboardView({
    quizSets,
    attempts,
    searchQuery,
    onStartFlashcard,
    onStartPractice,
    onStartTest,
    onEditQuiz,
    onDeleteQuiz,
    onShareQuiz,
    onQuickCreate
}) {
    const [activeFolderFilter, setActiveFolderFilter] = useState('Tất cả');
    const [exportQuiz, setExportQuiz] = useState(null);
    const [copied, setCopied] = useState(false);

    // Build plain text from a quiz set
    const buildExportText = (set) => {
        const lines = [];
        lines.push(`=== ${set.title} ===`);
        lines.push(`Thư mục: ${set.folder || 'Chưa phân loại'}`);
        lines.push(`Số câu hỏi: ${set.questions.length}`);
        lines.push('');
        set.questions.forEach((q, idx) => {
            const text = q.question || q.questionText || '';
            lines.push(`Câu ${idx + 1}: ${text}`);
            lines.push(`Đáp án: ${q.answer || ''}`);
            lines.push('');
        });
        return lines.join('\n');
    };

    const handleExport = (set) => {
        setExportQuiz(set);
        setCopied(false);
    };

    const handleCopy = (text) => {
        const doCopy = () => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                return navigator.clipboard.writeText(text);
            }
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            document.body.appendChild(ta);
            ta.focus(); ta.select();
            try { document.execCommand('copy'); document.body.removeChild(ta); return Promise.resolve(); }
            catch (e) { document.body.removeChild(ta); return Promise.reject(e); }
        };
        doCopy().then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDownload = (set, text) => {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${set.title.replace(/[/\\?%*:|"<>]/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Statistics
    const totalSets = quizSets.length;
    const totalAttempts = attempts.length;
    let highestScore = '0%';
    let averageAccuracy = '0%';
    if (totalAttempts > 0) {
        const highest = Math.max(...attempts.map(a => a.accuracy));
        highestScore = `${Math.round(highest)}%`;
        const avg = attempts.reduce((s, a) => s + a.accuracy, 0) / totalAttempts;
        averageAccuracy = `${Math.round(avg)}%`;
    }

    const uniqueFolders = Array.from(new Set(quizSets.map(set => set.folder || 'Chưa phân loại').filter(Boolean)));
    const foldersList = ['Tất cả', ...uniqueFolders];

    const filteredSets = quizSets.filter(set => {
        const matchesSearch = set.title.toLowerCase().includes(searchQuery.toLowerCase());
        const setFolder = set.folder || 'Chưa phân loại';
        const matchesFolder = activeFolderFilter === 'Tất cả' || setFolder === activeFolderFilter;
        return matchesSearch && matchesFolder;
    });

    const exportText = exportQuiz ? buildExportText(exportQuiz) : '';

    return (
        <section id="view-dashboard" className="app-view active">
            <div className="view-header animate-fade-in">
                <div>
                    <h1>Chào mừng bạn trở lại! 👋</h1>
                    <p className="subtitle">Bắt đầu học tập và nâng cao kiến thức của bạn hôm nay.</p>
                </div>
                <button className="btn btn-primary" onClick={onQuickCreate}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <path d="M12 5V19M5 12H19" strokeLinecap="round"/>
                    </svg>
                    Tạo Bộ Câu Hỏi Mới
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid animate-fade-in">
                <div className="stats-card">
                    <div className="stats-icon primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                        </svg>
                    </div>
                    <div className="stats-info">
                        <span className="stats-value">{totalSets}</span>
                        <span className="stats-label">Bộ Câu Hỏi Đã Tạo</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-icon success">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div className="stats-info">
                        <span className="stats-value">{totalAttempts}</span>
                        <span className="stats-label">Tổng Lượt Làm Bài</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-icon warning">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                        </svg>
                    </div>
                    <div className="stats-info">
                        <span className="stats-value">{highestScore}</span>
                        <span className="stats-label">Điểm Số Cao Nhất</span>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-icon info">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"/>
                        </svg>
                    </div>
                    <div className="stats-info">
                        <span className="stats-value">{averageAccuracy}</span>
                        <span className="stats-label">Tỷ Lệ Chính Xác TB</span>
                    </div>
                </div>
            </div>

            {/* Quiz Lists */}
            <div className="content-section animate-fade-in">
                <div className="section-title-bar" style={{ marginBottom: '16px' }}>
                    <h2>Danh Sách Bộ Câu Hỏi</h2>
                    <div className="filter-badge">{filteredSets.length} bộ câu hỏi</div>
                </div>

                {quizSets.length > 0 && (
                    <div className="folder-tabs-wrapper" style={{ marginBottom: '24px', overflowX: 'auto' }}>
                        <div className="folder-tabs" style={{ display: 'flex', gap: '8px', paddingBottom: '4px' }}>
                            {foldersList.map(folderName => (
                                <button
                                    key={folderName}
                                    type="button"
                                    className={`folder-tab-btn ${activeFolderFilter === folderName ? 'active' : ''}`}
                                    onClick={() => setActiveFolderFilter(folderName)}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        padding: '8px 16px', fontSize: '13px', fontWeight: '500',
                                        borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)',
                                        background: activeFolderFilter === folderName ? 'var(--primary)' : 'var(--bg-card)',
                                        color: activeFolderFilter === folderName ? 'var(--text-on-primary)' : 'var(--text-muted)',
                                        cursor: 'pointer', transition: 'var(--transition-all)', whiteSpace: 'nowrap'
                                    }}
                                >
                                    <span>📁</span>
                                    <span>{folderName}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {filteredSets.length === 0 ? (
                    <div className="empty-state" id="empty-quiz-state">
                        <div className="empty-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                            </svg>
                        </div>
                        <h3>Chưa có bộ câu hỏi nào phù hợp</h3>
                        <p>Hãy tạo bộ câu hỏi đầu tiên của bạn để bắt đầu luyện tập hoặc kiểm tra.</p>
                        <button className="btn btn-primary" onClick={onQuickCreate}>Tạo Bộ Câu Hỏi</button>
                    </div>
                ) : (
                    <div className="quiz-grid" id="quiz-sets-grid" style={{ display: 'grid' }}>
                        {filteredSets.map(set => (
                            <div className="quiz-card" key={set.id}>
                                {/* Action buttons top-right */}
                                <button
                                    className="quiz-card-share-btn"
                                    title="Chia sẻ bộ câu hỏi"
                                    aria-label="Share quiz"
                                    onClick={() => onShareQuiz(set)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                <button
                                    className="quiz-card-export-btn"
                                    title="Xuất nội dung văn bản"
                                    aria-label="Export quiz text"
                                    onClick={() => handleExport(set)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                        <line x1="16" y1="13" x2="8" y2="13"/>
                                        <line x1="16" y1="17" x2="8" y2="17"/>
                                        <polyline points="10 9 9 9 8 9"/>
                                    </svg>
                                </button>
                                <button
                                    className="quiz-card-edit-btn"
                                    title="Chỉnh sửa bộ câu hỏi"
                                    aria-label="Edit quiz"
                                    onClick={() => onEditQuiz(set.id)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </button>
                                <button
                                    className="quiz-card-delete-btn"
                                    title="Xóa bộ câu hỏi"
                                    aria-label="Delete quiz"
                                    onClick={() => onDeleteQuiz(set.id)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                </button>

                                <div className="quiz-card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginBottom: '12px' }}>
                                    <span className="quiz-folder-badge" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        backgroundColor: 'var(--primary-soft)', color: 'var(--primary)',
                                        padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                                        fontSize: '11px', fontWeight: '600'
                                    }}>
                                        📁 {set.folder || 'Chưa phân loại'}
                                    </span>
                                    <h3 className="quiz-card-title">{set.title}</h3>
                                </div>
                                <div className="quiz-card-meta">
                                    <div className="quiz-meta-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                        </svg>
                                        <span>{set.questions.length} câu hỏi</span>
                                    </div>
                                    <div className="quiz-meta-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                        <span>{formatShortDate(set.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="quiz-card-actions">
                                    <button
                                        className="btn btn-outline-primary btn-flashcard-trigger"
                                        style={{ gridColumn: 'span 2' }}
                                        onClick={() => onStartFlashcard(set.id)}
                                    >
                                        Học Flashcard 3D 🔄
                                    </button>
                                    <button
                                        className="btn btn-outline btn-practice-trigger"
                                        onClick={() => onStartPractice(set.id)}
                                    >
                                        Luyện Tập
                                    </button>
                                    <button
                                        className="btn btn-primary btn-test-trigger"
                                        onClick={() => onStartTest(set.id)}
                                    >
                                        Kiểm Tra
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Export Text Modal */}
            {exportQuiz && (
                <div className="custom-modal-overlay" onClick={() => setExportQuiz(null)}>
                    <div
                        className="custom-modal-card"
                        style={{ maxWidth: '680px', width: '95%' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="custom-modal-header">
                            <div className="custom-modal-icon alert" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                </svg>
                            </div>
                            <h3 className="custom-modal-title">Xuất nội dung văn bản</h3>
                        </div>

                        <div className="custom-modal-body">
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                                📋 <strong>{exportQuiz.title}</strong> — {exportQuiz.questions.length} câu hỏi
                            </p>
                            <textarea
                                readOnly
                                value={exportText}
                                onClick={e => e.target.select()}
                                style={{
                                    width: '100%',
                                    height: '320px',
                                    resize: 'vertical',
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                    lineHeight: '1.6',
                                    padding: '12px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-app)',
                                    color: 'var(--text-main)',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div className="custom-modal-footer" style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setExportQuiz(null)}>
                                Đóng
                            </button>
                            <button
                                type="button"
                                className={`btn ${copied ? 'btn-success' : 'btn-outline'}`}
                                onClick={() => handleCopy(exportText)}
                                style={{ minWidth: '120px' }}
                            >
                                {copied ? '✓ Đã sao chép!' : '📋 Sao chép'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => handleDownload(exportQuiz, exportText)}
                            >
                                ⬇️ Tải file .txt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
