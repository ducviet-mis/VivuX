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
        <nav className="w-full md:w-56 shrink-0">
          <div className="flex flex-row md:flex-col gap-2 p-1.5 bg-card border rounded-2xl overflow-x-auto snap-x [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center md:justify-start gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap snap-start flex-1 md:flex-none ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-md'
                    : 'text-muted-foreground hover:bg-slate-50 dark:hover:bg-white/5 hover:text-foreground'
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

  const words = name ? name.trim().split(/\s+/) : [];
  const initials = words.length > 1 
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
    : words.length === 1 
      ? words[0].slice(0, 2).toUpperCase() 
      : 'U';

  return (
    <Card className="rounded-2xl md:rounded-[32px] border-slate-200 dark:border-white/10 shadow-sm">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-white/5 mb-6">
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl font-bold text-[#1e1b4b] dark:text-white">
          <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-fuchsia-500" /> Thông tin cá nhân
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 px-4 md:px-8">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="w-20 h-20 md:w-24 md:h-24 border-[3px] border-white dark:border-[#1a1625] shadow-md">
              <AvatarImage src={avatarPreview} className="object-cover" />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">{initials}</AvatarFallback>
            </Avatar>
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
              <Camera className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <h3 className="font-bold text-xl md:text-2xl text-[#1e1b4b] dark:text-white mb-2">{name}</h3>
            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20 border-0 rounded-lg px-3 py-1">
              {user.role === 'teacher' ? '👨‍🏫 Giáo viên' : '🎓 Học sinh'}
            </Badge>
          </div>
        </div>

        <Separator className="bg-slate-100 dark:bg-white/5" />

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold"><UserIcon className="w-4 h-4 text-slate-400" /> Họ và tên</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập họ và tên" className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 px-5 text-base font-medium rounded-[16px] focus-visible:ring-fuchsia-500" />
          </div>

          <div className="space-y-2.5">
            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold"><Mail className="w-4 h-4 text-slate-400" /> Email</Label>
            <Input value={user.email} disabled className="opacity-70 bg-slate-100 dark:bg-black/20 border-transparent h-12 px-5 text-base font-medium rounded-[16px]" />
            <p className="text-xs text-slate-500 font-medium px-1">Email không thể thay đổi</p>
          </div>

          <div className="space-y-2.5">
            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold"><Phone className="w-4 h-4 text-slate-400" /> Số điện thoại</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0901234567" className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 px-5 text-base font-medium rounded-[16px] focus-visible:ring-fuchsia-500" />
          </div>

          <div className="space-y-2.5">
            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold"><CalendarDays className="w-4 h-4 text-slate-400" /> Ngày sinh</Label>
            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 px-5 text-base font-medium rounded-[16px] focus-visible:ring-fuchsia-500" />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end">
          <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto min-w-[140px] h-12 rounded-[16px] bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-bold text-base shadow-lg shadow-fuchsia-500/25 hover:opacity-90">
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
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
      <Card className="rounded-2xl md:rounded-[32px] border-slate-200 dark:border-white/10 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-white/5 mb-6">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl font-bold text-[#1e1b4b] dark:text-white">
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-fuchsia-500" /> Đổi mật khẩu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-4 md:px-8 pb-8">
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

          <div className="space-y-2.5">
            <Label className="text-slate-700 dark:text-slate-300 font-semibold">Mật khẩu cũ</Label>
            <div className="relative">
              <Input type={showOld ? 'text' : 'password'} value={oldPass} onChange={(e) => setOldPass(e.target.value)} placeholder="Nhập mật khẩu cũ" className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 px-5 text-base font-medium rounded-[16px] focus-visible:ring-fuchsia-500" />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowOld(!showOld)}>
                {showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <Label className="text-slate-700 dark:text-slate-300 font-semibold">Mật khẩu mới</Label>
            <div className="relative">
              <Input type={showNew ? 'text' : 'password'} value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)" className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 px-5 text-base font-medium rounded-[16px] focus-visible:ring-fuchsia-500" />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <Label className="text-slate-700 dark:text-slate-300 font-semibold">Xác nhận mật khẩu mới</Label>
            <Input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Nhập lại mật khẩu mới" className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 px-5 text-base font-medium rounded-[16px] focus-visible:ring-fuchsia-500" />
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={handleChangePassword} disabled={saving || !oldPass || !newPass || !confirmPass} className="w-full md:w-auto min-w-[140px] h-12 rounded-[16px] bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-bold text-base shadow-lg shadow-fuchsia-500/25 hover:opacity-90">
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Shield className="w-5 h-5 mr-2" />}
              {saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </Button>
          </div>
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
