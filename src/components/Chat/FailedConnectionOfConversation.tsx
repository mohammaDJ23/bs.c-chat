import { Box, Typography } from '@mui/material';
import { FC } from 'react';

const FailedConnectionOfConversation: FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        textAlign: 'center',
        padding: '26px 16px',
      }}
    >
      <Typography fontSize={'16px'} fontWeight={'500'}>
        You are not able to use the conversation.
      </Typography>
    </Box>
  );
};

export default FailedConnectionOfConversation;
