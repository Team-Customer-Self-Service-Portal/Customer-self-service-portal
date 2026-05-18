import { Chip } from '@mui/material';
import { CasePriority } from '@/types';

const colors: Record<CasePriority, 'default' | 'info' | 'warning' | 'error'> = {
  Low: 'default',
  Medium: 'info',
  High: 'warning',
  Critical: 'error',
};

const CasePriorityBadge = ({ priority }: { priority: CasePriority }): JSX.Element => <Chip size="small" label={priority} color={colors[priority]} />;
export default CasePriorityBadge;
