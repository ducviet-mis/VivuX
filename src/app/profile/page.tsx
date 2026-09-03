'use client';

import { useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User as UserIcon, Shield, Camera, Save, Eye, EyeOff, 
  LogOut, Loader2, CheckCircle, AlertCircle, CalendarDays, Phone, Mail
} from 'lucide-react';

type Tab = 'personal' | 'security';

export default function ProfilePage() {
  const { user, refreshUser, logoutAllDevices } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('personal');

  if (!user) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Vui lòng đăng nhập để xem thông tin tài khoản.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'personal' as Tab, label: 'Thông tin cá nhân', icon: UserIcon },
    { id: 'security' as Tab, label: 'Bảo mật', icon: Shield },
  ];

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-2xl font-bold mb-6">Cài đặt tài khoản</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <nav className="md:w-56 shrink-0">
          <div className="flex md:flex-col gap-1 p-1 bg-card border rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full text-left ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'personal' && <PersonalInfoTab user={user} refreshUser={refreshUser} />}
          {activeTab === 'security' && <SecurityTab logoutAllDevices={logoutAllDevices} />}
        </div>
      </div>
    </div>
  );
}

// ─── Personal Info Tab ───────────────────────────────────────────
function PersonalInfoTab({ user, refreshUser }: { user: any; refreshUser: () => Promise<void> }) {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [birthDate, setBirthDate] = useState(user.birthDate || '');
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Ảnh quá lớn. Vui lòng chọn ảnh dưới 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setAvatarPreview(base64);
      const supabase = getSupabaseClient();
      await supabase.from('profiles').update({ avatar_url: base64 }).eq('id', user.id);
      await refreshUser();
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('profiles').update({
      name,
      phone,
      birth_date: birthDate || null,
    }).eq('id', user.id);

    if (error) {
      alert('Lỗi: ' + error.message);
    } else {
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const initials = name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="w-5 h-5" /> Thông tin cá nhân
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="w-20 h-20 border-2 border-primary/20">
              <AvatarImage src={avatarPreview} />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera className="w-5 h-5 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <Badge variant="outline" className="mt-1">
              {user.role === 'teacher' ? '👨‍🏫 Giáo viên' : '🎓 Học sinh'}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><UserIcon className="w-4 h-4" /> Họ và tên</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập họ và tên" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</Label>
            <Input value={user.email} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Phone className="w-4 h-4" /> Số điện thoại</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0901234567" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Ngày sinh</Label>
            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Đang lưu...' : saved ? 'Đã lưu thành công!' : 'Lưu thông tin'}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Security Tab ────────────────────────────────────────────────
function SecurityTab({ logoutAllDevices }: { logoutAllDevices: () => Promise<void> }) {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleChangePassword = async () => {
    setMessage(null);
    if (newPass.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    if (newPass !== confirmPass) {
      setMessage({ type: 'error', text: 'Xác nhận mật khẩu không khớp.' });
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      // Verify old password by signing in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('No user');

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPass,
      });

      if (signInErr) {
        setMessage({ type: 'error', text: 'Mật khẩu cũ không đúng.' });
        setSaving(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
        setOldPass('');
        setNewPass('');
        setConfirmPass('');
      }
    } catch {
      setMessage({ type: 'error', text: 'Đã xảy ra lỗi.' });
    }
    setSaving(false);
  };

  const handleLogoutAll = async () => {
    setLoggingOut(true);
    await logoutAllDevices();
    window.location.href = '/login';
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" /> Đổi mật khẩu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <div className="space-y-2">
            <Label>Mật khẩu cũ</Label>
            <div className="relative">
              <Input type={showOld ? 'text' : 'password'} value={oldPass} onChange={(e) => setOldPass(e.target.value)} placeholder="Nhập mật khẩu cũ" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowOld(!showOld)}>
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mật khẩu mới</Label>
            <div className="relative">
              <Input type={showNew ? 'text' : 'password'} value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Xác nhận mật khẩu mới</Label>
            <Input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Nhập lại mật khẩu mới" />
          </div>

          <Button onClick={handleChangePassword} disabled={saving || !oldPass || !newPass || !confirmPass} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </Button>
        </CardContent>
      </Card>

      {/* Logout All Devices */}
      <Card className="rounded-2xl border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <LogOut className="w-5 h-5" /> Đăng xuất trên tất cả thiết bị
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Hành động này sẽ đăng xuất tài khoản khỏi tất cả các trình duyệt và thiết bị đang đăng nhập. Bạn sẽ cần đăng nhập lại.
          </p>
          <Button variant="destructive" onClick={handleLogoutAll} disabled={loggingOut} className="gap-2">
            {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất tất cả thiết bị'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
