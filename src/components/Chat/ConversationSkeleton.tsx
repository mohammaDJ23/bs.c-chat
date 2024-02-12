import { Box, styled } from '@mui/material';
import { FC } from 'react';
import UsersSkeleton from './UsersSkeleton';
import MessagesSkeleton from './MessagesSkeleton';

const SkeletonWrapper = styled(Box)(({ theme }) => ({
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  overflow: 'hidden',
}));

const UsersSkeletonWrapper = styled(Box)(({ theme }) => ({
  height: '100%',
  padding: '16px',
  width: '280px',
  borderRight: '1px solid #e0e0e0',
  flexShrink: '0',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const MessagesSkeletonWrapper = styled(Box)(({ theme }) => ({
  padding: '16px',
  width: 'calc(100% - 280px)',
  height: '100%',
  flexShrink: '1',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

const ConversationSkeleton: FC = () => {
  return (
    <SkeletonWrapper>
      <UsersSkeletonWrapper>
        <UsersSkeleton />
      </UsersSkeletonWrapper>
      <MessagesSkeletonWrapper>
        <MessagesSkeleton />
      </MessagesSkeletonWrapper>
    </SkeletonWrapper>
  );
};

export default ConversationSkeleton;
