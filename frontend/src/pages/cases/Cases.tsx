import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CaseCard from '@/components/cases/CaseCard';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Pagination from '@/components/common/Pagination';
import PageHeader from '@/components/common/PageHeader';
import { useGetCases } from '@/hooks/useCases';
import { CasePriority, CaseStatus } from '@/types';

const Cases = (): JSX.Element => {
  const nav = useNavigate();
  const [status, setStatus] = useState<CaseStatus | ''>('');
  const [priority, setPriority] = useState<CasePriority | ''>('');
  const [page, setPage] = useState(1);
  const q = useGetCases({ page, limit: 10, status: status || undefined, priority: priority || undefined });

  return (
    <>
      <PageHeader title="My Cases" action={<Button variant="contained" onClick={() => nav('/cases/new')}>Create New Case</Button>} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value as CaseStatus | '')}><MenuItem value="">All</MenuItem>{['New','Open','Pending','Resolved','Closed'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField>
        <TextField select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as CasePriority | '')}><MenuItem value="">All</MenuItem>{['Low','Medium','High','Critical'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField>
      </Stack>
      {q.isLoading ? <LoadingSpinner /> : (q.data?.data.length ? <Grid container spacing={2}>{q.data.data.map((item) => <Grid item xs={12} key={item._id}><CaseCard item={item} /></Grid>)}</Grid> : <EmptyState title="No cases found" />)}
      {q.data?.pagination && <Pagination page={page} pages={q.data.pagination.pages} onChange={setPage} />}
    </>
  );
};

export default Cases;
