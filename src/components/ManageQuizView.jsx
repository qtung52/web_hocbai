import React, { useState, useEffect } from 'react';
import { compressAndResizeImage } from '../utils/quizParser';

export default function ManageQuizView({ quizSets, editingQuizSet, onSave, onCancel, showAlert, showConfirm }) {
    const [title, setTitle] = useState('');
    const [inputMode, setInputMode] = useState('text'); // 'text' | 'form'
    const [rawText, setRawText] = useState('');
    const [formQuestions, setFormQuestions] = useState([{ id: 'init-1', question: '', answer: '', image: '' }]);
    
    // Folder State
    const [folder, setFolder] = useState('Chưa phân loại');
    const [newFolder, setNewFolder] = useState('');
    const [isNewFolder, setIsNewFolder] = useState(false);

    // Unique folders list calculation
    const existingFolders = Array.from(new Set((quizSets || []).map(s => s.folder).filter(Boolean)));
    const foldersList = existingFolders.includes('Chưa phân loại') 
        ? existingFolders 
        : ['Chưa phân loại', ...existingFolders];

    // Initialize form with editing data or defaults
    useEffect(() => {
        if (editingQuizSet) {
            setTitle(editingQuizSet.title);
            setFolder(editingQuizSet.folder || 'Chưa phân loại');
            setIsNewFolder(false);
            setNewFolder('');
            const raw = formatQuestionsToRawText(editingQuizSet.questions);
            setRawText(raw);
            const initialQuestions = editingQuizSet.questions.map((q, idx) => ({
                id: `edit-${idx}-${Date.now()}`,
                question: q.question,
                answer: q.answer,
                image: q.image || ''
            }));
            setFormQuestions(initialQuestions);

            // Default to 'form' mode if editing an existing quiz with images to preserve them
            const hasImages = editingQuizSet.questions.some(q => q.image);
            if (hasImages) {
                setInputMode('form');
            } else {
                setInputMode('text');
            }
        } else {
            setTitle('');
            setFolder('Chưa phân loại');
            setIsNewFolder(false);
            setNewFolder('');
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
            setFormQuestions([{ id: 'init-1', question: '', answer: '', image: '' }]);
            setInputMode('text');
        }
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
                setFormQuestions(parsed.map((q, idx) => {
                    // Match by text or index to preserve previous question images
                    let matchedImg = '';
                    const matchedByText = formQuestions.find(fq => fq.question.trim() === q.question.trim());
                    if (matchedByText) {
                        matchedImg = matchedByText.image;
                    } else {
                        const matchedByIndex = formQuestions[idx];
                        if (matchedByIndex) {
                            matchedImg = matchedByIndex.image;
                        }
                    }
                    return {
                        id: `parsed-${idx}-${Date.now()}`,
                        question: q.question,
                        answer: q.answer,
                        image: matchedImg || ''
                    };
                }));
            } else {
                setFormQuestions([{ id: `new-1-${Date.now()}`, question: '', answer: '', image: '' }]);
            }
        }
        setInputMode(targetMode);
    };

    const handleAddRow = () => {
        setFormQuestions([...formQuestions, {
            id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            question: '',
            answer: '',
            image: ''
        }]);
    };

    const handleRemoveRow = (id) => {
        if (formQuestions.length <= 1) {
            showAlert('Một bộ câu hỏi cần có ít nhất 1 câu hỏi.');
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
        showConfirm('Bạn có muốn làm trống toàn bộ dữ liệu đang nhập để viết lại?', () => {
            if (inputMode === 'text') {
                setRawText('');
            } else {
                setFormQuestions([{ id: `reset-${Date.now()}`, question: '', answer: '', image: '' }]);
            }
        });
    };


    const handleQuestionImageChange = async (id, e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const compressed = await compressAndResizeImage(file, 600, 600, 0.7);
            handleFormRowChange(id, 'image', compressed);
        } catch (err) {
            console.error('Lỗi khi nén ảnh câu hỏi:', err);
            showAlert('Không thể xử lý ảnh này.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const titleVal = title.trim();
        if (!titleVal) {
            showAlert('Vui lòng nhập tiêu đề bộ câu hỏi.');
            return;
        }

        let questionsArr = [];
        if (inputMode === 'text') {
            const parsed = parseRawTextToQuestions(rawText);
            questionsArr = parsed.map((q, idx) => {
                // Preserve question images if matching by text or index in current formQuestions state
                let matchedImg = '';
                const matchedByText = formQuestions.find(fq => fq.question.trim() === q.question.trim());
                if (matchedByText) {
                    matchedImg = matchedByText.image;
                } else {
                    const matchedByIndex = formQuestions[idx];
                    if (matchedByIndex) {
                        matchedImg = matchedByIndex.image;
                    }
                }
                return {
                    question: q.question.trim(),
                    answer: q.answer.trim(),
                    image: matchedImg || ''
                };
            });
        } else {
            questionsArr = formQuestions
                .filter(q => q.question.trim() && q.answer.trim())
                .map(q => ({ 
                    question: q.question.trim(), 
                    answer: q.answer.trim(),
                    image: q.image || ''
                }));
        }

        if (questionsArr.length === 0) {
            showAlert('Không tìm thấy câu hỏi hợp lệ. Vui lòng kiểm tra lại cấu trúc nhập liệu.');
            return;
        }

        onSave({
            title: titleVal,
            folder: isNewFolder ? newFolder.trim() : folder,
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

                    {/* Folder Selection Row */}
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label className="form-label">Thư mục / Môn học</label>
                        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', maxWidth: '400px' }}>
                            {!isNewFolder ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select 
                                        className="form-input"
                                        value={folder}
                                        onChange={(e) => {
                                            if (e.target.value === '__new__') {
                                                setIsNewFolder(true);
                                            } else {
                                                setFolder(e.target.value);
                                            }
                                        }}
                                        style={{ flexGrow: 1 }}
                                    >
                                        {foldersList.map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                        <option value="__new__">📁 + Tạo thư mục mới...</option>
                                    </select>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="Tên thư mục mới..."
                                        value={newFolder}
                                        onChange={(e) => setNewFolder(e.target.value)}
                                        style={{ flexGrow: 1 }}
                                    />
                                    <button 
                                        type="button" 
                                        className="btn btn-outline" 
                                        onClick={() => {
                                            setIsNewFolder(false);
                                            setNewFolder('');
                                        }}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            )}
                        </div>
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
                                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    <div>
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
                                                    <div>
                                                        <label className="form-label">Hình minh họa (Tùy chọn)</label>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div className="file-input-wrapper" style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                                                                <button type="button" className="btn btn-sm btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '12px' }}>
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                                                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                                    </svg>
                                                                    Tải ảnh
                                                                </button>
                                                                <input 
                                                                    type="file" 
                                                                    accept="image/*" 
                                                                    onChange={(e) => handleQuestionImageChange(q.id, e)}
                                                                    style={{ position: 'absolute', left: 0, top: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                                                />
                                                            </div>
                                                            {q.image && (
                                                                <div className="image-preview-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--primary-soft)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                                                                    <img src={q.image} alt="Question preview" style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                                                                    <button type="button" onClick={() => handleFormRowChange(q.id, 'image', '')} style={{ border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
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
