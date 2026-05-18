import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Post } from '@/types';

const PostCard = ({ post }: { post: Post }): JSX.Element => (
  <Card component={Link} to={`/community/${post._id}`}>
    <CardContent>
      <Typography fontWeight={700}>{post.title}</Typography>
      <Typography color="text.secondary" mb={1}>{post.category}</Typography>
      <Stack direction="row" justifyContent="space-between">
        <Chip size="small" label={post.status} />
        <Typography variant="body2">{post.upvotes.length} upvotes • {post.comments.length} comments</Typography>
      </Stack>
    </CardContent>
  </Card>
);

export default PostCard;
