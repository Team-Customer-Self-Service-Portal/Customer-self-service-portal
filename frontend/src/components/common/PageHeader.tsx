import { Box, Typography } from '@mui/material';

interface Props { title: string; subtitle?: string; action?: JSX.Element }

const PageHeader = ({ title, subtitle, action }: Props): JSX.Element => (
  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
    <Box>
      <Typography variant="h5" fontWeight={700}>{title}</Typography>
      {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
    </Box>
    {action}
  </Box>
);

export default PageHeader;
