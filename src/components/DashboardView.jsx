import React from 'react';
import { formatDate } from '../utils/quizParser';

export default function DashboardView({
    quizSets,
    attempts,
    searchQuery,
    onStartFlashcard,
    onStartPractice,
    onStartTest,
    onEditQuiz,
    onDeleteQuiz,
    onQuickCreate
}) {
    // 1. Calculate statistics
    const totalSets = quizSets.length;
    const totalAttempts = attempts.length;

    let highestScore = '0%';
    let averageAccuracy = '0%';

    if (totalAttempts > 0) {
        const highest = Math.max(...attempts.map(a => a.accuracy));
        highestScore = `${Math.round(highest)}%`;

        const sumAccuracy = attempts.reduce((sum, current) => sum + current.accuracy, 0);
        const avg = sumAccuracy / totalAttempts;
        averageAccuracy = `${Math.round(avg)}%`;
    }

    // 2. Filter quiz sets based on searchQuery
    const filteredSets = quizSets.filter(set =>
        set.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                <div className="section-title-bar">
                    <h2>Danh Sách Bộ Câu Hỏi</h2>
                    <div className="filter-badge">{filteredSets.length} bộ câu hỏi</div>
                </div>

                {/* Empty state */}
                {filteredSets.length === 0 ? (
                    <div className="empty-state" id="empty-quiz-state">
                        <div className="empty-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                            </svg>
                        </div>
                        <h3>Chưa có bộ câu hỏi nào</h3>
                        <p>Hãy tạo bộ câu hỏi đầu tiên của bạn để bắt đầu luyện tập hoặc kiểm tra.</p>
                        <button className="btn btn-primary" onClick={onQuickCreate}>Tạo Bộ Câu Hỏi</button>
                    </div>
                ) : (
                    <div className="quiz-grid" id="quiz-sets-grid" style={{ display: 'grid' }}>
                        {filteredSets.map(set => (
                            <div className="quiz-card" key={set.id}>
                                <button 
                                    className="quiz-card-edit-btn" 
                                    title="Chỉnh sửa bộ câu hỏi" 
                                    aria-label="Edit quiz"
                                    onClick={() => onEditQuiz(set.id)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </button>
                                <button 
                                    className="quiz-card-delete-btn" 
                                    title="Xóa bộ câu hỏi" 
                                    aria-label="Delete quiz"
                                    onClick={() => onDeleteQuiz(set.id)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                </button>
                                <div className="quiz-card-header">
                                    <h3 className="quiz-card-title">{set.title}</h3>
                                </div>
                                <div className="quiz-card-meta">
                                    <div className="quiz-meta-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                        </svg>
                                        <span>{set.questions.length} câu hỏi</span>
                                    </div>
                                    <div className="quiz-card-meta">
                                        <div className="quiz-meta-item" style={{ gap: '4px' }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                            </svg>
                                            <span>{formatDate(set.createdAt).split(' ')[1] || formatDate(set.createdAt).split(',')[1]?.trim() || formatDate(set.createdAt)}</span>
                                        </div>
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
        </section>
    );
}
