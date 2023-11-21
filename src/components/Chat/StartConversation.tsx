import { Box, Button, Typography, styled } from '@mui/material';
import { ModalNames } from '../../store';
import { useAction } from '../../hooks';

const StartConversationButtonWrapper = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'block',
  },
}));

const StartConversation = () => {
  const actions = useAction();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        gap: '8px',
      }}
    >
      <Box>
        <Typography fontSize={'14px'} fontWeight={'500'}>
          Start a new conversation
        </Typography>

        <Box sx={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <StartConversationButtonWrapper>
            <Button
              onClick={() => actions.showModal(ModalNames.CONVERSATION)}
              sx={{ textTransform: 'capitalize' }}
              size="small"
              variant="contained"
            >
              Start
            </Button>
          </StartConversationButtonWrapper>
        </Box>
      </Box>
    </Box>
  );
};

export default StartConversation;
