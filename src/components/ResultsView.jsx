import React from 'react';
import { formatDuration } from '../utils/quizParser';

export default function ResultsView({ attempt, onRetry, onPracticeFlashcard, onHome }) {
    if (!attempt) return null;

    const radius = 80;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (attempt.accuracy / 100) * circumference;

    const getRatingText = (acc) => {
        if (acc >= 90) return 'Tuyệt vời! 🌟';
        if (acc >= 75) return 'Rất tốt! 👍';
        if (acc >= 50) return 'Khá tốt! 🙂';
        return 'Cần cố gắng thêm! 📚';
    };

    return (
        <section id="view-results" className="app-view active">
            <div className="view-header">
                <div>
                    <h1>Kết Quả Kiểm Tra</h1>
                    <p className="subtitle" id="results-quiz-title">{attempt.quizTitle}</p>
                </div>
                <button className="btn btn-outline" onClick={onHome}>
                    Quay Về Trang Chủ
                </button>
            </div>

            <div className="results-dashboard">
                {/* Score Card */}
                <div className="card-panel result-score-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px' }}>
                    <div className="circular-progress-wrapper" style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '20px' }}>
                        <svg className="progress-ring" width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
                            <circle 
                                className="progress-ring__circle-bg" 
                                stroke="#E2E8F0" 
                                strokeWidth="16" 
                                fill="transparent" 
                                r={radius} 
                                cx="100" 
                                cy="100"
                            />
                            <circle 
                                className="progress-ring__circle" 
                                stroke="var(--primary)" 
                                strokeWidth="16" 
                                fill="transparent" 
                                r={radius} 
                                cx="100" 
                                cy="100" 
                                strokeLinecap="round"
                                style={{
                                    strokeDasharray: `${circumference} ${circumference}`,
                                    strokeDashoffset: strokeDashoffset,
                                    transition: 'stroke-dashoffset 0.35s'
                                }}
                            />
                        </svg>
                        <div className="score-text-container" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span className="score-percentage" style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-main)' }}>
                                {Math.round(attempt.accuracy)}%
                            </span>
                            <span className="score-fraction" style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>
                                {attempt.correctCount} / {attempt.totalCount} câu
                            </span>
                        </div>
                    </div>
                    <h2 className="result-message" style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                        {getRatingText(attempt.accuracy)}
                    </h2>
                    <p className="result-time" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        Thời gian hoàn thành: <strong>{formatDuration(attempt.duration)}</strong>
                    </p>
                </div>

                {/* Statistics breakdown and corrections review */}
                <div className="result-breakdown-wrapper">
                    <div className="stats-grid min-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div className="stats-card border-left-success" style={{ borderLeft: '4px solid var(--success)', padding: '16px' }}>
                            <div className="stats-icon success-soft">
                                <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" width="20" height="20">
                                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="stats-info">
                                <span className="stats-value text-success" style={{ color: 'var(--success)', fontSize: '20px' }}>{attempt.correctCount}</span>
                                <span className="stats-label">Câu Đúng</span>
                            </div>
                        </div>

                        <div className="stats-card border-left-danger" style={{ borderLeft: '4px solid var(--danger)', padding: '16px' }}>
                            <div className="stats-icon danger-soft">
                                <svg viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" width="20" height="20">
                                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="stats-info">
                                <span className="stats-value text-danger" style={{ color: 'var(--danger)', fontSize: '20px' }}>{attempt.totalCount - attempt.correctCount}</span>
                                <span className="stats-label">Câu Sai</span>
                            </div>
                        </div>
                    </div>

                    <div className="card-panel result-details-panel">
                        <h3>Xem Lại Bài Làm & Đáp Án Đúng</h3>
                        <hr className="divider" />
                        
                        <div className="results-review-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {attempt.reviewDetails.map((item, idx) => (
                                <div 
                                    className={`review-question-item ${item.isCorrect ? 'correct' : 'incorrect'}`}
                                    key={idx}
                                    style={{
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '16px',
                                        backgroundColor: 'var(--bg-app)',
                                        borderLeft: `4px solid ${item.isCorrect ? 'var(--success)' : 'var(--danger)'}`
                                    }}
                                >
                                    <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', whiteSpace: 'pre-line' }}>
                                        Câu {idx + 1}: {item.description}
                                    </h4>
                                    {item.image && (
                                        <div className="review-image-container" style={{ marginBottom: '12px', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxWidth: '100%', maxHeight: '200px', display: 'flex', justifyContent: 'flex-start', backgroundColor: 'var(--bg-app)' }}>
                                            <img src={item.image} alt="Minh họa câu hỏi" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                                        </div>
                                    )}

                                    {item.options.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {item.options.map(opt => {
                                                const isUserSelect = item.userAnswer.toLowerCase() === opt.letter.toLowerCase();
                                                const isCorrectAnswer = item.correctAnswer.toLowerCase() === opt.letter.toLowerCase();

                                                let style = {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '8px 12px',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontSize: '13px',
                                                    border: '1px solid var(--border-color)',
                                                    backgroundColor: 'var(--bg-card)',
                                                    color: 'var(--text-main)',
                                                    fontWeight: '500'
                                                };

                                                if (isCorrectAnswer) {
                                                    style.borderColor = 'var(--success)';
                                                    style.backgroundColor = 'var(--success-soft)';
                                                    style.color = 'var(--success)';
                                                } else if (isUserSelect && !item.isCorrect) {
                                                    style.borderColor = 'var(--danger)';
                                                    style.backgroundColor = 'var(--danger-soft)';
                                                    style.color = 'var(--danger)';
                                                }

                                                return (
                                                    <div key={opt.letter} style={style}>
                                                        <strong style={{ marginRight: '8px' }}>{opt.letter}.</strong>
                                                        <span>{opt.text}</span>
                                                        {isCorrectAnswer && <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>✓ Đáp án đúng</span>}
                                                        {isUserSelect && !item.isCorrect && <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>✗ Bạn chọn</span>}
                                                        {isUserSelect && item.isCorrect && <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>✓ Bạn chọn đúng</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div>
                                                <span>Bạn đã trả lời: </span>
                                                <strong style={{ color: item.isCorrect ? 'var(--success)' : 'var(--danger)' }}>
                                                    {item.userAnswer || '(Không trả lời)'}
                                                </strong>
                                            </div>
                                            {!item.isCorrect && (
                                                <div>
                                                    <span>Đáp án đúng là: </span>
                                                    <strong style={{ color: 'var(--success)' }}>
                                                        {item.correctAnswerText || item.correctAnswer}
                                                    </strong>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="results-action-buttons" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onRetry}>
                            Làm Lại Bài Thi
                        </button>
                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onPracticeFlashcard}>
                            Luyện Tập Chế Độ Thẻ
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
