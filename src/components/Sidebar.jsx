import React from 'react';

export default function Sidebar({ currentView, onViewChange, theme, onToggleTheme }) {
    return (
        <aside className="sidebar">
            <div className="brand" onClick={() => onViewChange('view-dashboard')} style={{ cursor: 'pointer' }}>
                <div className="brand-logo">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className="brand-name">
                    <h2>EduQuiz</h2>
                    <span>Dashboard Học Tập</span>
                </div>
            </div>
            
            <nav className="nav-menu">
                <a 
                    href="#" 
                    className={`nav-item ${currentView === 'view-dashboard' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); onViewChange('view-dashboard'); }}
                >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>Trang Chủ</span>
                </a>

                <a 
                    href="#" 
                    className={`nav-item ${currentView === 'view-manage-quiz' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); onViewChange('view-manage-quiz'); }}
                >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Tạo Bộ Câu Hỏi</span>
                </a>

                <a 
                    href="#" 
                    className={`nav-item ${currentView === 'view-stats' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); onViewChange('view-stats'); }}
                >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" stroke-width="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Thống Kê Lịch Sử</span>
                </a>
            </nav>

            <div className="sidebar-footer">
                <div className="theme-toggle-container">
                    <span className="theme-label">Chế độ tối</span>
                    <button 
                        className="theme-toggle" 
                        onClick={onToggleTheme} 
                        aria-label="Toggle dark mode"
                    >
                        <div className="toggle-circle"></div>
                    </button>
                </div>
            </div>
        </aside>
    );
}
