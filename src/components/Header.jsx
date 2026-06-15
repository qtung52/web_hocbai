import React, { useState, useEffect } from 'react';

export default function Header({ searchQuery, onSearchQueryChange, showSearch }) {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        function updateDateTime() {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
            setCurrentTime(now.toLocaleDateString('vi-VN', options));
        }
        updateDateTime();
        const interval = setInterval(updateDateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="top-header">
            <div className="header-search">
                {showSearch && (
                    <div className="search-wrapper" id="search-bar-container">
                        <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2"/>
                            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" strokeLinecap="round"/>
                        </svg>
                        <input 
                            type="text" 
                            id="search-quiz-input" 
                            placeholder="Tìm kiếm bộ câu hỏi theo tên..."
                            value={searchQuery}
                            onChange={(e) => onSearchQueryChange(e.target.value)}
                        />
                    </div>
                )}
            </div>
            <div className="header-profile">
                <div className="datetime" id="current-datetime">{currentTime}</div>
                <div className="user-avatar">
                    <span>ST</span>
                </div>
            </div>
        </header>
    );
}
