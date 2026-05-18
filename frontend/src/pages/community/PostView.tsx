import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { useParams } from 'react-router-dom';
import CommentList from '@/components/community/CommentList';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useAddComment, useGetPost, useMarkAnswer, useToggleUpvote } from '@/hooks/useCommunity';

const PostView = (): JSX.Element => {
  const { id = '' } = useParams();
  const { isAgent } = useAuth();
  const q = useGetPost(id);
  const addComment = useAddComment();
  const upvote = useToggleUpvote();
  const mark = useMarkAnswer();

  if (q.isLoading || !q.data) return <LoadingSpinner />;

  return (
    <Stack spacing={2}>
      <Card><CardContent>
        <Typography variant="h5">{q.data.title}</Typography>
        <Typography>{q.data.body}</Typography>
        <Button startIcon={<ThumbUpIcon />} onClick={() => upvote.mutate(id)}>{q.data.upvotes.length} Upvotes</Button>
      </CardContent></Card>

      <Card><CardContent>
        <Typography variant="h6">Comments</Typography>
        <CommentList comments={q.data.comments} canMark={isAgent} onMark={(commentId) => mark.mutate({ postId: id, commentId })} />
        <Formik initialValues={{ body: '' }} onSubmit={async (values, { resetForm }) => { await addComment.mutateAsync({ postId: id, body: values.body }); resetForm(); }}>
          {({ values, handleChange }) => <Form><Stack direction="row" spacing={1}><TextField name="body" label="Add comment" value={values.body} onChange={handleChange} /><Button type="submit" variant="contained">Post</Button></Stack></Form>}
        </Formik>
      </CardContent></Card>
    </Stack>
  );
};

export default PostView;
