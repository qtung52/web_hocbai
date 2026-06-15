import React, { useState, useEffect } from 'react';
import { extractQuestionAndOptions, shuffleArray, parseCorrectAnswers } from '../utils/quizParser';

export default function PracticeView({ quizSet, onExit, showAlert }) {
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [textAnswer, setTextAnswer] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        if (quizSet && quizSet.questions.length > 0) {
            // Shuffle all questions for practice mode (no slicing to 20!)
            setShuffledQuestions(shuffleArray(quizSet.questions));
            setCurrentIndex(0);
            resetQuestionState();
        }
    }, [quizSet]);

    const resetQuestionState = () => {
        setSelectedOptions([]);
        setTextAnswer('');
        setIsChecked(false);
        setIsCorrect(false);
    };

    if (!quizSet || shuffledQuestions.length === 0) return null;

    const currentQuestion = shuffledQuestions[currentIndex];
    const totalQuestions = shuffledQuestions.length;
    const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

    const parsed = extractQuestionAndOptions(currentQuestion.question);
    const correctAnswers = parseCorrectAnswers(currentQuestion.answer, parsed.options);
    const isMultiple = correctAnswers.length > 1;

    const handleOptionSelect = (letter) => {
        if (isChecked) return;
        if (isMultiple) {
            setSelectedOptions(prev => {
                const newOpts = prev.includes(letter)
                    ? prev.filter(l => l !== letter)
                    : [...prev, letter];
                return newOpts.sort();
            });
        } else {
            setSelectedOptions([letter]);
        }
    };

    const handleCheckAnswer = () => {
        if (parsed.options.length > 0) {
            if (selectedOptions.length === 0) {
                showAlert('Vui lòng chọn ít nhất một đáp án trước khi kiểm tra.');
                return;
            }
            const correct = selectedOptions.length === correctAnswers.length &&
                            selectedOptions.every(l => correctAnswers.includes(l));
            setIsCorrect(correct);
        } else {
            if (!textAnswer.trim()) {
                showAlert('Vui lòng nhập câu trả lời trước khi kiểm tra.');
                return;
            }
            const correct = textAnswer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
            setIsCorrect(correct);
        }
        setIsChecked(true);
    };

    const handleNextQuestion = () => {
        if (currentIndex + 1 < totalQuestions) {
            setCurrentIndex(currentIndex + 1);
            resetQuestionState();
        } else {
            showAlert('Chúc mừng! Bạn đã hoàn thành việc ôn tập tất cả các câu hỏi trong bộ đề này.', 'Thông báo', onExit);
        }
    };

    // Helper to find matching options text
    const getCorrectAnswersText = () => {
        if (parsed.options.length > 0) {
            return correctAnswers.map(letter => {
                const opt = parsed.options.find(o => o.letter.toUpperCase() === letter.toUpperCase());
                return opt ? `${opt.letter}. ${opt.text}` : letter;
            }).join(', ');
        }
        return currentQuestion.answer;
    };

    return (
        <section id="view-practice" className="app-view active">
            <div className="view-header">
                <div>
                    <h1>Chế Độ Luyện Tập</h1>
                    <p className="subtitle">Kiểm tra kiến thức từng câu một, hiển thị đáp án lập tức. Đã nạp tất cả các câu hỏi.</p>
                </div>
                <button className="btn btn-outline" onClick={onExit}>
                    Thoát Luyện Tập
                </button>
            </div>

            <div className="quiz-container-layout">
                <div className="quiz-main-card card-panel">
                    {/* Progress Bar */}
                    <div className="quiz-progress-wrapper">
                        <div className="progress-info">
                            <span className="progress-text">Câu hỏi {currentIndex + 1} / {totalQuestions}</span>
                            <span className="progress-percent">{progressPercent}%</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="question-body">
                        <div className="question-badge" style={{ backgroundColor: isMultiple ? 'var(--warning-soft)' : 'var(--primary-soft)', color: isMultiple ? 'var(--warning)' : 'var(--primary)', fontWeight: 'bold' }}>
                            {isMultiple ? 'CHỌN NHIỀU ĐÁP ÁN' : 'CHỌN MỘT ĐÁP ÁN'}
                        </div>
                        {currentQuestion.image && (
                            <div className="question-image-container" style={{ marginBottom: '16px', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxWidth: '100%', maxHeight: '300px', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--bg-app)' }}>
                                <img src={currentQuestion.image} alt="Minh họa câu hỏi" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                            </div>
                        )}
                        <h2 className="question-text" style={{ whiteSpace: 'pre-line' }}>{parsed.description}</h2>
                    </div>

                    {/* Answer Area */}
                    <div className="answer-section">
                        {parsed.options.length > 0 ? (
                            /* Interactive Choices */
                            <div className="practice-choices-container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '20px' }}>
                                {parsed.options.map(opt => {
                                    let btnClass = 'choice-btn';
                                    const isOptSelected = selectedOptions.includes(opt.letter);
                                    const isOptCorrect = correctAnswers.includes(opt.letter);

                                    if (isChecked) {
                                        if (isOptCorrect) {
                                            btnClass += ' correct';
                                        } else if (isOptSelected) {
                                            btnClass += ' incorrect';
                                        }
                                    } else if (isOptSelected) {
                                        btnClass += ' selected';
                                    }

                                    return (
                                        <button 
                                            key={opt.letter}
                                            className={btnClass}
                                            onClick={() => handleOptionSelect(opt.letter)}
                                            disabled={isChecked}
                                            style={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}
                                        >
                                            <span className="choice-letter" style={{ borderRadius: isMultiple ? '6px' : '50%' }}>{opt.letter}</span>
                                            <span className="choice-text">{opt.text}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Text Input Fallback */
                            <div className="form-group" style={{ display: 'block', marginBottom: '20px' }}>
                                <label htmlFor="practice-answer-input" className="form-label">Nhập đáp án của bạn:</label>
                                <textarea 
                                    id="practice-answer-input" 
                                    className="form-input text-md answer-textarea" 
                                    placeholder="Nhập câu trả lời tại đây..." 
                                    rows="2"
                                    value={textAnswer}
                                    onChange={(e) => setTextAnswer(e.target.value)}
                                    disabled={isChecked}
                                />
                            </div>
                        )}

                        {/* Feedback Area */}
                        {isChecked && (
                            <div className={`feedback-alert ${isCorrect ? 'alert-success' : 'alert-danger'}`} style={{ display: 'flex', marginBottom: '20px', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid', borderColor: isCorrect ? 'var(--success)' : 'var(--danger)', backgroundColor: isCorrect ? 'var(--success-soft)' : 'var(--danger-soft)' }}>
                                <div className="feedback-icon" style={{ marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                                    {isCorrect ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" width="24" height="24">
                                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="3" width="24" height="24">
                                            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                </div>
                                <div className="feedback-content">
                                    <h4 className="feedback-title" style={{ fontWeight: '700', fontSize: '15px', color: isCorrect ? 'var(--success)' : 'var(--danger)', marginBottom: '4px' }}>
                                        {isCorrect ? 'Chính xác!' : 'Chưa chính xác!'}
                                    </h4>
                                    <p className="feedback-desc" style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                                        Đáp án đúng là: <strong>{getCorrectAnswersText()}</strong>
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="practice-actions">
                            {!isChecked ? (
                                <button className="btn btn-primary btn-block" onClick={handleCheckAnswer}>
                                    Kiểm Tra Đáp Án
                                </button>
                            ) : (
                                <button className="btn btn-success btn-block" onClick={handleNextQuestion}>
                                    {currentIndex + 1 === totalQuestions ? 'Hoàn Thành Ôn Tập' : 'Câu Tiếp Theo'}
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ marginLeft: '8px', display: 'inline' }}>
                                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar details */}
                <div className="quiz-sidebar-info">
                    <div className="card-panel">
                        <h3>Thông Tin Bộ Câu Hỏi</h3>
                        <hr className="divider" />
                        <div className="info-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div className="info-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span className="info-label" style={{ color: 'var(--text-muted)' }}>Bộ câu hỏi:</span>
                                <strong style={{ color: 'var(--text-main)' }}>{quizSet.title}</strong>
                            </div>
                            <div className="info-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span className="info-label" style={{ color: 'var(--text-muted)' }}>Tổng số câu:</span>
                                <strong style={{ color: 'var(--text-main)' }}>{totalQuestions} câu hỏi</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
