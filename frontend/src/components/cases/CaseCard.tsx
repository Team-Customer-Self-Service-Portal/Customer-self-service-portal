import { Card, CardContent, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Case } from '@/types';
import { formatDate } from '@/utils/formatters';
import CasePriorityBadge from './CasePriorityBadge';
import CaseStatusBadge from './CaseStatusBadge';

const CaseCard = ({ item }: { item: Case }): JSX.Element => (
  <Card component={Link} to={`/cases/${item._id}`}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography fontWeight={700}>{item.caseNumber}</Typography>
        <Stack direction="row" spacing={1}><CaseStatusBadge status={item.status} /><CasePriorityBadge priority={item.priority} /></Stack>
      </Stack>
      <Typography>{item.subject}</Typography>
      <Typography color="text.secondary" variant="body2">{formatDate(item.createdAt)}</Typography>
    </CardContent>
  </Card>
);

export default CaseCard;
