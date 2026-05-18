import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Avatar, Box, Chip, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME } from '@/utils/constants';

interface Props { onMenuToggle: () => void }

const Navbar = ({ onMenuToggle }: Props): JSX.Element => {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <AppBar position="sticky" color="inherit" elevation={1}>
      <Toolbar>
        <IconButton edge="start" onClick={onMenuToggle} sx={{ mr: 1, display: { md: 'none' } }}><MenuIcon /></IconButton>
        <Typography variant="h6" fontWeight={700} flexGrow={1}>{APP_NAME}</Typography>
        {user && (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography>{user.firstName} {user.lastName}</Typography>
            <Chip size="small" label={user.role} color="primary" variant="outlined" />
            <IconButton onClick={(e) => setAnchor(e.currentTarget)}><Avatar>{user.firstName[0]}</Avatar></IconButton>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
              <MenuItem onClick={() => { setAnchor(null); nav('/profile'); }}>Profile</MenuItem>
              <MenuItem onClick={() => { setAnchor(null); nav('/profile'); }}>Change Password</MenuItem>
              <MenuItem onClick={() => { setAnchor(null); void logout(); }}>Logout</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
