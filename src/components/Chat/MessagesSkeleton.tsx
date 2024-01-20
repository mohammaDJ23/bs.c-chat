import { FC } from 'react';
import Skeleton from './Skeleton';
import { Box } from '@mui/material';

const MessagesSkeleton: FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'start',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        gap: '40px',
        height: '100%',
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Skeleton width={'100%'} height={'50px'} />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'start',
          flexDirection: 'column',
          gap: '20px',
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '30px',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              width: '100%',
            }}
          >
            <Skeleton sx={{ maxWidth: '600px', height: '20px' }} />
            <Skeleton sx={{ maxWidth: '150px', height: '20px' }} />
            <Skeleton sx={{ maxWidth: '400px', height: '20px' }} />
            <Skeleton sx={{ maxWidth: '700px', height: '20px' }} />
            <Skeleton sx={{ maxWidth: '250px', height: '20px' }} />
            <Skeleton sx={{ maxWidth: '220px', height: '20px' }} />
          </Box>
        </Box>

        <Box sx={{ width: '100%' }}>
          <Skeleton width={'100%'} height={'70px'} />
        </Box>
      </Box>
    </Box>
  );
};

export default MessagesSkeleton;
