import React, { useState, useEffect } from 'react';

export default function TestSetupModal({ isOpen, quizSet, onCancel, onStart }) {
    const [questionCount, setQuestionCount] = useState(20);
    const [randomize, setRandomize] = useState(true);
    const [shuffleOptions, setShuffleOptions] = useState(true);

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
        onStart({
            questionCount: count,
            randomize,
            shuffleOptions
        });
    };

    return (
        <div className="modal-overlay" style={{ display: 'flex' }}>
            <div className="modal-content card-panel" onClick={(e) => e.stopPropagation()}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Cấu hình Bài Kiểm Tra</h2>
                <p className="subtitle" style={{ marginBottom: '16px' }}>{quizSet.title}</p>
                <hr className="divider" />
                
                <form onSubmit={handleSubmit}>
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
                    
                    <div className="form-group-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
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
