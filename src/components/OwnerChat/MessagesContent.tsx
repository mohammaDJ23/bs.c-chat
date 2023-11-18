import { FC, useCallback, useState, useEffect } from 'react';
import { Box, TextField as TF, styled, Menu, MenuItem, Drawer } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import Users from './Users';
import MessageCard from './MessageCard';
import { MessageObj } from '../../store';
import EmptyMessages from './EmptyMessages';

const TextField = styled(TF)(({ theme }) => ({
  '.css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input': {
    border: 'none',
    padding: '14px',
    fontSize: '14px',
    letterSpacing: '0.3px',
  },
  '.css-1d3z3hw-MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

const MenuIconWrapper = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'block',
  },
}));

const FormWrapper = styled(Box)(({ theme }) => ({
  position: 'fixed',
  zIndex: 1,
  bottom: '0',
  left: '280px',
  width: 'calc(100% - 280px)',
  height: '50px',
  backgroundColor: 'white',
  borderTop: '1px solid #e0e0e0',
  [theme.breakpoints.down('md')]: {
    left: '0',
    width: '100%',
  },
}));

const MessagesContent: FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isDrawerOpened, setIsDrawerOpened] = useState(false);
  const [messages, setMessages] = useState<MessageObj[]>([]);
  const [text, setText] = useState<string>('');
  const isAnchorElOpen = !!anchorEl;

  const onMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const onMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const chunkedMessageIndexesByTime = useCallback((messages: MessageObj[], time: number = 60000) => {
    const indexes: number[][] = [];
    let tempIndexes: number[] = [];
    const now = new Date();

    for (let i = 0; i < messages.length; i++) {
      secondLoop: for (let j = i + 1; j < messages.length && messages[j]; j++) {
        if (
          messages[i].userId === messages[j].userId &&
          now.getTime() - new Date(messages[i].date).getTime() < time &&
          now.getTime() - new Date(messages[j].date).getTime() < time
        ) {
          tempIndexes.push(i, j);
          i = j;
        } else {
          break secondLoop;
        }
      }

      if (tempIndexes.length) {
        indexes.push(Array.from(new Set(tempIndexes)));
        tempIndexes = [];
      }
    }

    return indexes;
  }, []);

  useEffect(() => {
    const messages: MessageObj[] = [];

    const chunkedIndexes = chunkedMessageIndexesByTime(messages);

    for (let indexes of chunkedIndexes) {
      indexes = indexes.slice(0, -1);
      for (const index of indexes) {
        messages[index].isDateDisabled = true;
      }
    }

    setMessages((prevState) => {
      return messages;
    });
  }, [chunkedMessageIndexesByTime]);

  useEffect(() => {
    // write the isDateDisabled for the onSnapshot fn
  }, []);

  const onSendText = useCallback(() => {
    console.log(text.trim());
    setText('');
  }, [text]);

  return (
    <>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {messages.length > 0 ? (
          <Box component="div" sx={{ width: '100%', height: '100%', padding: '10px' }}>
            <Box sx={{ width: '100%', height: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  width: '100%',
                  height: '100%',
                }}
              >
                {messages.map((message, i) => (
                  <Box key={message.id} sx={{ paddingBottom: i >= messages.length - 1 ? '58px' : '0' }}>
                    <MessageCard message={message} />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        ) : (
          <EmptyMessages />
        )}
        <FormWrapper>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSendText();
            }}
          >
            <Box
              component="div"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MenuIconWrapper>
                <Box onClick={onMenuOpen} sx={{ padding: '0 14px' }}>
                  <MenuIcon color="primary" sx={{ cursor: 'pointer' }} />
                </Box>
                <Menu anchorEl={anchorEl} open={isAnchorElOpen} onClick={onMenuClose}>
                  <MenuItem onClick={() => setIsDrawerOpened(true)}>Users</MenuItem>
                </Menu>
              </MenuIconWrapper>
              <TextField
                onChange={(event) => setText(event.target.value)}
                placeholder={'Type your message here'}
                fullWidth
                value={text}
                sx={{ height: '100%', width: '100%' }}
              />
              <Box sx={{ padding: '0 14px' }} onClick={() => onSendText()}>
                <SendIcon color="primary" sx={{ cursor: 'pointer' }} />
              </Box>
            </Box>
          </form>
        </FormWrapper>
      </Box>
      <Drawer sx={{ zIndex: 10 }} anchor="left" open={isDrawerOpened} onClose={() => setIsDrawerOpened(false)}>
        <Box sx={{ width: '280px' }} onClick={() => setIsDrawerOpened(false)}>
          <Users />
        </Box>
      </Drawer>
    </>
  );
};

export default MessagesContent;
