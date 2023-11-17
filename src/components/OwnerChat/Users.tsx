import { FC } from 'react';
import { List, Box, ListItemButton, ListItem, ListItemText } from '@mui/material';
import moment from 'moment';

const Users: FC = () => {
  return (
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
  );
};

export default Users;
