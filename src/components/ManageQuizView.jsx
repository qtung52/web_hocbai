import React, { useState, useEffect } from 'react';

export default function ManageQuizView({ editingQuizSet, onSave, onCancel }) {
    const [title, setTitle] = useState('');
    const [inputMode, setInputMode] = useState('text'); // 'text' | 'form'
    const [rawText, setRawText] = useState('');
    const [formQuestions, setFormQuestions] = useState([{ id: 'init-1', question: '', answer: '' }]);

    // Initialize form with editing data or defaults
    useEffect(() => {
        if (editingQuizSet) {
            setTitle(editingQuizSet.title);
            const raw = formatQuestionsToRawText(editingQuizSet.questions);
            setRawText(raw);
            setFormQuestions(editingQuizSet.questions.map((q, idx) => ({
                id: `edit-${idx}-${Date.now()}`,
                question: q.question,
                answer: q.answer
            })));
        } else {
            setTitle('');
            setRawText(`câu 1: Đây là câu hỏi ví dụ thứ nhất?
A. Lựa chọn 1
B. Lựa chọn 2
C. Lựa chọn 3
D. Lựa chọn 4
Answer: B

câu 2: Đây là câu hỏi ví dụ thứ hai?
A. Lựa chọn A
B. Lựa chọn B
C. Lựa chọn C
D. Lựa chọn D
Answer: C`);
            setFormQuestions([{ id: 'init-1', question: '', answer: '' }]);
        }
        setInputMode('text');
    }, [editingQuizSet]);

    // Format questions array to raw text string
    function formatQuestionsToRawText(questions) {
        return questions.map((q, index) => {
            return `câu ${index + 1}: ${q.question}\nAnswer: ${q.answer}`;
        }).join('\n\n');
    }

    // Parse raw text string to questions array
    function parseRawTextToQuestions(text) {
        const blocks = text.split(/(?=câu\s+\d+\s*[:\.\-]\s*)/i);
        const questions = [];

        blocks.forEach(block => {
            const blockTrimmed = block.trim();
            if (!blockTrimmed) return;

            const lines = blockTrimmed.split('\n').map(l => l.trim()).filter(l => l !== '');
            if (lines.length < 2) return;

            let questionText = lines[0].replace(/^câu\s+\d+\s*[:\.\-]\s*/i, '');
            let choices = [];
            let answer = '';

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                const answerMatch = line.match(/^(?:Answer|Đáp án|Đáp án đúng|Ans)\s*:\s*(.+)/i);

                if (answerMatch) {
                    answer = answerMatch[1].trim();
                    continue;
                }

                if (/^[A-Za-z0-9]\s*[\.\-\)]\s*/i.test(line)) {
                    choices.push(line);
                } else {
                    if (choices.length === 0 && !answer) {
                        questionText += '\n' + line;
                    } else if (!answer) {
                        choices[choices.length - 1] += '\n' + line;
                    }
                }
            }

            if (questionText && answer) {
                let finalQuestion = questionText;
                if (choices.length > 0) {
                    finalQuestion += '\n' + choices.join('\n');
                }
                questions.push({
                    question: finalQuestion,
                    answer: answer
                });
            }
        });

        return questions;
    }

    const handleSwitchMode = (targetMode) => {
        if (inputMode === targetMode) return;

        if (targetMode === 'text') {
            // From form to text
            const validQuestions = formQuestions.filter(q => q.question.trim() && q.answer.trim());
            if (validQuestions.length > 0) {
                setRawText(formatQuestionsToRawText(validQuestions));
            }
        } else {
            // From text to form
            const parsed = parseRawTextToQuestions(rawText);
            if (parsed.length > 0) {
                setFormQuestions(parsed.map((q, idx) => ({
                    id: `parsed-${idx}-${Date.now()}`,
                    question: q.question,
                    answer: q.answer
                })));
            } else {
                setFormQuestions([{ id: `new-1-${Date.now()}`, question: '', answer: '' }]);
            }
        }
        setInputMode(targetMode);
    };

    const handleAddRow = () => {
        setFormQuestions([...formQuestions, {
            id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            question: '',
            answer: ''
        }]);
    };

    const handleRemoveRow = (id) => {
        if (formQuestions.length <= 1) {
            alert('Một bộ câu hỏi cần có ít nhất 1 câu hỏi.');
            return;
        }
        setFormQuestions(formQuestions.filter(q => q.id !== id));
    };

    const handleFormRowChange = (id, field, value) => {
        setFormQuestions(formQuestions.map(q => {
            if (q.id === id) {
                return { ...q, [field]: value };
            }
            return q;
        }));
    };

    const handleResetForm = () => {
        if (window.confirm('Bạn có muốn làm trống toàn bộ dữ liệu đang nhập để viết lại?')) {
            if (inputMode === 'text') {
                setRawText('');
            } else {
                setFormQuestions([{ id: `reset-${Date.now()}`, question: '', answer: '' }]);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const titleVal = title.trim();
        if (!titleVal) {
            alert('Vui lòng nhập tiêu đề bộ câu hỏi.');
            return;
        }

        let questionsArr = [];
        if (inputMode === 'text') {
            questionsArr = parseRawTextToQuestions(rawText);
        } else {
            questionsArr = formQuestions
                .filter(q => q.question.trim() && q.answer.trim())
                .map(q => ({ question: q.question.trim(), answer: q.answer.trim() }));
        }

        if (questionsArr.length === 0) {
            alert('Không tìm thấy câu hỏi hợp lệ. Vui lòng kiểm tra lại cấu trúc nhập liệu.');
            return;
        }

        onSave({
            title: titleVal,
            questions: questionsArr
        });
    };

    return (
        <section id="view-manage-quiz" className="app-view active">
            <div className="view-header">
                <div>
                    <h1>{editingQuizSet ? 'Chỉnh Sửa Bộ Câu Hỏi' : 'Tạo Bộ Câu Hỏi Mới'}</h1>
                    <p className="subtitle">Thêm tiêu đề và các câu hỏi kèm đáp án đúng để lưu trữ dữ liệu học tập.</p>
                </div>
                <button className="btn btn-outline" onClick={onCancel}>
                    Quay Lại
                </button>
            </div>

            <div className="form-container card-panel">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="quiz-title-input" className="form-label">Tiêu đề bộ câu hỏi <span className="required">*</span></label>
                        <input 
                            type="text" 
                            id="quiz-title-input" 
                            className="form-input text-lg" 
                            placeholder="Ví dụ: Lịch sử Việt Nam thế kỷ 20, Javascript Cơ Bản..." 
                            required 
                            autoComplete="off"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="questions-section">
                        <div className="section-subtitle-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                            <h3>Thiết Lập Câu Hỏi</h3>
                            
                            {/* Mode Tab Selectors */}
                            <div className="input-mode-tabs" style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--primary-soft)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                                <button 
                                    type="button" 
                                    className={`btn btn-sm ${inputMode === 'text' ? 'active' : ''}`}
                                    style={{ 
                                        padding: '6px 12px', 
                                        fontSize: '13px', 
                                        borderRadius: 'var(--radius-sm)', 
                                        border: 'none', 
                                        cursor: 'pointer', 
                                        transition: 'var(--transition-all)',
                                        background: inputMode === 'text' ? 'var(--primary)' : 'transparent',
                                        color: inputMode === 'text' ? 'var(--text-on-primary)' : 'var(--text-muted)'
                                    }} 
                                    onClick={() => handleSwitchMode('text')}
                                >
                                    Nhập nhanh dạng văn bản
                                </button>
                                <button 
                                    type="button" 
                                    className={`btn btn-sm ${inputMode === 'form' ? 'active' : ''}`}
                                    style={{ 
                                        padding: '6px 12px', 
                                        fontSize: '13px', 
                                        borderRadius: 'var(--radius-sm)', 
                                        border: 'none', 
                                        cursor: 'pointer', 
                                        transition: 'var(--transition-all)',
                                        background: inputMode === 'form' ? 'var(--primary)' : 'transparent',
                                        color: inputMode === 'form' ? 'var(--text-on-primary)' : 'var(--text-muted)'
                                    }} 
                                    onClick={() => handleSwitchMode('form')}
                                >
                                    Nhập từng câu thủ công
                                </button>
                            </div>
                        </div>

                        {/* Container 1: Bulk Text Input Mode */}
                        {inputMode === 'text' && (
                            <div id="manage-mode-text-container" className="manage-mode-panel active">
                                <div className="format-guidelines-box card-panel" style={{ marginTop: '12px', marginBottom: '16px', padding: '16px', fontSize: '13px', backgroundColor: 'var(--primary-soft)', borderColor: 'var(--primary)' }}>
                                    <h4 style={{ color: 'var(--primary)', marginBottom: '6px', fontWeight: '700' }}>💡 Hướng dẫn nhập câu hỏi theo định dạng:</h4>
                                    <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>Vui lòng nhập danh sách câu hỏi của bạn vào khung văn bản dưới đây. Mỗi câu hỏi cần tuân thủ cấu trúc sau (các câu hỏi cách nhau bởi 1 dòng trống):</p>
                                    <pre style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontFamily: 'monospace', overflowX: 'auto', color: 'var(--text-main)' }}>
{`câu 1: Đây là nội dung câu hỏi?
A. Lựa chọn thứ nhất
B. Lựa chọn thứ hai
C. Lựa chọn thứ ba
D. Lựa chọn thứ tư
Answer: B`}</pre>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="quiz-questions-raw" className="form-label">Nội dung văn bản câu hỏi <span className="required">*</span></label>
                                    <textarea 
                                        id="quiz-questions-raw" 
                                        className="form-input raw-questions-textarea" 
                                        placeholder="Nhập hoặc dán toàn bộ câu hỏi của bạn tại đây theo đúng hướng dẫn..." 
                                        style={{ minHeight: '380px', fontFamily: 'monospace', lineHeight: '1.6', fontSize: '14px', resize: 'vertical' }}
                                        value={rawText}
                                        onChange={(e) => setRawText(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {/* Container 2: Manual Row Input Mode */}
                        {inputMode === 'form' && (
                            <div id="manage-mode-form-container" className="manage-mode-panel">
                                <div id="questions-list-container" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {formQuestions.map((q, index) => (
                                        <div className="question-form-card animate-fade-in" key={q.id}>
                                            <div className="question-card-header">
                                                <span className="question-card-title">Câu Hỏi {index + 1}</span>
                                                <button 
                                                    type="button" 
                                                    className="btn-remove-question" 
                                                    aria-label="Xóa câu hỏi"
                                                    onClick={() => handleRemoveRow(q.id)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                    </svg>
                                                    Xóa Câu Hỏi
                                                </button>
                                            </div>
                                            <div className="question-grid-fields">
                                                <div className="form-group">
                                                    <label className="form-label">Nội dung câu hỏi & Các lựa chọn A,B,C,D <span className="required">*</span></label>
                                                    <textarea 
                                                        className="form-input q-text-input" 
                                                        placeholder="Ví dụ:\nĐâu là từ khóa khai báo hằng số?\nA. var\nB. let\nC. const\nD. static" 
                                                        required 
                                                        rows="4" 
                                                        style={{ lineHeight: '1.5', fontSize: '13px' }}
                                                        value={q.question}
                                                        onChange={(e) => handleFormRowChange(q.id, 'question', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Đáp án đúng <span className="required">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        className="form-input q-ans-input" 
                                                        placeholder="Ví dụ: C" 
                                                        required 
                                                        value={q.answer}
                                                        onChange={(e) => handleFormRowChange(q.id, 'answer', e.target.value)}
                                                        autoComplete="off"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    type="button" 
                                    className="btn btn-outline-primary" 
                                    id="btn-add-question-row" 
                                    style={{ marginTop: '12px', width: '100%' }}
                                    onClick={handleAddRow}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ marginRight: '4px', display: 'inline' }}>
                                        <path d="M12 5V19M5 12H19" strokeLinecap="round"/>
                                    </svg>
                                    Thêm Câu Hỏi Tiếp Theo
                                </button>
                            </div>
                        )}

                        <div className="form-actions-bar" style={{ marginTop: '24px' }}>
                            <span className="badge">
                                {inputMode === 'text' ? 'Chế độ văn bản' : `Chế độ form: ${formQuestions.length} câu hỏi`}
                            </span>
                            <div className="submit-actions">
                                <button type="button" className="btn btn-outline" onClick={handleResetForm}>Làm Mới Form</button>
                                <button type="submit" className="btn btn-primary">Lưu Bộ Câu Hỏi</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
}
