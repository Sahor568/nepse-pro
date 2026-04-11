import { useState } from 'react';
import { User, Mail, Phone, Lock, Save, Eye, EyeOff, Shield, Bell, Monitor, Moon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const stored: any = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const [profile, setProfile] = useState({ name: stored?.name || 'John Doe', email: stored?.email || 'john@example.com', mobile: '9812345678', bio: 'Active NEPSE trader since 2019.' });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [notifs, setNotifs] = useState({ priceAlerts: true, newsAlerts: false, portfolioSummary: true });

  const initials = profile.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const saveProfile = () => {
    localStorage.setItem('user', JSON.stringify({ name: profile.name, email: profile.email }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Section = ({ title, children }: any) => (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <div className="card-header"><h2 className="card-title">{title}</h2></div>
      <div style={{ padding: '1.25rem' }}>{children}</div>
    </div>
  );

  const Field = ({ label, children }: any) => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '.4rem', fontSize: '.7rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '.07em' }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ padding: '1.5rem', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Profile & Settings</h1>
        {saved && (
          <div className="animate-fadeIn" style={{ padding: '.4rem .9rem', borderRadius: '.4rem', background: 'rgba(8,153,129,.12)', border: '1px solid rgba(8,153,129,.3)', color: 'var(--color-green)', fontSize: '.78rem', fontWeight: 600 }}>
            ✓ Saved successfully
          </div>
        )}
      </div>

      {/* Avatar + basic info */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-blue), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem', color: '#fff', flexShrink: 0, boxShadow: '0 4px 20px rgba(41,98,255,.4)' }}>
          {initials}
        </div>
        <div>
          <p style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{profile.name}</p>
          <p style={{ fontSize: '.8rem', color: 'var(--color-muted)' }}>{profile.email}</p>
          <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
            <span style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--color-green)', background: 'rgba(8,153,129,.1)', border: '1px solid rgba(8,153,129,.2)', padding: '.15rem .5rem', borderRadius: 99 }}>★ Pro Trader</span>
            <span style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--color-blue)', background: 'rgba(41,98,255,.1)', border: '1px solid rgba(41,98,255,.2)', padding: '.15rem .5rem', borderRadius: 99 }}>Nepal</span>
          </div>
        </div>
        <button onClick={() => navigate('/login')} className="btn btn-danger" style={{ marginLeft: 'auto', gap: '.4rem' }}>
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Personal Info */}
      <Section title={<><User className="w-4 h-4" style={{ color: 'var(--color-blue)' }} /> Personal Information</>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Full Name">
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '.65rem', top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--color-muted)', pointerEvents: 'none' }} />
              <input className="input" style={{ paddingLeft: '2rem' }} value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
            </div>
          </Field>
          <Field label="Email Address">
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '.65rem', top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--color-muted)', pointerEvents: 'none' }} />
              <input className="input" style={{ paddingLeft: '2rem' }} value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
            </div>
          </Field>
          <Field label="Mobile (+977)">
            <div style={{ position: 'relative' }}>
              <Phone style={{ position: 'absolute', left: '.65rem', top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--color-muted)', pointerEvents: 'none' }} />
              <input className="input" style={{ paddingLeft: '2rem' }} value={profile.mobile} onChange={e => setProfile({ ...profile, mobile: e.target.value })} />
            </div>
          </Field>
          <Field label="About / Bio">
            <input className="input" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell us about yourself" />
          </Field>
        </div>
        <button onClick={saveProfile} className="btn btn-primary" style={{ marginTop: '.5rem', gap: '.4rem' }}>
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </Section>

      {/* Password */}
      <Section title={<><Lock className="w-4 h-4" style={{ color: 'var(--color-gold)' }} /> Change Password</>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          {(['Current Password', 'New Password', 'Confirm New'] as const).map((label, idx) => {
            const key = ['current', 'next', 'confirm'][idx] as 'current' | 'next' | 'confirm';
            return (
              <Field key={key} label={label}>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '.65rem', top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--color-muted)', pointerEvents: 'none' }} />
                  <input className="input" style={{ paddingLeft: '2rem', paddingRight: idx === 0 ? '2rem' : '.75rem' }}
                    type={showPw ? 'text' : 'password'} placeholder="••••••••"
                    value={pwForm[key]} onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })} />
                  {idx === 0 && (
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ position: 'absolute', right: '.65rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                      {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </Field>
            );
          })}
        </div>
        <button className="btn btn-ghost" style={{ marginTop: '.25rem', gap: '.4rem' }}>
          <Shield className="w-4 h-4" /> Update Password
        </button>
      </Section>

      {/* Notifications */}
      <Section title={<><Bell className="w-4 h-4" style={{ color: 'var(--color-green)' }} /> Notifications</>}>
        {([
          ['priceAlerts', 'Price Alerts', 'Get notified when watched stocks hit target prices'],
          ['newsAlerts', 'Market News', 'Receive news alerts for NEPSE market events'],
          ['portfolioSummary', 'Daily Portfolio Summary', 'Get a daily summary of your portfolio performance'],
        ] as const).map(([key, label, desc]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '.85rem', color: '#fff', marginBottom: '.2rem' }}>{label}</p>
              <p style={{ fontSize: '.75rem', color: 'var(--color-muted)' }}>{desc}</p>
            </div>
            <button onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
              style={{ width: 42, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', transition: 'background .2s', position: 'relative', background: notifs[key] ? 'var(--color-green)' : 'var(--color-border)', flexShrink: 0 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: notifs[key] ? 21 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.4)' }} />
            </button>
          </div>
        ))}
      </Section>

      {/* Appearance */}
      <Section title={<><Monitor className="w-4 h-4" style={{ color: 'var(--color-blue)' }} /> Appearance</>}>
        <div style={{ display: 'flex', gap: '.75rem' }}>
          {['dark', 'light'].map(t => (
            <button key={t} onClick={() => setTheme(t)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem', padding: '1rem 1.5rem', borderRadius: '.6rem', cursor: 'pointer', border: `2px solid ${theme === t ? 'var(--color-blue)' : 'var(--color-border)'}`, background: theme === t ? 'rgba(41,98,255,.08)' : 'var(--color-panel)', color: theme === t ? 'var(--color-blue)' : 'var(--color-muted)', transition: 'all .15s' }}>
              <Moon className="w-5 h-5" />
              <span style={{ fontSize: '.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{t} Mode</span>
              {theme === t && <span style={{ fontSize: '.65rem', color: 'var(--color-green)' }}>✓ Active</span>}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default Profile;
