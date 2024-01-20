import { Box, styled } from '@mui/material';
import { FC } from 'react';
import UsersSkeleton from './UsersSkeleton';
import MessagesSkeleton from './MessagesSkeleton';

const SkeletonWrapper = styled(Box)(({ theme }) => ({
  height: 'calc(100vh - 64px)',
  width: '100%',
  display: 'flex',
  alignItems: 'stretch',
  [theme.breakpoints.down('md')]: {
    height: 'calc(100vh - 64px)',
  },
  [theme.breakpoints.down('sm')]: {
    height: 'calc(100vh - 48px)',
  },
}));

const UsersSkeletonWrapper = styled(Box)(({ theme }) => ({
  height: '100%',
  padding: '16px',
  width: '280px',
  borderRight: '1px solid #e0e0e0',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const MessagesSkeletonWrapper = styled(Box)(({ theme }) => ({
  padding: '16px',
  width: 'calc(100% - 280px)',
  height: '100%',
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
