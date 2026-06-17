export default function Sidebar({ currentView, onViewChange, onToggleTheme, isOpen, user, onLogout, onClose }) {
    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            {/* Close button for mobile */}
            <button 
                type="button" 
                className="sidebar-close-btn" 
                onClick={onClose}
                aria-label="Đóng sidebar"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            <div className="brand" onClick={() => { onViewChange('view-dashboard'); if (onClose) onClose(); }} style={{ cursor: 'pointer' }}>
                <div className="brand-logo">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
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
                        <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Thống Kê Lịch Sử</span>
                </a>

                <a 
                    href="#" 
                    className={`nav-item ${currentView === 'view-profile-settings' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); onViewChange('view-profile-settings'); }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Cài Đặt Hồ Sơ</span>
                </a>
            </nav>

            <div className="sidebar-footer">
                {user && (() => {
                    const displayName = user.user_metadata?.display_name || user.email;
                    const initials = user.user_metadata?.display_name 
                        ? user.user_metadata.display_name.trim().substring(0, 2).toUpperCase() 
                        : (user.email ? user.email.substring(0, 2).toUpperCase() : 'US');
                    return (
                        <div className="user-profile-widget" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="user-avatar" style={{ margin: 0, width: '32px', height: '32px', fontSize: '12px' }}>
                                    <span>{initials}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {displayName}
                                    </span>
                                    <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Học viên</small>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                className="btn btn-sm btn-outline btn-block" 
                                onClick={onLogout}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '8px 12px', fontSize: '12px' }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Đăng xuất
                            </button>
                        </div>
                    );
                })()}

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
