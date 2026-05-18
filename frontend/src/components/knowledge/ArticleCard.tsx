import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Article } from '@/types';

const ArticleCard = ({ article }: { article: Article }): JSX.Element => (
  <Card component={Link} to={`/knowledge/${article._id}`}>
    <CardContent>
      <Typography fontWeight={700}>{article.title}</Typography>
      <Typography color="text.secondary" mb={1}>{article.summary}</Typography>
      <Stack direction="row" justifyContent="space-between">
        <Chip size="small" label={article.category} />
        <Typography variant="body2">Views: {article.viewCount}</Typography>
      </Stack>
    </CardContent>
  </Card>
);

export default ArticleCard;
