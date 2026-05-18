import { Chip } from '@mui/material';
import { CaseStatus } from '@/types';

const colors: Record<CaseStatus, 'default' | 'info' | 'warning' | 'success'> = {
  New: 'default',
  Open: 'info',
  Pending: 'warning',
  Resolved: 'success',
  Closed: 'default',
};

const CaseStatusBadge = ({ status }: { status: CaseStatus }): JSX.Element => <Chip size="small" label={status} color={colors[status]} />;
export default CaseStatusBadge;
