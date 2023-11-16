import { FC } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import moment from 'moment';

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
                <ListItemButton sx={{ borderBottom: '1px solid #e0e0e0' }}>
                  <ListItem disablePadding>
                    <Box sx={{ width: '100%', height: '100%' }}>
                      <Box
                        component="div"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          flexWrap: 'nowrap',
                          width: '100%',
                        }}
                      >
                        <ListItemText
                          primaryTypographyProps={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            width: '175px',
                          }}
                          primary="Mohammad nowresideh"
                        />
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
                            fontWeight: 'bold',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            width: '239px',
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
          <Box sx={{ width: '100%', height: '100%', position: 'relative' }}></Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OwnerChat;
