import { Box, Pagination as MuiPagination } from '@mui/material';

interface Props { page: number; pages: number; onChange: (page: number) => void }

const Pagination = ({ page, pages, onChange }: Props): JSX.Element => (
  <Box display="flex" justifyContent="center" py={2}>
    <MuiPagination page={page} count={pages || 1} onChange={(_, p) => onChange(p)} color="primary" />
  </Box>
);

export default Pagination;
