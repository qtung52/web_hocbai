import React, { useState, useEffect, useRef } from 'react';
import { extractQuestionAndOptions, shuffleArray, formatDuration, parseCorrectAnswers } from '../utils/quizParser';

export default function TestView({ quizSet, config, onCancel, onSubmit, showConfirm }) {
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
                const origCorrectLetters = parseCorrectAnswers(origQ.answer, parsed.options);
                
                // Get correct option texts
                const correctOptTexts = origCorrectLetters.map(letter => {
                    const opt = parsed.options.find(o => o.letter === letter);
                    return opt ? opt.text : letter;
                });

                let finalOptions = [...parsed.options];
                let newCorrectLetters = [...origCorrectLetters];

                if (config.shuffleOptions && parsed.options.length > 0) {
                    const shuffledOptionsTexts = shuffleArray(parsed.options.map(o => o.text));
                    newCorrectLetters = [];
                    finalOptions = parsed.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx); // A, B, C, D...
                        const text = shuffledOptionsTexts[optIdx];
                        if (correctOptTexts.includes(text)) {
                            newCorrectLetters.push(letter);
                        }
                        return { letter, text };
                    });
                    newCorrectLetters.sort();
                }

                const isMultiple = newCorrectLetters.length > 1;

                return {
                    id: `q-${qIdx}-${Date.now()}`,
                    description: parsed.description,
                    options: finalOptions,
                    correctAnswers: newCorrectLetters,
                    isMultiple: isMultiple,
                    originalQuestion: origQ.question,
                    image: origQ.image || ''
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

    const handleOptionSelect = (questionId, letter, isMultiple) => {
        const currentAns = userAnswers[questionId];
        if (isMultiple) {
            const currentArr = Array.isArray(currentAns) ? currentAns : (currentAns ? [currentAns] : []);
            let newArr;
            if (currentArr.includes(letter)) {
                newArr = currentArr.filter(l => l !== letter);
            } else {
                newArr = [...currentArr, letter];
            }
            newArr.sort();
            setUserAnswers({
                ...userAnswers,
                [questionId]: newArr
            });
        } else {
            setUserAnswers({
                ...userAnswers,
                [questionId]: letter
            });
        }
    };

    const handleNavClick = (idx) => {
        const el = document.getElementById(`test-question-card-${idx}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleCancel = () => {
        showConfirm('Tiến trình làm bài kiểm tra hiện tại sẽ bị mất. Bạn vẫn muốn thoát chứ?', () => {
            onCancel();
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const answeredCount = testQuestions.filter(q => {
            const ans = userAnswers[q.id];
            return q.isMultiple ? (Array.isArray(ans) && ans.length > 0) : !!ans;
        }).length;
        const total = testQuestions.length;

        const processSubmit = () => {
            // Calculate score
            let correctCount = 0;
            const reviewDetails = testQuestions.map(q => {
                const userAns = userAnswers[q.id] || (q.isMultiple ? [] : '');
                
                let correct = false;
                if (q.options.length > 0) {
                    if (q.isMultiple) {
                        const userAnsArr = Array.isArray(userAns) ? userAns : [userAns].filter(Boolean);
                        correct = userAnsArr.length === q.correctAnswers.length && 
                                  userAnsArr.every(l => q.correctAnswers.includes(l));
                    } else {
                        const userAnsStr = Array.isArray(userAns) ? userAns[0] || '' : userAns;
                        const correctAnsStr = q.correctAnswers[0] || '';
                        correct = userAnsStr.toUpperCase() === correctAnsStr.toUpperCase();
                    }
                } else {
                    // text answer (no options)
                    const userAnsStr = Array.isArray(userAns) ? userAns.join(', ') : userAns;
                    const correctAnsStr = q.correctAnswers.join(', ');
                    correct = userAnsStr.trim().toLowerCase() === correctAnsStr.trim().toLowerCase();
                }

                if (correct) correctCount++;

                // Format correct answer display text
                let correctAnswerStr = '';
                let correctAnswerTextStr = '';
                if (q.options.length > 0) {
                    correctAnswerStr = q.correctAnswers.join(', ');
                    correctAnswerTextStr = q.options
                        .filter(o => q.correctAnswers.includes(o.letter))
                        .map(o => `${o.letter}. ${o.text}`)
                        .join(', ');
                } else {
                    correctAnswerStr = q.correctAnswers.join(', ');
                    correctAnswerTextStr = correctAnswerStr;
                }

                return {
                    description: q.description,
                    options: q.options,
                    userAnswer: userAns,
                    correctAnswer: correctAnswerStr,
                    correctAnswerText: correctAnswerTextStr,
                    isCorrect: correct,
                    isMultiple: q.isMultiple,
                    correctAnswers: q.correctAnswers,
                    image: q.image || ''
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

        if (answeredCount < total) {
            showConfirm(`Bạn mới trả lời ${answeredCount} / ${total} câu hỏi. Bạn có chắc chắn muốn nộp bài chứ?`, () => {
                processSubmit();
            });
        } else {
            processSubmit();
        }
    };

    const totalQuestions = testQuestions.length;
    const answeredCount = testQuestions.filter(q => {
        const ans = userAnswers[q.id];
        return q.isMultiple ? (Array.isArray(ans) && ans.length > 0) : !!ans;
    }).length;

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
                                        <div className="question-badge" style={{ backgroundColor: q.isMultiple ? 'var(--warning-soft)' : 'var(--primary-soft)', color: q.isMultiple ? 'var(--warning)' : 'var(--primary)', fontWeight: 'bold' }}>
                                            Câu hỏi {idx + 1} {q.isMultiple ? '(Chọn nhiều đáp án)' : '(Chọn một đáp án)'}
                                        </div>
                                        {q.image && (
                                            <div className="question-image-container" style={{ marginTop: '12px', marginBottom: '16px', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxWidth: '100%', maxHeight: '240px', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--bg-app)' }}>
                                                <img src={q.image} alt="Minh họa câu hỏi" style={{ maxWidth: '100%', maxHeight: '240px', objectFit: 'contain' }} />
                                            </div>
                                        )}
                                        <h3 className="question-text" style={{ fontSize: '18px', fontWeight: '600', marginTop: '8px', marginBottom: '16px', whiteSpace: 'pre-line' }}>
                                            {q.description}
                                        </h3>
                                    </div>

                                    {q.options.length > 0 ? (
                                        <div className="test-choices-list">
                                            {q.options.map(opt => {
                                                const userAns = userAnswers[q.id];
                                                const isSelected = q.isMultiple 
                                                    ? (Array.isArray(userAns) && userAns.includes(opt.letter))
                                                    : userAns === opt.letter;
                                                return (
                                                    <label 
                                                        key={opt.letter} 
                                                        className={`test-choice-item ${isSelected ? 'selected' : ''}`}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', backgroundColor: 'var(--bg-app)', transition: 'var(--transition-all)', marginBottom: '8px' }}
                                                    >
                                                        <input 
                                                            type={q.isMultiple ? "checkbox" : "radio"} 
                                                            name={`test-option-${q.id}`}
                                                            checked={isSelected}
                                                            onChange={() => handleOptionSelect(q.id, opt.letter, q.isMultiple)}
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
                                const ans = userAnswers[q.id];
                                const isAnswered = q.isMultiple
                                    ? (Array.isArray(ans) && ans.length > 0)
                                    : !!ans;
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
