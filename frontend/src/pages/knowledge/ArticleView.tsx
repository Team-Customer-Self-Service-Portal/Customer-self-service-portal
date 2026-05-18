import { Card, CardContent, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import HelpfulVote from '@/components/knowledge/HelpfulVote';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useGetArticle, useGetArticles, useVoteHelpful } from '@/hooks/useKnowledge';
import { formatDate } from '@/utils/formatters';

const ArticleView = (): JSX.Element => {
  const { id = '' } = useParams();
  const q = useGetArticle(id);
  const vote = useVoteHelpful();
  const related = useGetArticles({ category: q.data?.category, page: 1, limit: 3 });

  if (q.isLoading || !q.data) return <LoadingSpinner />;

  return (
    <Stack spacing={2}>
      <Card><CardContent>
        <Typography variant="h4">{q.data.title}</Typography>
        <Typography color="text.secondary">Published: {q.data.publishedAt ? formatDate(q.data.publishedAt) : 'N/A'} • Views: {q.data.viewCount}</Typography>
        <Typography mt={2}>{q.data.body}</Typography>
        <Stack direction="row" spacing={2} mt={2}><HelpfulVote loading={vote.isPending} onVote={() => vote.mutate(id)} /><Typography>{q.data.helpful} found this helpful</Typography></Stack>
      </CardContent></Card>
      <Card><CardContent><Typography variant="h6">Related Articles</Typography>{(related.data?.data || []).filter((a) => a._id !== id).map((a) => <Typography key={a._id}>{a.title}</Typography>)}</CardContent></Card>
    </Stack>
  );
};

export default ArticleView;
