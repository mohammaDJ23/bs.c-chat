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
  styled,
} from '@mui/material';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import EmptyUsers from './EmptyUsers';
import { useAction, useAuth, useForm, useInfinityList, usePaginationList, useRequest, useSelector } from '../../hooks';
import {
  Conversation,
  ConversationDocObj,
  ConversationList,
  ConversationObj,
  UserList,
  UserListFilters,
  UserObj,
  debounce,
  getConversationTargetId,
  preventRunAt,
} from '../../lib';
import {
  AllConversationsApi,
  AllOwnersApi,
  AllUsersApi,
  FirestoreQueries,
  RootApi,
  StartConversationApi,
} from '../../apis';
import { DocumentData, getDocs, QueryDocumentSnapshot, getCountFromServer } from 'firebase/firestore';

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
  const conversationListSpinnerRef = useRef<HTMLDivElement | null>(null);
  const lastVisibleConversationDocRef = useRef<QueryDocumentSnapshot<DocumentData, DocumentData> | null>(null);
  const selectors = useSelector();
  const actions = useAction();
  const auth = useAuth();
  const request = useRequest();
  const { enqueueSnackbar } = useSnackbar();
  const isCurrentOwner = auth.isCurrentOwner();
  const decodedToken = auth.getDecodedToken()!;
  const userListInstance = usePaginationList(UserList);
  const conversationListInstance = useInfinityList(ConversationList);
  const conversationList = conversationListInstance.getList();
  const userListFiltersFormInstance = useForm(UserListFilters);
  const userListFiltersForm = userListFiltersFormInstance.getForm();
  const isStartConversationApiProcessing = request.isApiProcessing(StartConversationApi);
  const isInitialAllConversationApiProcessing = request.isInitialApiProcessing(AllConversationsApi);
  const isAllConversationApiProcessing = request.isApiProcessing(AllConversationsApi);
  const halfSecDebounce = useRef(debounce());
  const chatSocket = selectors.userServiceSocket.chat;
  const connectionSocket = selectors.userServiceSocket.connection;

  useEffect(() => {
    if (chatSocket && connectionSocket) {
      chatSocket.on('fail-start-conversation', (error: Error) => {
        actions.processingApiError(StartConversationApi.name);
        enqueueSnackbar({ message: error.message, variant: 'error' });
      });

      chatSocket.on('success-start-conversation', (data: ConversationObj) => {
        actions.processingApiSuccess(StartConversationApi.name);
        userListFiltersFormInstance.onChange('q', '');

        if (!data.conversation.lastMessage) {
          conversationListInstance.unshiftList(data);
          conversationListInstance.updateListAsObject(data, (val) => val.user.id);
        }

        if (!(data.user.id in conversationListInstance.getListAsObject())) {
          connectionSocket.emit('users-status', { payload: [data.user.id] });
        }
      });

      return () => {
        chatSocket.removeListener('fail-start-conversation');
        chatSocket.removeListener('success-start-conversation');
      };
    }
  }, [chatSocket, connectionSocket, conversationListInstance]);

  const getConversationList = useCallback(
    async (data: Partial<ConversationList> & Partial<RootApi> = {}) => {
      if (data.isInitialApi) actions.initialProcessingApiLoading(AllConversationsApi.name);
      else actions.processingApiLoading(AllConversationsApi.name);

      data.page = data.page || conversationListInstance.getPage();
      const page = data.page!;

      const lastVisible = lastVisibleConversationDocRef.current ? lastVisibleConversationDocRef.current : {};
      const paginatedConversationListQuery = new FirestoreQueries.PaginatedConversationListQuery(
        decodedToken.id,
        conversationListInstance.getTake(),
        lastVisible
      ).getQuery();
      const conversationListQuery = new FirestoreQueries.ConversationListQuery(decodedToken.id).getQuery();

      Promise.all([getDocs(paginatedConversationListQuery), getCountFromServer(conversationListQuery)])
        .then(([paginatedConversationListSnapshot, conversationListSnapshot]) => {
          if (data.isInitialApi) actions.initialProcessingApiSuccess(AllConversationsApi.name);
          else actions.processingApiSuccess(AllConversationsApi.name);

          const docs = paginatedConversationListSnapshot.docs;
          const count = conversationListSnapshot.data().count;

          const conversationDocs = docs.map((doc) => doc.data()) as ConversationDocObj[];
          const ids = conversationDocs.map((doc) => getConversationTargetId(doc));

          if (conversationDocs.length && ids.length) {
            lastVisibleConversationDocRef.current = docs[docs.length - 1];

            const apiData = {
              page: 1,
              take: conversationListInstance.getTake(),
              filters: { ids },
            };

            const api = isCurrentOwner ? new AllUsersApi(apiData) : new AllOwnersApi(apiData);

            request.build<[UserObj[], number]>(api).then((response) => {
              const [list] = response.data;
              const conversationList: ConversationObj[] = ids
                .map((id, i) => {
                  const findedUser = list.find((user) => user.id === id)!;
                  return new Conversation(findedUser, conversationDocs[i]);
                })
                .filter((conversation) => !!conversation.user);

              conversationListInstance.updateAndConcatList(conversationList);
              conversationListInstance.updateListAsObject(conversationList, (val) => val.user.id);
              conversationListInstance.updatePage(page);
              conversationListInstance.updateTotal(count);

              if (connectionSocket && isCurrentOwner) {
                connectionSocket.emit('users-status', { payload: ids });
              }
            });
          }
        })
        .catch((error: Error) => {
          if (data.isInitialApi) actions.initialProcessingApiError(AllConversationsApi.name);
          else actions.processingApiError(AllConversationsApi.name);

          enqueueSnackbar({ message: error.message, variant: 'error' });
        });
    },
    [connectionSocket, conversationListInstance, isCurrentOwner]
  );

  useEffect(() => {
    getConversationList({ isInitialApi: true });
  }, [connectionSocket]);

  useEffect(() => {
    const el = conversationListSpinnerRef.current;
    if (el) {
      let observer = new IntersectionObserver(
        preventRunAt(function (entries: IntersectionObserverEntry[]) {
          if (!isAllConversationApiProcessing && !conversationListInstance.isListEnd()) {
            let page = conversationListInstance.getPage();
            page++;
            getConversationList({ page });
          }
        }, 1)
      );
      observer.observe(el);
      return () => {
        observer.unobserve(el);
        observer.disconnect();
      };
    }
  }, [isAllConversationApiProcessing, conversationListInstance, getConversationList]);

  const onSearchUsersChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  }, []);

  const onAutoCompleteChange = useCallback(
    (value: UserObj | null) => {
      userListInstance.updateList([]);
      setIsSearchUsersAutoCompleteOpen(false);

      if (value && chatSocket) {
        userListFiltersFormInstance.onChange('q', `${value.firstName} ${value.lastName}`);
        actions.processingApiLoading(StartConversationApi.name);
        chatSocket.emit('start-conversation', { payload: value });
      }
    },
    [chatSocket]
  );

  const onConversationClick = useCallback((item: ConversationObj) => {
    actions.selectUserForStartConversation(item);
    actions.cleanMessages();
    if (onUserClick) {
      onUserClick.call({});
    }
  }, []);

  return (
    <UsersWrapper
      sx={{
        width: '100%',
        borderRight: '1px solid #e0e0e0',
        overflowY: 'auto',
        overflowX: 'hidden',
        wordBreak: 'break-word',
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
              {conversationList.map((item) => (
                <ListItemButton
                  selected={selectors.conversations.selectedUser?.user?.id === item.user.id}
                  key={item.conversation.id}
                  sx={{ padding: '14px 16px', borderBottom: '1px solid #e0e0e0' }}
                  onClick={() => onConversationClick(item)}
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
                              backgroundColor: auth.getUserStatusColor(item.user.id),
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
                            primary={`${item.user.firstName} ${item.user.lastName}`}
                          />
                        </Box>
                        {/* @ts-ignore */}
                        {item.conversation.updatedAt.seconds && (
                          <ListItemText
                            secondaryTypographyProps={{
                              fontSize: '10px',
                              fontWeight: '500',
                            }}
                            sx={{ flexGrow: '0', flexShrink: '0' }}
                            // @ts-ignore
                            secondary={moment(item.conversation.updatedAt.seconds * 1000).format('L')}
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
                          secondary={item.conversation.lastMessage ? item.conversation.lastMessage.text : 'No mesage'}
                        />
                      </Box>
                    </Box>
                  </ListItem>
                </ListItemButton>
              ))}
              {!conversationListInstance.isListEnd() && (
                <Box
                  ref={conversationListSpinnerRef}
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
