import { Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '@/components/community/PostCard';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Pagination from '@/components/common/Pagination';
import { useGetPosts } from '@/hooks/useCommunity';

const Community = (): JSX.Element => {
  const nav = useNavigate();
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const q = useGetPosts({ category: category || undefined, status: status as 'open' | 'answered' | 'closed' | undefined, page, limit: 10 });

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}><MenuItem value="">All</MenuItem>{['Technical','Billing','Account','General'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField>
        <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><MenuItem value="">All</MenuItem>{['open','answered','closed'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField>
        <Button variant="contained" onClick={() => nav('/community/new')}>Ask a Question</Button>
      </Stack>
      {q.isLoading ? <LoadingSpinner /> : q.data?.data.length ? <Grid container spacing={2}>{q.data.data.map((p) => <Grid item xs={12} key={p._id}><PostCard post={p} /></Grid>)}</Grid> : <EmptyState title="No posts yet" />}
      {q.data?.pagination && <Pagination page={page} pages={q.data.pagination.pages} onChange={setPage} />}
    </>
  );
};

export default Community;
