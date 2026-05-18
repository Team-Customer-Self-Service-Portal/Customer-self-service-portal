import { Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { useParams } from 'react-router-dom';
import CaseCommentList from '@/components/cases/CaseCommentList';
import CasePriorityBadge from '@/components/cases/CasePriorityBadge';
import CaseStatusBadge from '@/components/cases/CaseStatusBadge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useAddComment, useGetCase, useUpdateCase } from '@/hooks/useCases';

const CaseDetail = (): JSX.Element => {
  const { id = '' } = useParams();
  const { isAgent } = useAuth();
  const q = useGetCase(id);
  const addComment = useAddComment();
  const update = useUpdateCase();

  if (q.isLoading || !q.data) return <LoadingSpinner />;

  return (
    <Stack spacing={2}>
      <Card><CardContent>
        <Typography variant="h5">{q.data.caseNumber} - {q.data.subject}</Typography>
        <Stack direction="row" spacing={1} my={1}><CaseStatusBadge status={q.data.status} /><CasePriorityBadge priority={q.data.priority} /></Stack>
        <Typography>{q.data.description}</Typography>
      </CardContent></Card>

      {isAgent && (
        <Card><CardContent>
          <Formik initialValues={{ status: q.data.status, priority: q.data.priority }} onSubmit={async (values) => update.mutateAsync({ id, data: values })}>
            {({ values, handleChange }) => <Form><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField select name="status" value={values.status} onChange={handleChange}>{['New','Open','Pending','Resolved','Closed'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField><TextField select name="priority" value={values.priority} onChange={handleChange}>{['Low','Medium','High','Critical'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField><Button type="submit" variant="contained">Update</Button></Stack></Form>}
          </Formik>
        </CardContent></Card>
      )}

      <Card><CardContent>
        <Typography variant="h6">Comments</Typography>
        <CaseCommentList comments={q.data.comments} />
        <Formik initialValues={{ text: '' }} onSubmit={async (v, { resetForm }) => { await addComment.mutateAsync({ caseId: id, text: v.text }); resetForm(); }}>
          {({ values, handleChange }) => <Form><Stack direction="row" spacing={1} mt={2}><TextField name="text" value={values.text} onChange={handleChange} label="Add comment" /><Button type="submit" variant="contained">Post</Button></Stack></Form>}
        </Formik>
      </CardContent></Card>
    </Stack>
  );
};

export default CaseDetail;
