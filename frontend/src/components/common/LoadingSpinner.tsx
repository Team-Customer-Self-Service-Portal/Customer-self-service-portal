import { Box, CircularProgress } from '@mui/material';

const LoadingSpinner = (): JSX.Element => (
  <Box display="flex" justifyContent="center" py={4}>
    <CircularProgress />
  </Box>
);

export default LoadingSpinner;
