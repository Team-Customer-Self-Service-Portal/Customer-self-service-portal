import { Card, CardContent, Grid, Link as MuiLink, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useGetCases } from '@/hooks/useCases';
import { useGetArticles } from '@/hooks/useKnowledge';
import { useGetPosts } from '@/hooks/useCommunity';

const Dashboard = (): JSX.Element => {
  const casesQ = useGetCases({ page: 1, limit: 20 });
  const articlesQ = useGetArticles({ page: 1, limit: 3 });
  const postsQ = useGetPosts({ page: 1, limit: 3 });

  if (casesQ.isLoading || articlesQ.isLoading || postsQ.isLoading) return <LoadingSpinner />;

  const total = casesQ.data?.pagination.total || 0;
  const open = casesQ.data?.data.filter((c) => c.status === 'Open').length || 0;

  return (
    <>
      <PageHeader title="Dashboard" />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}><Card><CardContent><Typography>Total Cases</Typography><Typography variant="h4">{total}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card><CardContent><Typography>Open Cases</Typography><Typography variant="h4">{open}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Recent Cases</Typography><Stack>{(casesQ.data?.data || []).slice(0,5).map((c) => <MuiLink key={c._id} component={Link} to={`/cases/${c._id}`}>{c.subject}</MuiLink>)}</Stack></CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Recent Articles</Typography><Stack>{(articlesQ.data?.data || []).map((a) => <MuiLink key={a._id} component={Link} to={`/knowledge/${a._id}`}>{a.title}</MuiLink>)}</Stack></CardContent></Card></Grid>
        <Grid item xs={12}><Card><CardContent><Typography variant="h6">Recent Community Posts</Typography><Stack>{(postsQ.data?.data || []).map((p) => <MuiLink key={p._id} component={Link} to={`/community/${p._id}`}>{p.title}</MuiLink>)}</Stack></CardContent></Card></Grid>
      </Grid>
    </>
  );
};

export default Dashboard;
