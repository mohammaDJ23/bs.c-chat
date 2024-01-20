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
      }}
    >
      <Skeleton width={'100%'} height={'80px'} />
      <Skeleton width={'100%'} height={'80px'} />
      <Skeleton width={'100%'} height={'80px'} />
      <Skeleton width={'100%'} height={'80px'} />
      <Skeleton width={'100%'} height={'80px'} />
      <Skeleton width={'100%'} height={'80px'} />
      <Skeleton width={'100%'} height={'80px'} />
      <Skeleton width={'100%'} height={'80px'} />
      <Skeleton width={'100%'} height={'80px'} />
      <Skeleton width={'100%'} height={'80px'} />
      <Skeleton width={'100%'} height={'80px'} />
    </Box>
  );
};

export default UsersSkeleton;
