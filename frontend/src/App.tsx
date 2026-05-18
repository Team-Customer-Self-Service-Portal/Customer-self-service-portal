import { Box, Container } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from '@mui/material/styles';
import Navbar from '@/components/common/Navbar';
import Sidebar, { DesktopSidebar } from '@/components/common/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import UserManagement from '@/pages/admin/UserManagement';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import CaseDetail from '@/pages/cases/CaseDetail';
import Cases from '@/pages/cases/Cases';
import CreateCase from '@/pages/cases/CreateCase';
import Community from '@/pages/community/Community';
import CreatePost from '@/pages/community/CreatePost';
import PostView from '@/pages/community/PostView';
import Dashboard from '@/pages/dashboard/Dashboard';
import ArticleView from '@/pages/knowledge/ArticleView';
import KnowledgeBase from '@/pages/knowledge/KnowledgeBase';
import Profile from '@/pages/profile/Profile';
import { store } from '@/store';
import { theme } from '@/styles/theme';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/globals.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 300000, retry: 1 } } });

const Layout = ({ children }: { children: JSX.Element }): JSX.Element => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <>
      <Navbar onMenuToggle={() => setOpen((o) => !o)} />
      <Sidebar open={open} onClose={() => setOpen(false)} user={user} />
      <DesktopSidebar user={user} />
      <Box sx={{ ml: { md: '240px' }, py: 3 }}>
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </>
  );
};

const NotFound = (): JSX.Element => <Container sx={{ py: 6 }}>404 - Page Not Found</Container>;

const AppRoutes = (): JSX.Element => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
    <Route path="/cases" element={<ProtectedRoute><Layout><Cases /></Layout></ProtectedRoute>} />
    <Route path="/cases/new" element={<ProtectedRoute><Layout><CreateCase /></Layout></ProtectedRoute>} />
    <Route path="/cases/:id" element={<ProtectedRoute><Layout><CaseDetail /></Layout></ProtectedRoute>} />
    <Route path="/knowledge" element={<ProtectedRoute><Layout><KnowledgeBase /></Layout></ProtectedRoute>} />
    <Route path="/knowledge/:id" element={<ProtectedRoute><Layout><ArticleView /></Layout></ProtectedRoute>} />
    <Route path="/community" element={<ProtectedRoute><Layout><Community /></Layout></ProtectedRoute>} />
    <Route path="/community/new" element={<ProtectedRoute><Layout><CreatePost /></Layout></ProtectedRoute>} />
    <Route path="/community/:id" element={<ProtectedRoute><Layout><PostView /></Layout></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute role="admin"><Layout><UserManagement /></Layout></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = (): JSX.Element => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
