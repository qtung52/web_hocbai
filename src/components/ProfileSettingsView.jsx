import { useState } from 'react';
import { supabase } from '../utils/supabase';

export default function ProfileSettingsView({ user, showAlert }) {
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'
    
    // Profile State
    const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
    const [updatingProfile, setUpdatingProfile] = useState(false);

    // Security State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updatingPassword, setUpdatingPassword] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const trimmedName = displayName.trim();
        if (!trimmedName) {
            showAlert('Tên hiển thị không được bỏ trống.');
            return;
        }

        try {
            setUpdatingProfile(true);
            const { error } = await supabase.auth.updateUser({
                data: { display_name: trimmedName }
            });
            if (error) throw error;
            showAlert('Cập nhật thông tin cá nhân thành công!', 'Thành công');
        } catch (err) {
            console.error('Error updating profile:', err);
            showAlert(err.message || 'Có lỗi xảy ra khi cập nhật thông tin.', 'Lỗi cập nhật');
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        const passwordVal = newPassword.trim();
        const confirmVal = confirmPassword.trim();

        if (!passwordVal) {
            showAlert('Vui lòng nhập mật khẩu mới.');
            return;
        }
        if (passwordVal.length < 6) {
            showAlert('Mật khẩu phải chứa ít nhất 6 ký tự.');
            return;
        }
        if (passwordVal !== confirmVal) {
            showAlert('Mật khẩu nhập lại không khớp.');
            return;
        }

        try {
            setUpdatingPassword(true);
            const { error } = await supabase.auth.updateUser({
                password: passwordVal
            });
            if (error) throw error;
            showAlert('Đổi mật khẩu thành công!', 'Thành công');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Error updating password:', err);
            showAlert(err.message || 'Có lỗi xảy ra khi đổi mật khẩu.', 'Lỗi đổi mật khẩu');
        } finally {
            setUpdatingPassword(false);
        }
    };

    // Calculate avatar initials
    const initials = displayName
        ? displayName.trim().substring(0, 2).toUpperCase()
        : (user?.email ? user.email.substring(0, 2).toUpperCase() : 'US');

    return (
        <section id="view-profile-settings" className="app-view active">
            <div className="view-header">
                <div>
                    <h1>Hồ Sơ & Cài Đặt</h1>
                    <p className="subtitle">Quản lý thông tin tài khoản và cấu hình bảo mật</p>
                </div>
            </div>

            <div className="settings-container">
                {/* Tabs Selector */}
                <div className="settings-tabs-wrapper">
                    <div className="settings-tabs">
                        <button 
                            type="button" 
                            className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <span>Thông tin cá nhân</span>
                        </button>
                        <button 
                            type="button" 
                            className={`settings-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <span>Bảo mật tài khoản</span>
                        </button>
                    </div>
                </div>

                {/* Tab Panel Content */}
                <div className="settings-content card-panel" style={{ marginTop: '24px' }}>
                    {activeTab === 'profile' && (
                        <div className="settings-panel animate-fade-in">
                            <h3 className="settings-panel-title" style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '700' }}>
                                Cập nhật Hồ sơ Cá nhân
                            </h3>
                            
                            <div className="profile-preview-section" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                                <div className="user-avatar" style={{ width: '80px', height: '80px', fontSize: '28px', border: '3px solid var(--border-color)', margin: 0 }}>
                                    <span>{initials}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '16px', fontWeight: '600' }}>
                                        {displayName || 'Chưa đặt tên'}
                                    </h4>
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user?.email}</span>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="settings-form" style={{ maxWidth: '480px' }}>
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label className="form-label" htmlFor="settings-display-name">Tên hiển thị</label>
                                    <input 
                                        type="text" 
                                        id="settings-display-name" 
                                        className="form-input" 
                                        placeholder="Nhập tên hiển thị của bạn..." 
                                        required 
                                        disabled={updatingProfile}
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    disabled={updatingProfile}
                                    style={{ padding: '10px 24px' }}
                                >
                                    {updatingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings-panel animate-fade-in">
                            <h3 className="settings-panel-title" style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '700' }}>
                                Đổi mật khẩu tài khoản
                            </h3>

                            <form onSubmit={handleUpdatePassword} className="settings-form" style={{ maxWidth: '480px' }}>
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label className="form-label">Địa chỉ Email</label>
                                    <input 
                                        type="email" 
                                        className="form-input" 
                                        value={user?.email || ''} 
                                        disabled 
                                        style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                                    />
                                    <small style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                        Địa chỉ email đăng nhập không thể thay đổi.
                                    </small>
                                </div>

                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label className="form-label" htmlFor="settings-new-password">Mật khẩu mới</label>
                                    <input 
                                        type="password" 
                                        id="settings-new-password" 
                                        className="form-input" 
                                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..." 
                                        required 
                                        disabled={updatingPassword}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '24px' }}>
                                    <label className="form-label" htmlFor="settings-confirm-password">Xác nhận mật khẩu mới</label>
                                    <input 
                                        type="password" 
                                        id="settings-confirm-password" 
                                        className="form-input" 
                                        placeholder="Nhập lại mật khẩu mới..." 
                                        required 
                                        disabled={updatingPassword}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    disabled={updatingPassword}
                                    style={{ padding: '10px 24px' }}
                                >
                                    {updatingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
