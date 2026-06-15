import { useState } from 'react';
import { supabase } from '../utils/supabase';

export default function AuthView({ showAlert, recoveryMode = false, onPasswordResetComplete }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mode, setMode] = useState(recoveryMode ? 'reset-password' : 'login'); // 'login' | 'register' | 'forgot' | 'reset-password'
    const [loading, setLoading] = useState(false);

    // Sync mode if recoveryMode changes dynamically
    const [prevRecoveryMode, setPrevRecoveryMode] = useState(recoveryMode);
    if (recoveryMode !== prevRecoveryMode) {
        setPrevRecoveryMode(recoveryMode);
        setMode(recoveryMode ? 'reset-password' : 'login');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const emailVal = email.trim();
        const passVal = password.trim();
        const confirmVal = confirmPassword.trim();
        
        if (mode === 'forgot') {
            if (!emailVal) {
                showAlert('Vui lòng điền Email để khôi phục mật khẩu.');
                return;
            }
            try {
                setLoading(true);
                const { error } = await supabase.auth.resetPasswordForEmail(emailVal, {
                    redirectTo: window.location.origin
                });
                if (error) throw error;
                showAlert('Một liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.', 'Khôi phục mật khẩu');
                setMode('login');
            } catch (err) {
                console.error('Lỗi khôi phục mật khẩu:', err);
                showAlert(err.message || 'Có lỗi xảy ra khi gửi liên kết khôi phục.', 'Lỗi khôi phục');
            } finally {
                setLoading(false);
            }
            return;
        }

        if (mode === 'reset-password') {
            if (!passVal) {
                showAlert('Vui lòng nhập mật khẩu mới.');
                return;
            }
            if (passVal.length < 6) {
                showAlert('Mật khẩu phải chứa ít nhất 6 ký tự.');
                return;
            }
            if (passVal !== confirmVal) {
                showAlert('Mật khẩu nhập lại không trùng khớp.');
                return;
            }
            try {
                setLoading(true);
                const { error } = await supabase.auth.updateUser({
                    password: passVal
                });
                if (error) throw error;
                showAlert('Đặt lại mật khẩu thành công! Bạn hiện đã đăng nhập.', 'Thành công', () => {
                    if (onPasswordResetComplete) onPasswordResetComplete();
                });
            } catch (err) {
                console.error('Lỗi đặt lại mật khẩu:', err);
                showAlert(err.message || 'Có lỗi xảy ra khi đặt lại mật khẩu.', 'Lỗi đặt lại mật khẩu');
            } finally {
                setLoading(false);
            }
            return;
        }

        // Existing modes: 'login' | 'register'
        if (!emailVal || !passVal) {
            showAlert('Vui lòng điền đầy đủ Email và Mật khẩu.');
            return;
        }

        if (mode === 'register') {
            if (passVal !== confirmVal) {
                showAlert('Mật khẩu nhập lại không trùng khớp.');
                return;
            }
            if (passVal.length < 6) {
                showAlert('Mật khẩu phải chứa ít nhất 6 ký tự.');
                return;
            }
        }

        try {
            setLoading(true);
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email: emailVal,
                    password: passVal,
                });
                if (error) throw error;
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email: emailVal,
                    password: passVal,
                });
                if (error) throw error;
                
                if (data?.session) {
                    showAlert('Đăng ký tài khoản thành công!');
                } else {
                    showAlert('Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác thực tài khoản trước khi đăng nhập.', 'Xác thực Email');
                    setMode('login');
                    setPassword('');
                    setConfirmPassword('');
                }
            }
        } catch (err) {
            console.error('Lỗi xác thực:', err);
            showAlert(err.message || 'Có lỗi xảy ra trong quá trình xác thực.', 'Lỗi xác thực');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-view-container">
            <div className="auth-card card-panel">
                <div className="auth-logo-header">
                    <div className="auth-logo">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h1>EduQuiz Hub</h1>
                    <p className="subtitle">Hệ thống ôn luyện & kiểm tra thông minh</p>
                </div>

                <hr className="divider" style={{ margin: '20px 0' }} />

                <h2 className="auth-title">
                    {mode === 'login' && 'Đăng Nhập Tài Khoản'}
                    {mode === 'register' && 'Đăng Ký Tài Khoản'}
                    {mode === 'forgot' && 'Khôi Phục Mật Khẩu'}
                    {mode === 'reset-password' && 'Đặt Lại Mật Khẩu Mới'}
                </h2>

                <form onSubmit={handleSubmit} className="auth-form">
                    {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
                        <div className="form-group animate-fade-in">
                            <label className="form-label" htmlFor="auth-email">Địa chỉ Email</label>
                            <input 
                                type="email" 
                                id="auth-email" 
                                className="form-input" 
                                placeholder="name@example.com" 
                                required 
                                disabled={loading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>
                    )}

                    {(mode === 'login' || mode === 'register' || mode === 'reset-password') && (
                        <div className="form-group animate-fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="form-label" htmlFor="auth-password">
                                    {mode === 'reset-password' ? 'Mật khẩu mới' : 'Mật khẩu'}
                                </label>
                                {mode === 'login' && (
                                    <button 
                                        type="button" 
                                        onClick={() => { setMode('forgot'); setEmail(email.trim()); }}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                                    >
                                        Quên mật khẩu?
                                    </button>
                                )}
                            </div>
                            <input 
                                type="password" 
                                id="auth-password" 
                                className="form-input" 
                                placeholder={mode === 'reset-password' ? 'Nhập mật khẩu mới...' : 'Nhập mật khẩu...'}
                                required 
                                disabled={loading}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete={mode === 'reset-password' ? 'new-password' : 'current-password'}
                            />
                        </div>
                    )}

                    {(mode === 'register' || mode === 'reset-password') && (
                        <div className="form-group animate-fade-in">
                            <label className="form-label" htmlFor="auth-confirm-password">
                                {mode === 'reset-password' ? 'Xác nhận mật khẩu mới' : 'Nhập lại mật khẩu'}
                            </label>
                            <input 
                                type="password" 
                                id="auth-confirm-password" 
                                className="form-input" 
                                placeholder={mode === 'reset-password' ? 'Nhập lại mật khẩu mới...' : 'Nhập lại mật khẩu...'}
                                required 
                                disabled={loading}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn btn-primary btn-block btn-auth-submit"
                        disabled={loading}
                        style={{ marginTop: '24px', padding: '12px' }}
                    >
                        {loading ? (
                            <span>Đang xử lý...</span>
                        ) : (
                            <span>
                                {mode === 'login' && 'Đăng Nhập'}
                                {mode === 'register' && 'Đăng Ký'}
                                {mode === 'forgot' && 'Gửi Liên Kết'}
                                {mode === 'reset-password' && 'Cập Nhật Mật Khẩu'}
                            </span>
                        )}
                    </button>
                </form>

                <div className="auth-switch-prompt" style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px' }}>
                    {mode === 'login' && (
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                            Chưa có tài khoản?{' '}
                            <button 
                                type="button" 
                                className="auth-switch-btn" 
                                onClick={() => { setMode('register'); setPassword(''); }}
                                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', outline: 'none' }}
                            >
                                Đăng ký ngay
                            </button>
                        </p>
                    )}
                    {mode === 'register' && (
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                            Đã có tài khoản?{' '}
                            <button 
                                type="button" 
                                className="auth-switch-btn" 
                                onClick={() => { setMode('login'); setPassword(''); setConfirmPassword(''); }}
                                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', outline: 'none' }}
                            >
                                Đăng nhập tại đây
                            </button>
                        </p>
                    )}
                    {mode === 'forgot' && (
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                            Nhớ mật khẩu?{' '}
                            <button 
                                type="button" 
                                className="auth-switch-btn" 
                                onClick={() => { setMode('login'); setPassword(''); setConfirmPassword(''); }}
                                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', outline: 'none' }}
                            >
                                Quay lại đăng nhập
                            </button>
                        </p>
                    )}
                    {mode === 'reset-password' && (
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                            Hủy khôi phục?{' '}
                            <button 
                                type="button" 
                                className="auth-switch-btn" 
                                onClick={() => { 
                                    if (onPasswordResetComplete) onPasswordResetComplete();
                                }}
                                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', outline: 'none' }}
                            >
                                Quay về trang chủ
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
