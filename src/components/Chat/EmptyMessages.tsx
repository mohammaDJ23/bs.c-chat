import { Box, Typography } from '@mui/material';

const EmptyMessages = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <Typography fontSize={'14px'} fontWeight={'500'}>
        Empy messages
      </Typography>
    </Box>
  );
};

export default EmptyMessages;
