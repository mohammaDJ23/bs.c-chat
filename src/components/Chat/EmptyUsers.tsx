import { Box, Typography } from '@mui/material';

const EmptyUsers = () => {
  return (
    <Box
      component={'div'}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: '8px 16px',
      }}
    >
      <Typography component={'p'} sx={{ fontSize: '14px', fontWeight: '500' }}>
        Empty Users
      </Typography>
    </Box>
  );
};

export default EmptyUsers;
