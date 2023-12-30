import { ChangeEvent, FC, useCallback, useRef, useState } from 'react';
import {
  List,
  Box,
  ListItemButton,
  ListItem,
  ListItemText,
  Autocomplete,
  TextField,
  CircularProgress,
  styled,
} from '@mui/material';
import moment from 'moment';
import EmptyUsers from './EmptyUsers';
import { useAction, useAuth, useForm, useInfinityList, usePaginationList, useRequest, useSelector } from '../../hooks';
import {
  ConversationList,
  ConversationObj,
  MessageList,
  UserList,
  UserListFilters,
  UserObj,
  debounce,
  getConversationDate,
} from '../../lib';
import { AllConversationsApi, AllOwnersApi, AllUsersApi, MessagesApi, StartConversationApi } from '../../apis';

const UsersWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    height: 'calc(100vh - 48px)',
  },
  [theme.breakpoints.up('md')]: {
    height: 'calc(100vh - 64px)',
  },
}));

const ListWrapper = styled(List)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    paddingBottom: '0',
  },
  [theme.breakpoints.up('md')]: {
    paddingBottom: '50px',
  },
}));

interface UsersImportation {
  onUserClick: () => void;
}

const Users: FC<Partial<UsersImportation>> = ({ onUserClick }) => {
  const [isSearchUsersAutoCompleteOpen, setIsSearchUsersAutoCompleteOpen] = useState(false);
  const selectors = useSelector();
  const actions = useAction();
  const auth = useAuth();
  const request = useRequest();
  const isCurrentOwner = auth.isCurrentOwner();
  const userListInstance = usePaginationList(UserList);
  const conversationListInstance = useInfinityList(ConversationList);
  const messageListInstance = useInfinityList(MessageList);
  const conversationList = conversationListInstance.getList();
  const userListFiltersFormInstance = useForm(UserListFilters);
  const userListFiltersForm = userListFiltersFormInstance.getForm();
  const isStartConversationApiProcessing = request.isApiProcessing(StartConversationApi);
  const isInitialAllConversationApiProcessing = request.isInitialApiProcessing(AllConversationsApi);
  const isInitialMessagesApiProcessing = request.isInitialApiProcessing(MessagesApi);
  const halfSecDebounce = useRef(debounce());
  const chatSocket = selectors.userServiceSocket.chat;
  const selectedConversation = selectors.conversations.selectedUser;

  const onSearchUsersChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (isInitialMessagesApiProcessing) {
        return;
      }
      const value = event.target.value;
      userListFiltersFormInstance.onChange('q', value);

      halfSecDebounce.current(() => {
        const apiData = {
          page: userListInstance.getPage(),
          take: userListInstance.getTake(),
          filters: { q: value.trim() },
        };

        const api = isCurrentOwner ? new AllUsersApi(apiData) : new AllOwnersApi(apiData);

        request.build<[UserObj[], number]>(api).then((response) => {
          const [list, total] = response.data;
          userListInstance.updateList(list);
          userListInstance.updateTotal(total);
          setIsSearchUsersAutoCompleteOpen(true);
        });
      });
    },
    [isInitialMessagesApiProcessing]
  );

  const onAutoCompleteChange = useCallback(
    (value: UserObj | null) => {
      if (isInitialMessagesApiProcessing) {
        return;
      }
      userListInstance.updateList([]);
      setIsSearchUsersAutoCompleteOpen(false);

      if (value && chatSocket) {
        userListFiltersFormInstance.onChange('q', `${value.firstName} ${value.lastName}`);
        actions.processingApiLoading(StartConversationApi.name);
        chatSocket.emit('start-conversation', { payload: value });
      }
    },
    [chatSocket, isInitialMessagesApiProcessing]
  );

  const onConversationClick = useCallback(
    (item: ConversationObj) => {
      if (isInitialMessagesApiProcessing) {
        return;
      }

      if (!selectedConversation || (selectedConversation && selectedConversation.user.id !== item.user.id)) {
        actions.selectUserForStartConversation(item);
        actions.hideMessagesSpinnerElement();
        messageListInstance.resetList();
      }

      if (onUserClick) {
        onUserClick.call({});
      }
    },
    [selectedConversation, isInitialMessagesApiProcessing]
  );

  return (
    <UsersWrapper
      sx={{
        width: '100%',
        borderRight: '1px solid #e0e0e0',
        overflowY: 'auto',
        overflowX: 'hidden',
        wordBreak: 'break-word',
        position: 'relative',
      }}
    >
      {isInitialAllConversationApiProcessing ? (
        <Box
          component={'div'}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <CircularProgress size={30} />
        </Box>
      ) : (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
          {conversationList.length > 0 ? (
            <ListWrapper disablePadding>
              {conversationList.map((item, index) => (
                <ListItemButton
                  selected={selectors.conversations.selectedUser?.user?.id === item.user.id}
                  key={item.conversation.id}
                  sx={{ padding: '14px 16px', borderBottom: '1px solid #e0e0e0' }}
                  onClick={() => onConversationClick(item)}
                  data-cid={item.conversation.id}
                  data-index={index}
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
                          {isCurrentOwner && (
                            <ListItemText
                              sx={{
                                flex: 'unset',
                                width: '8px',
                                height: '8px',
                                backgroundColor: auth.getUserStatusColor(item.user.id),
                                borderRadius: '50%',
                              }}
                              secondary={<Box component="span"></Box>}
                            />
                          )}
                          <ListItemText
                            primaryTypographyProps={{
                              fontSize: '14px',
                              fontWeight: 'bold',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              width: '165px',
                            }}
                            primary={`${item.user.firstName} ${item.user.lastName}`}
                          />
                        </Box>
                        {/* @ts-ignore */}
                        {item.conversation.lastMessage && (
                          <ListItemText
                            secondaryTypographyProps={{
                              fontSize: '10px',
                              fontWeight: '500',
                            }}
                            sx={{ flexGrow: '0', flexShrink: '0' }}
                            // @ts-ignore
                            secondary={getConversationDate(item.conversation.lastMessage.updatedAt.seconds * 1000)}
                          />
                        )}
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
                          secondary={
                            item.conversation.lastMessage
                              ? auth.isUserEqualToCurrentUser(item.conversation.lastMessage.userId)
                                ? `You: ${item.conversation.lastMessage.text}`
                                : item.conversation.lastMessage.text
                              : 'No mesage'
                          }
                        />
                      </Box>
                    </Box>
                  </ListItem>
                </ListItemButton>
              ))}
              {!conversationListInstance.isListEndByLength() && (
                <Box
                  id="chat__conversation-list-spinner"
                  component={'div'}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    padding: '16px',
                  }}
                >
                  <CircularProgress size={30} />
                </Box>
              )}
            </ListWrapper>
          ) : (
            <EmptyUsers />
          )}
          <Box sx={{ position: 'fixed', zIndex: 1, bottom: '0', left: '0', width: '280px', height: '50px' }}>
            <Box sx={{ width: '100%', height: '100%', backgroundColor: '#e0e0e0' }}>
              <Autocomplete
                freeSolo
                disabled={isStartConversationApiProcessing}
                open={isSearchUsersAutoCompleteOpen}
                options={userListInstance.getList()}
                // @ts-ignore
                onChange={(_, value: UserObj | null) => onAutoCompleteChange(value)}
                filterOptions={(options) => options}
                // @ts-ignore
                getOptionLabel={(option) => {
                  if (typeof option === 'object' && option.firstName && option.lastName) {
                    return `${option.firstName} ${option.lastName}`;
                  }
                  return option;
                }}
                clearIcon={false}
                value={userListFiltersForm.q}
                inputValue={userListFiltersForm.q}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{ padding: '8px 16px' }}
                    disabled={isStartConversationApiProcessing}
                    onFocus={() => {
                      userListInstance.updateList([]);
                      setIsSearchUsersAutoCompleteOpen(false);
                    }}
                    variant="standard"
                    value={userListFiltersForm.q}
                    placeholder={isCurrentOwner ? 'Search the users here!' : 'Search the owners here!'}
                    onChange={onSearchUsersChange}
                  />
                )}
              />
              {isStartConversationApiProcessing && (
                <CircularProgress size={20} sx={{ position: 'absolute', zIndex: '1', right: '13px', top: '12px' }} />
              )}
            </Box>
          </Box>
        </Box>
      )}
    </UsersWrapper>
  );
};

export default Users;
