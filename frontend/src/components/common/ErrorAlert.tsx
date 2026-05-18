import { Alert } from '@mui/material';

interface Props {
  message: string;
}

const ErrorAlert = ({ message }: Props): JSX.Element => <Alert severity="error">{message}</Alert>;

export default ErrorAlert;
