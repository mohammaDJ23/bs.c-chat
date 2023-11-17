import { FC } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText, TextField as TF, styled } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import moment from 'moment';

const TextField = styled(TF)(({ theme }) => ({
  '.css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input': {
    border: 'none',
    padding: '14px',
  },
  '.css-1d3z3hw-MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

const OwnerChat: FC = () => {
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
            <Box></Box>
            <Box
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
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <TextField
                    value={''}
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
