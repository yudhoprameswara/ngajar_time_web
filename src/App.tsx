import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { SplashScreen } from './components/auth/SplashScreen';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { ProfileSheet } from './components/auth/ProfileSheet';
import { EditProfileModal } from './components/auth/EditProfileModal';
import { MobileContainer } from './components/layout/MobileContainer';
import { AppBar } from './components/layout/AppBar';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardTab } from './components/home/DashboardTab';
import { StudentsTab } from './components/students/StudentsTab';
import { ReportsTab } from './components/reports/ReportsTab';
import { AddSessionModal } from './components/sessions/AddSessionModal';
import { AddStudentModal } from './components/students/AddStudentModal';
import { SessionModel } from './types';

export const App: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Navigation state
  const [activeTab, setActiveTab] = useState(0);

  // Modals state
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionModel | null>(null);

  // 1. Show Splash Screen first
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. Loading state after splash
  if (loading) {
    return (
      <div className="w-full h-screen bg-slate-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 3. Not logged in -> Show Login or Register
  if (!currentUser) {
    if (authView === 'login') {
      return <LoginModal onSwitchToRegister={() => setAuthView('register')} />;
    } else {
      return <RegisterModal onBackToLogin={() => setAuthView('login')} />;
    }
  }

  // 4. Logged in -> Show Mobile Container with Tabs
  return (
    <MobileContainer>
      {/* Top App Bar */}
      <AppBar
        activeTab={activeTab}
        onOpenProfile={() => setShowProfileSheet(true)}
      />

      {/* Main Tab Views */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 0 && (
          <DashboardTab
            onOpenAddSession={() => {
              setEditingSession(null);
              setShowAddSession(true);
            }}
            onOpenAddStudent={() => setShowAddStudent(true)}
            onEditSession={(s) => {
              setEditingSession(s);
              setShowAddSession(true);
            }}
          />
        )}

        {activeTab === 1 && <StudentsTab />}

        {activeTab === 2 && <ReportsTab />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Profile & Edit Profile Sheets */}
      <ProfileSheet
        isOpen={showProfileSheet}
        onClose={() => setShowProfileSheet(false)}
        onOpenEditProfile={() => setShowEditProfile(true)}
      />

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />

      {/* Add / Edit Session Modal */}
      <AddSessionModal
        isOpen={showAddSession}
        sessionToEdit={editingSession}
        onClose={() => {
          setShowAddSession(false);
          setEditingSession(null);
        }}
      />

      {/* Add Student Modal from Dashboard */}
      <AddStudentModal
        isOpen={showAddStudent}
        onClose={() => setShowAddStudent(false)}
      />
    </MobileContainer>
  );
};

export default App;
