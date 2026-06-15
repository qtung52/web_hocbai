import React, { useState, useEffect, useRef } from 'react';
import { extractQuestionAndOptions, shuffleArray, formatDuration, parseCorrectAnswers } from '../utils/quizParser';

let audioCtx = null;
function playChime(frequency, duration) {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioCtx;
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.value = frequency;

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        console.warn('AudioContext is not supported or was blocked:', e);
    }
}

export default function FlashcardView({ quizSet, onExit }) {
    const [deck, setDeck] = useState([]);
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [easyOriginalCount, setEasyOriginalCount] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isSessionFinished, setIsSessionFinished] = useState(false);

    const timerRef = useRef(null);

    // Initial setup
    useEffect(() => {
        if (quizSet && quizSet.questions.length > 0) {
            const shuffled = shuffleArray(quizSet.questions);
            const initialDeck = shuffled.map((q, idx) => ({
                question: q.question,
                answer: q.answer,
                image: q.image || '',
                id: `fc-${idx}-${Date.now()}`,
                recallLevel: 'new',
                easyFirstTry: true
            }));

            setDeck(initialDeck);
            setIndex(0);
            setFlipped(false);
            setEasyOriginalCount(0);
            setSeconds(0);
            setIsSessionFinished(false);
        }
    }, [quizSet]);

    // Timer
    useEffect(() => {
        if (isSessionFinished) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        timerRef.current = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isSessionFinished]);

    // Handle Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isSessionFinished || deck.length === 0) return;

            if (e.code === 'Space') {
                e.preventDefault();
                handleFlip();
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                if (index > 0) {
                    setIndex(index - 1);
                    setFlipped(false);
                }
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                if (index < deck.length - 1) {
                    setIndex(index + 1);
                    setFlipped(false);
                }
            } else if (flipped) {
                if (e.key === '1') {
                    handleRateRecall('hard');
                } else if (e.key === '2') {
                    handleRateRecall('medium');
                } else if (e.key === '3') {
                    handleRateRecall('easy');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [flipped, deck, index, isSessionFinished]);

    if (!quizSet) return null;

    if (isSessionFinished || deck.length === 0) {
        // Render Complete Panel
        const totalSessionCount = deck.length + easyOriginalCount;
        return (
            <section id="view-flashcard" className="app-view active">
                <div className="view-header">
                    <h1>Thẻ Ghi Nhớ 3D</h1>
                    <button className="btn btn-outline" onClick={onExit}>Quay Về</button>
                </div>
                <div className="card-panel animate-fade-in" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Hoàn Thành Phiên Học!</h2>
                    <p className="subtitle" style={{ marginBottom: '24px' }}>Bạn đã ôn tập xong toàn bộ các thẻ ghi nhớ của bộ đề này.</p>
                    <hr className="divider" />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', margin: '24px 0' }}>
                        <div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tổng số thẻ</span>
                            <h3 style={{ fontSize: '24px', color: 'var(--text-main)', marginTop: '4px' }}>{easyOriginalCount}</h3>
                        </div>
                        <div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Thuộc ngay</span>
                            <h3 style={{ fontSize: '24px', color: 'var(--success)', marginTop: '4px' }}>{easyOriginalCount}</h3>
                        </div>
                        <div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Thời gian ôn</span>
                            <h3 style={{ fontSize: '24px', color: 'var(--primary)', marginTop: '4px' }}>{formatDuration(seconds)}</h3>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px' }}>
                        <button className="btn btn-primary" onClick={() => {
                            // Restart session
                            const shuffled = shuffleArray(quizSet.questions);
                            setDeck(shuffled.map((q, idx) => ({
                                question: q.question,
                                answer: q.answer,
                                image: q.image || '',
                                id: `fc-${idx}-${Date.now()}`,
                                recallLevel: 'new',
                                easyFirstTry: true
                            })));
                            setIndex(0);
                            setFlipped(false);
                            setEasyOriginalCount(0);
                            setSeconds(0);
                            setIsSessionFinished(false);
                        }}>
                            Ôn Lại Từ Đầu
                        </button>
                        <button className="btn btn-outline" onClick={onExit}>
                            Quay Về Trang Chủ
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    const currentCard = deck[index];
    const parsed = extractQuestionAndOptions(currentCard.question);
    const correctAnswer = currentCard.answer.trim();

    const handleFlip = () => {
        playChime(400, 0.05);
        setFlipped(prev => !prev);
    };

    const handleRateRecall = (level) => {
        const updatedDeck = [...deck];
        const activeCard = updatedDeck[index];

        if (level === 'easy') {
            activeCard.recallLevel = 'easy';
            if (activeCard.easyFirstTry) {
                setEasyOriginalCount(prev => prev + 1);
            }
            // Remove card
            updatedDeck.splice(index, 1);
            playChime(600, 0.08);
        } else if (level === 'medium') {
            activeCard.recallLevel = 'medium';
            activeCard.easyFirstTry = false;
            // Remove and insert at middle
            updatedDeck.splice(index, 1);
            const insertPos = Math.min(
                Math.max(2, Math.floor(updatedDeck.length / 2)),
                updatedDeck.length
            );
            updatedDeck.splice(insertPos, 0, activeCard);
            playChime(350, 0.08);
        } else if (level === 'hard') {
            activeCard.recallLevel = 'hard';
            activeCard.easyFirstTry = false;
            // Remove and push to end
            updatedDeck.splice(index, 1);
            updatedDeck.push(activeCard);
            playChime(250, 0.12);
        }

        setFlipped(false);
        setDeck(updatedDeck);

        // Adjust index if out of bounds after deletion/splicing
        if (updatedDeck.length > 0) {
            const nextIndex = index >= updatedDeck.length ? Math.max(0, updatedDeck.length - 1) : index;
            setIndex(nextIndex);
        }

        // Check if finished
        if (updatedDeck.length === 0) {
            setIsSessionFinished(true);
        }
    };

    // Calculate progress counts
    const remainingCount = deck.length;
    const hard = deck.filter(c => c.recallLevel === 'hard').length;
    const medium = deck.filter(c => c.recallLevel === 'medium').length;
    const newCards = deck.filter(c => c.recallLevel === 'new').length;

    const totalSessionCards = remainingCount + easyOriginalCount;
    let easyPercent = 0, mediumPercent = 0, hardPercent = 0;
    if (totalSessionCount() > 0) {
        easyPercent = (easyOriginalCount / totalSessionCount()) * 100;
        mediumPercent = (medium / totalSessionCount()) * 100;
        hardPercent = ((hard + newCards) / totalSessionCount()) * 100;
    }

    function totalSessionCount() {
        return deck.length + easyOriginalCount;
    }

    const correctAnswers = parseCorrectAnswers(currentCard.answer, parsed.options);

    return (
        <section id="view-flashcard" className="app-view active">
            <div className="view-header">
                <div>
                    <h1>Thẻ Ghi Nhớ 3D</h1>
                    <p className="subtitle">Lật thẻ để kiểm tra và ôn tập kiến thức bằng phương pháp gợi nhớ chủ động.</p>
                </div>
                <button className="btn btn-outline" onClick={onExit}>
                    Thoát Thẻ Ghi Nhớ
                </button>
            </div>

            <div className="flashcard-container-layout" id="flashcard-active-workspace" style={{ display: 'grid' }}>
                {/* Left pane: Flashcard Deck Stage */}
                <div className="flashcard-main-stage">
                    {/* Progress Bar Tracker */}
                    <div className="flashcard-tracker-panel card-panel" style={{ marginBottom: '20px', padding: '16px 20px' }}>
                        <div className="flashcard-stats-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '13px', fontWeight: '600' }}>
                            <span className="flashcard-counter">Còn lại: {remainingCount} thẻ trong deck</span>
                            <div className="flashcard-badges" style={{ display: 'flex', gap: '8px' }}>
                                <span className="badge" style={{ backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>Chưa nhớ: {hard}</span>
                                <span className="badge" style={{ backgroundColor: 'var(--warning-soft)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>Đang học: {medium}</span>
                                <span className="badge" style={{ backgroundColor: 'var(--success-soft)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>Đã thuộc: {easyOriginalCount}</span>
                            </div>
                        </div>
                        <div className="progress-bar-container" style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden', display: 'flex' }}>
                            <div style={{ height: '100%', width: `${easyPercent}%`, backgroundColor: 'var(--success)', transition: 'width 0.3s ease' }}></div>
                            <div style={{ height: '100%', width: `${mediumPercent}%`, backgroundColor: 'var(--warning)', transition: 'width 0.3s ease' }}></div>
                            <div style={{ height: '100%', width: `${hardPercent}%`, backgroundColor: 'var(--danger)', transition: 'width 0.3s ease' }}></div>
                        </div>
                    </div>

                    {/* Stage Row: Left Arrow + 3D Card + Right Arrow */}
                    <div className="flashcard-stage-row">
                        <button 
                            type="button" 
                            className="btn-nav-arrow" 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (index > 0) {
                                    setIndex(index - 1);
                                    setFlipped(false);
                                }
                            }}
                            disabled={index === 0}
                            aria-label="Câu trước"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <div className="flashcard-card-wrapper" onClick={handleFlip}>
                            <div className={`flashcard-card ${flipped ? 'flipped' : ''}`}>
                                {/* Front Side */}
                                <div className="flashcard-side card-front">
                                    <div className="card-side-tag">MẶT TRƯỚC - CÂU HỎI & LỰA CHỌN</div>
                                    <div className="card-content-scroll" style={{ width: '100%' }}>
                                        {currentCard.image && (
                                            <div className="card-image-container">
                                                <img src={currentCard.image} alt="Minh họa" />
                                            </div>
                                        )}
                                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', whiteSpace: 'pre-line' }}>{parsed.description}</h2>
                                        
                                        {/* choices list on front side of the card as required! */}
                                        {parsed.options.length > 0 && (
                                            <div className="fc-options-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '520px', margin: '0 auto', textAlign: 'left' }}>
                                                {parsed.options.map(opt => (
                                                    <div 
                                                        key={opt.letter} 
                                                        className="fc-option-card"
                                                        style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 16px', fontSize: '13px', color: 'var(--text-main)', backgroundColor: 'var(--bg-app)', display: 'flex', alignItems: 'center' }}
                                                    >
                                                        <strong style={{ marginRight: '8px' }}>{opt.letter}.</strong>
                                                        <span>{opt.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-hint">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }}>
                                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.67"/>
                                        </svg>
                                        Chạm vào thẻ hoặc Space để lật mặt sau 🔄
                                    </div>
                                </div>
                                
                                {/* Back Side */}
                                <div className="flashcard-side card-back">
                                    <div className="card-side-tag">MẶT SAU - ĐÁP ÁN</div>
                                    <div className="card-content-scroll">
                                        <div className="fc-answer-container">
                                            <small style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: '600' }}>Đáp án đúng là:</small>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                                                {parsed.options.length > 0 ? (
                                                    correctAnswers.map(letter => {
                                                        const opt = parsed.options.find(o => o.letter.toUpperCase() === letter.toUpperCase());
                                                        return (
                                                            <h3 key={letter} style={{ fontSize: '22px', fontWeight: '700', color: 'var(--success)', margin: 0, textAlign: 'center' }}>
                                                                {opt ? `${opt.letter}. ${opt.text}` : letter}
                                                            </h3>
                                                        );
                                                    })
                                                ) : (
                                                    <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--success)', margin: 0, textAlign: 'center' }}>
                                                        {currentCard.answer}
                                                    </h3>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-hint">Đáp án hệ thống</div>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="button" 
                            className="btn-nav-arrow" 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (index < deck.length - 1) {
                                    setIndex(index + 1);
                                    setFlipped(false);
                                }
                            }}
                            disabled={index === deck.length - 1}
                            aria-label="Câu tiếp theo"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>

                    {/* Index Jump Navigation */}
                    <div className="flashcard-nav-dots">
                        {deck.map((card, idx) => (
                            <button
                                key={card.id}
                                type="button"
                                className={`nav-dot-btn ${index === idx ? 'active' : ''} status-${card.recallLevel}`}
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setIndex(idx); 
                                    setFlipped(false); 
                                }}
                                title={`Câu ${idx + 1}`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    {/* Controls: Flip button and Recall rating buttons */}
                    <div className="flashcard-controls-panel" style={{ marginTop: '24px', textAlign: 'center' }}>
                        {!flipped ? (
                            <div style={{ display: 'block' }}>
                                <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); handleFlip(); }} style={{ minWidth: '200px', padding: '12px 24px', fontSize: '15px', boxShadow: 'var(--shadow-md)' }}>
                                    Lật Mặt Sau (Space) 🔄
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Bạn có nhớ câu hỏi này không? Đánh giá:</span>
                                <div className="recall-rating-buttons" style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '500px' }}>
                                    <button className="btn btn-danger btn-block rating-btn" onClick={(e) => { e.stopPropagation(); handleRateRecall('hard'); }} style={{ flex: 1, padding: '12px' }}>
                                        <span>🔴 Chưa nhớ (Phím 1)</span>
                                    </button>
                                    <button className="btn btn-warning btn-block rating-btn" onClick={(e) => { e.stopPropagation(); handleRateRecall('medium'); }} style={{ flex: 1, padding: '12px', color: 'white' }}>
                                        <span>🟡 Mơ hồ (Phím 2)</span>
                                    </button>
                                    <button className="btn btn-success btn-block rating-btn" onClick={(e) => { e.stopPropagation(); handleRateRecall('easy'); }} style={{ flex: 1, padding: '12px' }}>
                                        <span>🟢 Đã thuộc (Phím 3)</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right pane: Sidebar guidelines */}
                <div className="quiz-sidebar-info">
                    <div className="card-panel">
                        <h3>Hướng Dẫn Học</h3>
                        <hr className="divider" />
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: '1.5', color: 'var(--text-muted)', padding: '0' }}>
                            <li style={{ display: 'flex', gap: '8px' }}>
                                <strong style={{ color: 'var(--primary)' }}>1.</strong>
                                <span>Đọc câu hỏi và xem các lựa chọn trắc nghiệm ở mặt trước.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '8px' }}>
                                <strong style={{ color: 'var(--primary)' }}>2.</strong>
                                <span>Tự nhẩm câu trả lời đúng, sau đó lật thẻ để kiểm tra.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '8px' }}>
                                <strong style={{ color: 'var(--primary)' }}>3.</strong>
                                <span>Chọn <strong>Chưa nhớ</strong> (cuối deck), <strong>Mơ hồ</strong> (giữa deck) hoặc <strong>Đã thuộc</strong> (xóa khỏi deck).</span>
                            </li>
                            <li style={{ display: 'flex', gap: '8px' }}>
                                <strong style={{ color: 'var(--primary)' }}>💡</strong>
                                <span>Dùng phím tắt để học nhanh:<br />• <strong>Space</strong> để Lật thẻ<br />• Phím <strong>1, 2, 3</strong> tương ứng đánh giá.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
