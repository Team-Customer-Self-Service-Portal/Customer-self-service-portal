import { Box, Typography } from '@mui/material';

interface Props { title: string; description?: string }

const EmptyState = ({ title, description }: Props): JSX.Element => (
  <Box textAlign="center" py={6}>
    <Typography variant="h6">{title}</Typography>
    {description && <Typography color="text.secondary">{description}</Typography>}
  </Box>
);

export default EmptyState;
