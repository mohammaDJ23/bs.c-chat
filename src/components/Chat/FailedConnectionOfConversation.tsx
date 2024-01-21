import { Box, Button, Typography } from '@mui/material';
import { FC } from 'react';

const FailedConnectionOfConversation: FC = () => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        width: '100%',
        height: '100%',
        paddingTop: '50px',
      }}
    >
      <Box>
        <Typography fontSize={'16px'} fontWeight={'500'}>
          You are not able to use the conversation.
        </Typography>

        <Box sx={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Button
            onClick={() => window.location.reload()}
            sx={{ textTransform: 'capitalize' }}
            size="small"
            variant="contained"
          >
            Reload
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default FailedConnectionOfConversation;
