import { Box } from '@mui/material';
import { FC } from 'react';
import Skeleton from './Skeleton';

const UsersSkeleton: FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '10px',
        height: '100%',
      }}
    >
      <Skeleton sx={{ flexShrink: '0' }} width={'100%'} height={'80px'} />
      <Skeleton sx={{ flexShrink: '0' }} width={'100%'} height={'80px'} />
      <Skeleton sx={{ flexShrink: '0' }} width={'100%'} height={'80px'} />
      <Skeleton sx={{ flexShrink: '0' }} width={'100%'} height={'80px'} />
      <Skeleton sx={{ flexShrink: '0' }} width={'100%'} height={'80px'} />
      <Skeleton sx={{ flexShrink: '0' }} width={'100%'} height={'80px'} />
      <Skeleton sx={{ flexShrink: '0' }} width={'100%'} height={'80px'} />
      <Skeleton sx={{ flexShrink: '0' }} width={'100%'} height={'80px'} />
      <Skeleton sx={{ flexShrink: '0' }} width={'100%'} height={'80px'} />
      <Skeleton sx={{ flexShrink: '0' }} width={'100%'} height={'80px'} />
      <Skeleton sx={{ flexShrink: '0' }} width={'100%'} height={'80px'} />
    </Box>
  );
};

export default UsersSkeleton;
