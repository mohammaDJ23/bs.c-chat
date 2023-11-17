import { FC, useCallback } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText, TextField as TF, styled, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import moment from 'moment';

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

const OwnerChat: FC = () => {
  const getMessageDate = useCallback((date: Date | number) => {
    const now = new Date().getTime();
    const messageDate = new Date(date).getTime();
    const calculatedTime = now - messageDate;

    // one day
    if (calculatedTime < 86400000) {
      return moment(messageDate).format('LT');

      // two days
    } else if (calculatedTime < 172800000) {
      return moment(messageDate).subtract(1, 'days').calendar();

      // one week or more
    } else if (calculatedTime < 604800000 || calculatedTime >= 604800000) {
      return moment(messageDate).format('llll');
    }
  }, []);

  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ width: '100%', height: '100%' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '280px auto', height: '100%', width: '100%' }}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRight: '1px solid #e0e0e0',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            <Box sx={{ width: '100%', height: '100%', wordBreak: 'break-word' }}>
              <List disablePadding>
                <ListItemButton sx={{ padding: '14px 16px', borderBottom: '1px solid #e0e0e0' }}>
                  <ListItem disablePadding>
                    <Box sx={{ width: '100%', height: '100%' }}>
                      <Box
                        component="div"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'nowrap',
                          width: '100%',
                        }}
                      >
                        <Box
                          component="div"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'nowrap',
                          }}
                        >
                          <ListItemText
                            sx={{
                              flex: 'unset',
                              width: '8px',
                              height: '8px',
                              backgroundColor: 'red',
                              borderRadius: '50%',
                            }}
                            secondary={<Box component="span"></Box>}
                          />
                          <ListItemText
                            primaryTypographyProps={{
                              fontSize: '14px',
                              fontWeight: 'bold',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              width: '165px',
                            }}
                            primary="Mohammad nowresideh"
                          />
                        </Box>
                        <ListItemText
                          secondaryTypographyProps={{
                            fontSize: '10px',
                            fontWeight: '500',
                          }}
                          sx={{ flexGrow: '0', flexShrink: '0' }}
                          secondary={moment().format('L')}
                        />
                      </Box>
                      <Box component="div">
                        <ListItemText
                          secondaryTypographyProps={{
                            fontSize: '11px',
                            fontWeight: '500',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            width: '250px',
                          }}
                          secondary={'this is a new message from mohammad nowresideh who is the owner of the app'}
                        />
                      </Box>
                    </Box>
                  </ListItem>
                </ListItemButton>
              </List>
            </Box>
          </Box>
          <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            <Box
              component="div"
              sx={{ marginBottom: '51px', width: '100%', height: '100%', overflow: 'hidden', padding: '10px' }}
            >
              <Box sx={{ width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'end', flexDirection: 'column', gap: '6px' }}>
                      <Box
                        sx={{
                          backgroundColor: '#20A0FF',
                          padding: '12px',
                          borderRadius: '0 10px 10px 10px',
                          maxWidth: '400px',
                          border: '1px solid #f2f2f2',
                          color: 'white',
                          boxShadow: '0px 10px 15px -10px rgba(0,0,0,0.1)',
                        }}
                      >
                        <Typography
                          sx={{ fontSize: '15px', fontWeight: '400', letterSpacing: '0.3px', minWidth: '50px' }}
                          component="p"
                        >
                          oaisdjfoiasjdiofjiasdjiof iosajdiofjiosadj sidoj fiojisodjf
                        </Typography>
                      </Box>
                      <Typography fontSize={'10px'} fontWeight={'400'} sx={{ color: '#999999' }} component="p">
                        {getMessageDate(new Date())}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'end' }}>
                    <Box sx={{ display: 'flex', alignItems: 'start', flexDirection: 'column', gap: '6px' }}>
                      <Box
                        sx={{
                          backgroundColor: '#f8f8f8',
                          padding: '12px',
                          borderRadius: '10px 0 10px 10px',
                          maxWidth: '400px',
                          border: '1px solid #f2f2f2',
                          color: 'black',
                          boxShadow: '0px 10px 15px -10px rgba(0,0,0,0.1)',
                        }}
                      >
                        <Typography
                          sx={{ fontSize: '15px', fontWeight: '400', letterSpacing: '0.3px', minWidth: '50px' }}
                          component="p"
                        >
                          oaisdjfoiasjdiofjiasdjiof
                        </Typography>
                      </Box>
                      <Typography fontSize={'10px'} fontWeight={'400'} sx={{ color: '#999999' }} component="p">
                        {getMessageDate(new Date())}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box
              component="div"
              sx={{
                position: 'absolute',
                zIndex: 1,
                bottom: '0',
                left: '0',
                width: '100%',
                height: '50px',
                backgroundColor: 'white',
                borderTop: '1px solid #e0e0e0',
              }}
            >
              <form onSubmit={() => {}}>
                <Box
                  component="div"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <TextField
                    onChange={() => {}}
                    placeholder={'Type your message here'}
                    fullWidth
                    sx={{ height: '100%', width: '100%' }}
                  />
                  <Box sx={{ padding: '0 14px' }}>
                    <SendIcon color="primary" sx={{ cursor: 'pointer' }} />
                  </Box>
                </Box>
              </form>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OwnerChat;
