import { List, ListItem, ListItemText, Paper } from '@mui/material';
import { CommunityComment } from '@/types';
import { formatDateTime } from '@/utils/formatters';

interface Props {
  comments: CommunityComment[];
  canMark: boolean;
  onMark: (commentId: string) => void;
}

const CommentList = ({ comments, canMark, onMark }: Props): JSX.Element => (
  <List>
    {comments.map((c) => (
      <Paper key={c._id} sx={{ mb: 1, border: c.isAnswer ? '2px solid #4caf50' : undefined }}>
        <ListItem secondaryAction={canMark && !c.isAnswer ? <button onClick={() => onMark(c._id)}>Mark Answer</button> : undefined}>
          <ListItemText primary={c.body} secondary={formatDateTime(c.createdAt)} />
        </ListItem>
      </Paper>
    ))}
  </List>
);

export default CommentList;
