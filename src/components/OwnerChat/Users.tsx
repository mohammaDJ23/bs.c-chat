import { FC } from 'react';
import {
  List,
  Box,
  ListItemButton,
  ListItem,
  ListItemText,
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material';
import moment from 'moment';
import EmptyUsers from './EmptyUsers';
import { useSelector } from '../../hooks';

interface UsersImportation {
  onUserClick: () => void;
}

const Users: FC<Partial<UsersImportation>> = ({ onUserClick }) => {
  const selectors = useSelector();

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        borderRight: '1px solid #e0e0e0',
        overflowY: 'auto',
        overflowX: 'hidden',
        wordBreak: 'break-word',
      }}
    >
      <Box sx={{ width: '100%', height: '100%', position: 'relative', paddingBottom: '48px' }}>
        {selectors.message.users.length > 0 ? (
          <List disablePadding>
            <ListItemButton
              sx={{ padding: '14px 16px', borderBottom: '1px solid #e0e0e0' }}
              onClick={() => {
                if (onUserClick) {
                  onUserClick.call({});
                }
              }}
            >
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
        ) : (
          <EmptyUsers />
        )}
        <Box sx={{ position: 'absolute', zIndex: 1, bottom: '0', left: '0', width: '280px' }}>
          <Box sx={{ width: '100%', backgroundColor: '#e0e0e0' }}>
            <Autocomplete
              options={[]}
              freeSolo
              filterOptions={(options) => options}
              clearIcon={false}
              clearOnBlur
              clearOnEscape
              blurOnSelect
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ padding: '8px 16px' }}
                  variant="standard"
                  placeholder="Search the user here!"
                />
              )}
            />
            {true && (
              <CircularProgress size={20} sx={{ position: 'absolute', zIndex: '1', right: '13px', top: '12px' }} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Users;
