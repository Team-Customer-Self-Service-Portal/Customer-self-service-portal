import { List, ListItem, ListItemText } from '@mui/material';
import { CaseComment } from '@/types';
import { formatDateTime } from '@/utils/formatters';

const CaseCommentList = ({ comments }: { comments: CaseComment[] }): JSX.Element => (
  <List>
    {comments.map((comment) => (
      <ListItem key={comment._id} divider>
        <ListItemText primary={comment.text} secondary={formatDateTime(comment.createdAt)} />
      </ListItem>
    ))}
  </List>
);

export default CaseCommentList;
