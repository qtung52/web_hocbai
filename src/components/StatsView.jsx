import React from 'react';
import { formatDuration, formatDate } from '../utils/quizParser';

export default function StatsView({ attempts, onClearHistory, onViewAttemptDetails, showConfirm }) {
    // 1. Calculate stats
    const totalCount = attempts.length;

    let highestAccuracy = '0%';
    let averageAccuracy = '0%';
    let averageDuration = '00:00';

    if (totalCount > 0) {
        const highest = Math.max(...attempts.map(a => a.accuracy));
        highestAccuracy = `${Math.round(highest)}%`;

        const sumAcc = attempts.reduce((sum, current) => sum + current.accuracy, 0);
        averageAccuracy = `${Math.round(sumAcc / totalCount)}%`;

        const sumTime = attempts.reduce((sum, current) => sum + current.duration, 0);
        averageDuration = formatDuration(Math.round(sumTime / totalCount));
    }

    const handleClear = () => {
        showConfirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử làm bài kiểm tra? Hành động này không thể hoàn tác.', () => {
            onClearHistory();
        });
    };

    return (
        <section id="view-stats" className="app-view active">
            <div className="view-header">
                <div>
                    <h1>Lịch Sử & Thống Kê Chi Tiết</h1>
                    <p className="subtitle">Xem lại tất cả kết quả ôn luyện và kiểm tra của bạn trong quá khứ.</p>
                </div>
                {totalCount > 0 && (
                    <button className="btn btn-danger btn-outline" onClick={handleClear}>
                        Xóa Lịch Sử
                    </button>
                )}
            </div>

            <div className="stats-details-layout">
                {/* Extended Panel */}
                <div className="stats-extended-panel card-panel">
                    <h3>Tổng Quan Tiến Trình</h3>
                    <hr className="divider" />
                    <div className="stats-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div className="summary-item" style={{ display: 'flex', flexDirection: 'column', padding: '12px' }}>
                            <span className="summary-label" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Số lần kiểm tra</span>
                            <strong className="summary-val" style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>{totalCount} lần</strong>
                        </div>
                        <div className="summary-item" style={{ display: 'flex', flexDirection: 'column', padding: '12px' }}>
                            <span className="summary-label" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Độ chính xác cao nhất</span>
                            <strong className="summary-val text-success" style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success)' }}>{highestAccuracy}</strong>
                        </div>
                        <div className="summary-item" style={{ display: 'flex', flexDirection: 'column', padding: '12px' }}>
                            <span className="summary-label" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Độ chính xác trung bình</span>
                            <strong className="summary-val text-primary" style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>{averageAccuracy}</strong>
                        </div>
                        <div className="summary-item" style={{ display: 'flex', flexDirection: 'column', padding: '12px' }}>
                            <span className="summary-label" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Thời gian TB</span>
                            <strong className="summary-val" style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>{averageDuration}</strong>
                        </div>
                    </div>
                </div>

                {/* History List Table */}
                <div className="history-list-panel card-panel" style={{ marginTop: '24px' }}>
                    <div className="section-title-bar">
                        <h3>Nhật Ký Làm Bài</h3>
                        <div className="filter-badge">{totalCount} lượt làm bài</div>
                    </div>
                    <hr className="divider" />

                    {totalCount === 0 ? (
                        <div className="empty-state" id="empty-history-state" style={{ display: 'flex' }}>
                            <div className="empty-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <h3>Chưa có lịch sử làm bài</h3>
                            <p>Hãy thử sức với các bài kiểm tra toàn diện để ghi lại điểm số của bạn ở đây.</p>
                        </div>
                    ) : (
                        <div className="table-container" id="history-table-container" style={{ display: 'block', overflowX: 'auto' }}>
                            <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: '600' }}>Bộ Câu Hỏi</th>
                                        <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: '600' }}>Ngày Thực Hiện</th>
                                        <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: '600' }}>Kết Quả (Đúng/Tổng)</th>
                                        <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: '600' }}>Độ Chính Xác</th>
                                        <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: '600' }}>Thời Gian</th>
                                        <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: '600' }}>Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attempts.map(attempt => (
                                        <tr key={attempt.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text-main)' }}>{attempt.quizTitle}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>{formatDate(attempt.createdAt)}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>{attempt.correctCount} / {attempt.totalCount}</td>
                                            <td style={{ padding: '12px 16px', fontWeight: '700', color: attempt.accuracy >= 75 ? 'var(--success)' : 'var(--text-main)' }}>
                                                {Math.round(attempt.accuracy)}%
                                            </td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{formatDuration(attempt.duration)}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <button 
                                                    className="btn btn-sm btn-outline-primary"
                                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                                    onClick={() => onViewAttemptDetails(attempt)}
                                                >
                                                    Chi Tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
