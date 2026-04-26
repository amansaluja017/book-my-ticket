import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SeatsPage from './pages/SeatsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NewPasswordPage from './pages/NewPasswordPage';
import ProfilePage from './pages/ProfilePage';
import VerificationPage from './pages/VerificationPage';
import PaymentPage from './pages/PaymentPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPanelPage from './pages/AdminPanelPage';
import AdminScreenShowsPage from './pages/AdminScreenShowsPage';
import Protected from './components/Protected';
import UserProtected from './components/UserProtected';
import CustomerTicketsPage from './pages/CustomerTicketsPage';
import CallbackLogin from './pages/CallbackLogin';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Routes>
        <Route path="/" element={<UserProtected><HomePage /></UserProtected>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/callback/oauth/login" element={<CallbackLogin />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verification/:token" element={<VerificationPage />} />
        <Route path="/reset-password/:token" element={<NewPasswordPage />} />
        <Route path="/profile" element={<UserProtected><ProfilePage /></UserProtected>} />
        <Route path="/payment" element={<UserProtected><PaymentPage /></UserProtected>} />
        <Route path="/tickets/:paymentId" element={<UserProtected><CustomerTicketsPage /></UserProtected>} />
        <Route path="/shows/:showId" element={<SeatsPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<Protected><AdminPanelPage /></Protected>} />
        <Route path="/admin/screens/:screenId/shows" element={<Protected><AdminScreenShowsPage /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
