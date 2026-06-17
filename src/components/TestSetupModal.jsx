import React, { useState, useEffect } from 'react';

export default function TestSetupModal({ isOpen, quizSet, onCancel, onStart }) {
    const [questionCount, setQuestionCount] = useState(20);
    const [randomize, setRandomize] = useState(true);
    const [shuffleOptions, setShuffleOptions] = useState(true);
    const [useTimeLimit, setUseTimeLimit] = useState(false);
    const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);

    useEffect(() => {
        if (quizSet) {
            const total = quizSet.questions.length;
            setQuestionCount(Math.min(20, total));
        }
    }, [quizSet]);

    if (!isOpen || !quizSet) return null;

    const totalQuestions = quizSet.questions.length;

    const handleSubmit = (e) => {
        e.preventDefault();
        const count = Math.max(1, Math.min(totalQuestions, parseInt(questionCount) || 1));
        const mins = Math.max(1, Math.min(180, parseInt(timeLimitMinutes) || 30));
        onStart({
            questionCount: count,
            randomize,
            shuffleOptions,
            timeLimit: useTimeLimit ? mins * 60 : 0  // seconds, 0 = no limit
        });
    };

    return (
        <div className="modal-overlay" style={{ display: 'flex' }}>
            <div className="modal-content card-panel" onClick={(e) => e.stopPropagation()}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Cấu hình Bài Kiểm Tra</h2>
                <p className="subtitle" style={{ marginBottom: '16px' }}>{quizSet.title}</p>
                <hr className="divider" />
                
                <form onSubmit={handleSubmit}>
                    {/* Question count */}
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label" htmlFor="test-question-count" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            Số lượng câu hỏi (tối đa <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{totalQuestions}</span>):
                        </label>
                        <input 
                            type="number" 
                            id="test-question-count" 
                            className="form-input" 
                            min="1" 
                            max={totalQuestions}
                            value={questionCount}
                            onChange={(e) => setQuestionCount(e.target.value)}
                            required
                        />
                    </div>
                    
                    {/* Randomize questions */}
                    <div className="form-group-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <input 
                            type="checkbox" 
                            id="test-randomize-questions" 
                            checked={randomize}
                            onChange={(e) => setRandomize(e.target.checked)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                        <label htmlFor="test-randomize-questions" style={{ fontSize: '14px', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}>
                            Xáo trộn thứ tự câu hỏi (Random)
                        </label>
                    </div>
                    
                    {/* Shuffle options */}
                    <div className="form-group-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <input 
                            type="checkbox" 
                            id="test-shuffle-options" 
                            checked={shuffleOptions}
                            onChange={(e) => setShuffleOptions(e.target.checked)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                        <label htmlFor="test-shuffle-options" style={{ fontSize: '14px', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}>
                            Xáo trộn đáp án (A, B, C, D)
                        </label>
                    </div>

                    {/* Time limit section */}
                    <div style={{ 
                        borderTop: '1px solid var(--border-color)', 
                        paddingTop: '16px', 
                        marginBottom: '24px' 
                    }}>
                        <div className="form-group-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <input 
                                type="checkbox" 
                                id="test-use-time-limit" 
                                checked={useTimeLimit}
                                onChange={(e) => setUseTimeLimit(e.target.checked)}
                                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                            />
                            <label htmlFor="test-use-time-limit" style={{ fontSize: '14px', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}>
                                ⏱️ Giới hạn thời gian làm bài
                            </label>
                        </div>

                        {useTimeLimit && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '24px' }}>
                                <input
                                    type="number"
                                    className="form-input"
                                    min="1"
                                    max="180"
                                    value={timeLimitMinutes}
                                    onChange={(e) => setTimeLimitMinutes(e.target.value)}
                                    style={{ width: '80px', textAlign: 'center', fontWeight: '700' }}
                                />
                                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>phút</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    (Tự động nộp bài khi hết giờ)
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" className="btn btn-outline" onClick={onCancel}>
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Bắt đầu làm bài
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
