import { ChangeEvent, FC, useCallback, useEffect, useRef, useState } from 'react';
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
import { useSnackbar } from 'notistack';
import EmptyUsers from './EmptyUsers';
import { useAction, useAuth, useForm, usePaginationList, useRequest, useSelector } from '../../hooks';
import { UserList, UserListFilters, UserObj, db, debounce, preventRunAt } from '../../lib';
import { AllOwnersApi, AllUsersApi, RootApi } from '../../apis';
import { collection, where, query, or, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

interface UsersImportation {
  onUserClick: () => void;
}

const Users: FC<Partial<UsersImportation>> = ({ onUserClick }) => {
  const [isSearchUsersAutoCompleteOpen, setIsSearchUsersAutoCompleteOpen] = useState(false);
  const selectors = useSelector();
  const actions = useAction();
  const auth = useAuth();
  const request = useRequest();
  const { enqueueSnackbar } = useSnackbar();
  const isCurrentOwner = auth.isCurrentOwner();
  const decodedToken = auth.getDecodedToken()!;
  const userListInstance = usePaginationList(UserList);
  const userListFiltersFormInstance = useForm(UserListFilters);
  const userListFiltersForm = userListFiltersFormInstance.getForm();
  const isAllUsersApiProcessing = request.isApiProcessing(AllUsersApi);
  const isAllOwnersApiProcessing = request.isApiProcessing(AllOwnersApi);
  const halfSecDebouce = useRef(debounce());

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'conversation'),
        or(where('creatorId', '==', decodedToken.id), where('targetId', '==', decodedToken.id))
      ),
      preventRunAt(function (snapshot: QuerySnapshot<DocumentData, DocumentData>) {
        snapshot.docChanges().forEach((result) => {
          console.log(result.doc.data());
        });
      }, 1),
      (error) => enqueueSnackbar({ message: error.message, variant: 'error' })
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const onSearchUsersChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    userListFiltersFormInstance.onChange('q', value);

    halfSecDebouce.current(() => {
      let apiData: RootApi | null = null;

      if (isCurrentOwner) {
        apiData = new AllUsersApi({
          page: userListInstance.getPage(),
          take: userListInstance.getTake(),
          filters: {
            q: value.trim(),
          },
        });
      } else {
        apiData = new AllOwnersApi({
          page: userListInstance.getPage(),
          take: userListInstance.getTake(),
          filters: {
            q: value.trim(),
          },
        });
      }

      request.build<[UserObj[], number]>(apiData).then((response) => {
        const [list, total] = response.data;
        userListInstance.updateList(list);
        userListInstance.updateTotal(total);
        setIsSearchUsersAutoCompleteOpen(true);
      });
    });
  }, []);

  const onAutoCompleteChange = useCallback(
    (value: UserObj | null) => {
      userListFiltersFormInstance.onChange('q', '');
      userListInstance.updateList([]);
      setIsSearchUsersAutoCompleteOpen(false);

      if (value && selectors.userServiceSocket) {
        selectors.userServiceSocket.emit('start-conversation', { payload: value });
      }
    },
    [selectors.userServiceSocket]
  );

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
              freeSolo
              open={isSearchUsersAutoCompleteOpen}
              options={userListInstance.getList()}
              onBlur={() => {
                userListInstance.updateList([]);
                setIsSearchUsersAutoCompleteOpen(false);
              }}
              onChange={(_, value: UserObj | null) => onAutoCompleteChange(value)}
              value={userListFiltersForm.q}
              filterOptions={(options) => options}
              getOptionLabel={(option) => {
                if (typeof option === 'object' && option.firstName && option.lastName) {
                  return `${option.firstName} ${option.lastName}`;
                }
                return option;
              }}
              clearIcon={false}
              clearOnBlur
              clearOnEscape
              blurOnSelect
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ padding: '8px 16px' }}
                  onBlur={(event) => {
                    userListFiltersFormInstance.onChange('q', '');
                  }}
                  onFocus={() => {
                    userListInstance.updateList([]);
                    setIsSearchUsersAutoCompleteOpen(false);
                  }}
                  variant="standard"
                  placeholder={isCurrentOwner ? 'Search the users here!' : 'Search the owners here!'}
                  value={userListFiltersForm.q}
                  onChange={onSearchUsersChange}
                />
              )}
            />
            {(isAllUsersApiProcessing || isAllOwnersApiProcessing) && (
              <CircularProgress size={20} sx={{ position: 'absolute', zIndex: '1', right: '13px', top: '12px' }} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Users;
