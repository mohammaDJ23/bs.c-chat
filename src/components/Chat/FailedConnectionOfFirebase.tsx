import { Box, Typography } from '@mui/material';
import { FC } from 'react';

const FailedConnectionOfFirebase: FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        textAlign: 'center',
        padding: '26px 16px',
      }}
    >
      <Typography fontSize={'16px'} fontWeight={'500'}>
        You can not connect to the firebase apis.
      </Typography>
    </Box>
  );
};

export default FailedConnectionOfFirebase;
