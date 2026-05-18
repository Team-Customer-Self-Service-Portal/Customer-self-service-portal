import { Drawer, List, ListItemButton, ListItemText, Toolbar } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { User } from '@/types';

const width = 240;
interface Props { open: boolean; onClose: () => void; user: User | null }

const Sidebar = ({ open, onClose, user }: Props): JSX.Element => {
  const location = useLocation();
  const items = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'My Cases', to: '/cases' },
    { label: 'Knowledge Base', to: '/knowledge' },
    { label: 'Community', to: '/community' },
    ...(user?.role === 'admin' ? [{ label: 'Users', to: '/admin/users' }] : []),
  ];

  return (
    <Drawer open={open} onClose={onClose} variant="temporary" sx={{ display: { xs: 'block', md: 'none' } }}>
      <Toolbar />
      <List sx={{ width }}>
        {items.map((item) => (
          <ListItemButton key={item.to} component={Link} to={item.to} selected={location.pathname === item.to} onClick={onClose}>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export const DesktopSidebar = ({ user }: { user: User | null }): JSX.Element => {
  const location = useLocation();
  const items = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'My Cases', to: '/cases' },
    { label: 'Knowledge Base', to: '/knowledge' },
    { label: 'Community', to: '/community' },
    ...(user?.role === 'admin' ? [{ label: 'Users', to: '/admin/users' }] : []),
  ];
  return (
    <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width, top: 64 } }}>
      <List>
        {items.map((item) => (
          <ListItemButton key={item.to} component={Link} to={item.to} selected={location.pathname === item.to}>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
