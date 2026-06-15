import React, { useState, useEffect, useRef } from 'react';
import { extractQuestionAndOptions, shuffleArray, formatDuration } from '../utils/quizParser';

export default function TestView({ quizSet, config, onCancel, onSubmit }) {
    const [testQuestions, setTestQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({}); // { [qId]: selectedLetter }
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef(null);

    // 1. Prepare questions based on configuration
    useEffect(() => {
        if (quizSet && quizSet.questions.length > 0) {
            let questions = [...quizSet.questions];
            
            // Randomize question order if enabled
            if (config.randomize) {
                questions = shuffleArray(questions);
            }
            
            // Limit question count
            questions = questions.slice(0, config.questionCount);

            // Shuffling options if enabled
            const prepared = questions.map((origQ, qIdx) => {
                const parsed = extractQuestionAndOptions(origQ.question);
                const origCorrectLetter = origQ.answer.trim().toUpperCase();
                const correctOpt = parsed.options.find(o => o.letter === origCorrectLetter);
                const correctOptText = correctOpt ? correctOpt.text : origQ.answer;

                let finalOptions = [...parsed.options];
                let newCorrectLetter = origCorrectLetter;

                if (config.shuffleOptions && parsed.options.length > 0) {
                    const shuffledOptionsTexts = shuffleArray(parsed.options.map(o => o.text));
                    finalOptions = parsed.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx); // A, B, C, D...
                        const text = shuffledOptionsTexts[optIdx];
                        if (text === correctOptText) {
                            newCorrectLetter = letter;
                        }
                        return { letter, text };
                    });
                }

                return {
                    id: `q-${qIdx}-${Date.now()}`,
                    description: parsed.description,
                    options: finalOptions,
                    correctAnswer: newCorrectLetter,
                    correctAnswerText: correctOptText,
                    originalQuestion: origQ.question
                };
            });

            setTestQuestions(prepared);
            setUserAnswers({});
            setSeconds(0);
        }
    }, [quizSet, config]);

    // 2. Start Timer
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    if (!quizSet || testQuestions.length === 0) return null;

    const handleOptionSelect = (questionId, letter) => {
        setUserAnswers({
            ...userAnswers,
            [questionId]: letter
        });
    };

    const handleNavClick = (idx) => {
        const el = document.getElementById(`test-question-card-${idx}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleCancel = () => {
        if (window.confirm('Tiến trình làm bài kiểm tra hiện tại sẽ bị mất. Bạn vẫn muốn thoát chứ?')) {
            onCancel();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const answeredCount = Object.keys(userAnswers).length;
        const total = testQuestions.length;

        if (answeredCount < total) {
            if (!window.confirm(`Bạn mới trả lời ${answeredCount} / ${total} câu hỏi. Bạn có chắc chắn muốn nộp bài chứ?`)) {
                return;
            }
        }

        // Calculate score
        let correctCount = 0;
        const reviewDetails = testQuestions.map(q => {
            const userAns = userAnswers[q.id] || '';
            const correct = userAns.toLowerCase() === q.correctAnswer.toLowerCase();
            if (correct) correctCount++;

            return {
                description: q.description,
                options: q.options,
                userAnswer: userAns,
                correctAnswer: q.correctAnswer,
                correctAnswerText: q.correctAnswerText,
                isCorrect: correct
            };
        });

        const accuracy = (correctCount / total) * 100;
        const attempt = {
            id: 'attempt-' + Date.now(),
            quizId: quizSet.id,
            quizTitle: quizSet.title,
            createdAt: new Date().toISOString(),
            duration: seconds,
            correctCount,
            totalCount: total,
            accuracy,
            reviewDetails
        };

        onSubmit(attempt);
    };

    const totalQuestions = testQuestions.length;
    const answeredCount = Object.keys(userAnswers).length;

    return (
        <section id="view-test" className="app-view active">
            <div className="view-header">
                <div>
                    <h1>Bài Kiểm Tra Toàn Diện</h1>
                    <p className="subtitle">{quizSet.title}</p>
                </div>
                <button type="button" className="btn btn-outline" onClick={handleCancel}>
                    Hủy Làm Bài
                </button>
            </div>

            <div className="quiz-container-layout">
                {/* Left pane: Test Form */}
                <div className="test-questions-wrapper">
                    <form onSubmit={handleSubmit}>
                        <div id="test-questions-list">
                            {testQuestions.map((q, idx) => (
                                <div 
                                    className="card-panel test-question-card" 
                                    id={`test-question-card-${idx}`} 
                                    key={q.id}
                                    style={{ marginBottom: '20px' }}
                                >
                                    <div className="question-body">
                                        <div className="question-badge" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                                            Câu hỏi {idx + 1}
                                        </div>
                                        <h3 className="question-text" style={{ fontSize: '18px', fontWeight: '600', marginTop: '8px', marginBottom: '16px', whiteSpace: 'pre-line' }}>
                                            {q.description}
                                        </h3>
                                    </div>

                                    {q.options.length > 0 ? (
                                        <div className="test-choices-list">
                                            {q.options.map(opt => {
                                                const isSelected = userAnswers[q.id] === opt.letter;
                                                return (
                                                    <label 
                                                        key={opt.letter} 
                                                        className={`test-choice-item ${isSelected ? 'selected' : ''}`}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', backgroundColor: 'var(--bg-app)', transition: 'var(--transition-all)', marginBottom: '8px' }}
                                                    >
                                                        <input 
                                                            type="radio" 
                                                            name={`test-option-${q.id}`}
                                                            checked={isSelected}
                                                            onChange={() => handleOptionSelect(q.id, opt.letter)}
                                                            style={{ margin: 0 }}
                                                        />
                                                        <span className="test-choice-text">
                                                            <strong>{opt.letter}.</strong> {opt.text}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="form-group">
                                            <label htmlFor={`test-ans-${q.id}`} className="form-label">Nhập đáp án:</label>
                                            <textarea 
                                                id={`test-ans-${q.id}`} 
                                                className="form-input text-md"
                                                placeholder="Gõ câu trả lời của bạn..."
                                                rows="2"
                                                value={userAnswers[q.id] || ''}
                                                onChange={(e) => handleOptionSelect(q.id, e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <div className="test-submit-bar card-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                            <p style={{ margin: 0, fontWeight: '500' }}>
                                Bạn đã trả lời <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{answeredCount}</span> / {totalQuestions} câu hỏi.
                            </p>
                            <button type="submit" className="btn btn-primary">
                                Nộp Bài Kiểm Tra
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right pane: Floating widgets */}
                <div className="quiz-sidebar-info fixed-sidebar">
                    <div className="card-panel timer-widget" style={{ marginBottom: '20px' }}>
                        <div className="timer-display" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="timer-icon" style={{ color: 'var(--primary)' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 6v6l4 2"/>
                                </svg>
                            </div>
                            <div className="timer-time">
                                <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', display: 'block' }}>
                                    {formatDuration(seconds)}
                                </span>
                                <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thời gian làm bài</small>
                            </div>
                        </div>
                    </div>

                    <div className="card-panel navigation-widget">
                        <h3>Danh sách câu hỏi</h3>
                        <hr className="divider" />
                        <div className="question-nav-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                            {testQuestions.map((q, idx) => {
                                const isAnswered = !!userAnswers[q.id];
                                return (
                                    <button 
                                        key={q.id}
                                        type="button"
                                        className={`nav-grid-box ${isAnswered ? 'answered' : ''}`}
                                        style={{ 
                                            width: '100%', 
                                            padding: '8px 0', 
                                            textAlign: 'center', 
                                            fontWeight: '600', 
                                            fontSize: '13px', 
                                            border: '1px solid var(--border-color)', 
                                            borderRadius: 'var(--radius-sm)', 
                                            cursor: 'pointer',
                                            background: isAnswered ? 'var(--primary-soft)' : 'var(--bg-app)',
                                            color: isAnswered ? 'var(--primary)' : 'var(--text-main)',
                                            borderColor: isAnswered ? 'var(--primary)' : 'var(--border-color)'
                                        }}
                                        onClick={() => handleNavClick(idx)}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
