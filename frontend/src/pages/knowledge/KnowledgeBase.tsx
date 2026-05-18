import { Grid, Stack, Tab, Tabs, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import ArticleCard from '@/components/knowledge/ArticleCard';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Pagination from '@/components/common/Pagination';
import { useGetArticles } from '@/hooks/useKnowledge';

const KnowledgeBase = (): JSX.Element => {
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => { const t = setTimeout(() => setQ(input), 300); return () => clearTimeout(t); }, [input]);

  const query = useGetArticles({ q, category: category || undefined, page, limit: 9 });

  if (query.isLoading) return <LoadingSpinner />;

  return (
    <>
      <Stack spacing={2} mb={2}>
        <TextField label="Search articles" value={input} onChange={(e) => setInput(e.target.value)} />
        <Tabs value={category} onChange={(_, v) => setCategory(v)}><Tab label="All" value="" />{['Technical','Billing','Account','General'].map((c) => <Tab key={c} label={c} value={c} />)}</Tabs>
      </Stack>
      {query.data?.data.length ? <Grid container spacing={2}>{query.data.data.map((a) => <Grid item xs={12} sm={6} md={4} key={a._id}><ArticleCard article={a} /></Grid>)}</Grid> : <EmptyState title="No articles found" />}
      {query.data?.pagination && <Pagination page={page} pages={query.data.pagination.pages} onChange={setPage} />}
    </>
  );
};

export default KnowledgeBase;
