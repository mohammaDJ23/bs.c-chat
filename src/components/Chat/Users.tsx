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
import { useAction, useAuth, useForm, usePaginationList, useRequest, useSelector } from '../../hooks';
import {
  ConversationDocObj,
  ConversationList,
  ConversationObj,
  ListAsObjectType,
  UserList,
  UserListFilters,
  UserObj,
  db,
  debounce,
  preventRunAt,
} from '../../lib';
import { AllConversationsApi, AllOwnersApi, AllUsersApi, RootApi, StartConversationApi } from '../../apis';
import {
  collection,
  where,
  query,
  or,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  orderBy,
  limit,
  getDocs,
  startAfter,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { UsersStatusType } from '../../store';

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
    paddingBottom: '48px',
  },
}));

interface UsersImportation {
  onUserClick: () => void;
}

const Users: FC<Partial<UsersImportation>> = ({ onUserClick }) => {
  const [isSearchUsersAutoCompleteOpen, setIsSearchUsersAutoCompleteOpen] = useState(false);
  const conversationListSpinnerRef = useRef<HTMLDivElement | null>(null);
  const lastVisibleConversationDocRef = useRef<QueryDocumentSnapshot<DocumentData, DocumentData> | null>(null);
  const isConversationListEndRef = useRef<boolean>(false);
  const selectors = useSelector();
  const actions = useAction();
  const auth = useAuth();
  const request = useRequest();
  const { enqueueSnackbar } = useSnackbar();
  const isCurrentOwner = auth.isCurrentOwner();
  const decodedToken = auth.getDecodedToken()!;
  const userListInstance = usePaginationList(UserList);
  const conversationListInstance = usePaginationList(ConversationList);
  const userListFiltersFormInstance = useForm(UserListFilters);
  const userListFiltersForm = userListFiltersFormInstance.getForm();
  const conversationInfinityList = conversationListInstance.getInfinityList();
  const isStartConversationApiProcessing = request.isApiProcessing(StartConversationApi);
  const isInitialAllConversationApiProcessing = request.isInitialApiProcessing(AllConversationsApi);
  const isAllConversationApiProcessing = request.isApiProcessing(AllConversationsApi);
  const halfSecDebounce = useRef(debounce());

  useEffect(() => {
    if (selectors.userServiceSocket.connection && isCurrentOwner) {
      selectors.userServiceSocket.connection.on('users-status', (data: UsersStatusType) => {
        const usersStatus = Object.assign({}, selectors.specificDetails.usersStatus, data);
        actions.setSpecificDetails('usersStatus', usersStatus);
      });

      selectors.userServiceSocket.connection.on('user-status', (data: UsersStatusType) => {
        const conversationListAsObject = conversationListInstance.getListAsObject();
        const [id] = Object.keys(data);
        if (conversationListAsObject[id]) {
          const usersStatus = Object.assign({}, selectors.specificDetails.usersStatus, data);
          actions.setSpecificDetails('usersStatus', usersStatus);
        }
      });

      return () => {
        selectors.userServiceSocket.connection!.removeListener('users-status');
        selectors.userServiceSocket.connection!.removeListener('user-status');
      };
    }
  }, [selectors.userServiceSocket.connection, selectors.specificDetails.usersStatus, userListInstance, isCurrentOwner]);

  useEffect(() => {
    if (selectors.userServiceSocket.chat) {
      selectors.userServiceSocket.chat.on('fail-start-conversation', (error: Error) => {
        actions.processingApiError(StartConversationApi.name);
        userListFiltersFormInstance.onChange('q', '');
        enqueueSnackbar({ message: error.message, variant: 'error' });
      });

      selectors.userServiceSocket.chat.on('success-start-conversation', (data: UserObj) => {
        actions.processingApiSuccess(StartConversationApi.name);
        userListFiltersFormInstance.onChange('q', '');
      });

      return () => {
        selectors.userServiceSocket.chat!.removeListener('fail-start-conversation');
        selectors.userServiceSocket.chat!.removeListener('success-start-conversation');
      };
    }
  }, [selectors.userServiceSocket.chat]);

  const getConversationList = useCallback(
    async (data: Partial<ConversationList> & Partial<RootApi> = {}) => {
      if (data.isInitialApi) actions.initialProcessingApiLoading(AllConversationsApi.name);
      else actions.processingApiLoading(AllConversationsApi.name);

      data.page = data.page || conversationListInstance.getPage();
      const page = data.page!;

      const lastVisible = lastVisibleConversationDocRef.current ? lastVisibleConversationDocRef.current : {};

      getDocs(
        query(
          collection(db, 'conversation'),
          or(where('creatorId', '==', decodedToken.id), where('targetId', '==', decodedToken.id)),
          orderBy('updatedAt', 'desc'),
          limit(conversationListInstance.getTake()),
          startAfter(lastVisible)
        )
      )
        .then((snapshot) => {
          if (data.isInitialApi) actions.initialProcessingApiSuccess(AllConversationsApi.name);
          else actions.processingApiSuccess(AllConversationsApi.name);

          lastVisibleConversationDocRef.current = snapshot.docs[snapshot.docs.length - 1];

          const conversationDocs = snapshot.docs.map((doc) => doc.data()) as ConversationDocObj[];
          const ids = conversationDocs.map((doc) => (doc.creatorId === decodedToken.id ? doc.targetId : doc.creatorId));

          if (ids.length < conversationListInstance.getTake()) {
            isConversationListEndRef.current = true;
          }

          if (conversationDocs.length && ids.length) {
            const apiData = {
              page: 1,
              take: conversationListInstance.getTake(),
              filters: { ids },
            };

            const api = isCurrentOwner ? new AllUsersApi(apiData) : new AllOwnersApi(apiData);

            request.build<[UserObj[], number]>(api).then((response) => {
              const [list, total] = response.data;
              const conversationList: ConversationObj[] = ids
                .map((id, i) => ({
                  conversation: conversationDocs[i],
                  user: list.find((user) => user.id === id)!,
                }))
                .filter((conversation) => !!conversation.user);

              conversationListInstance.updateAndConcatList(conversationList, page);
              conversationListInstance.updateListAsObject(conversationList, (val) => val.user.id);
              conversationListInstance.updatePage(page);
              conversationListInstance.updateTotal(total + conversationListInstance.getTotal());

              if (selectors.userServiceSocket.connection && isCurrentOwner) {
                selectors.userServiceSocket.connection.emit('users-status', { payload: ids });
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
    [selectors.userServiceSocket.connection, conversationListInstance, isCurrentOwner]
  );

  useEffect(() => {
    getConversationList({ isInitialApi: true });
  }, [selectors.userServiceSocket.connection]);

  useEffect(() => {
    const el = conversationListSpinnerRef.current;
    if (el) {
      let observer = new IntersectionObserver(
        preventRunAt(function (entries: IntersectionObserverEntry[]) {
          if (!isAllConversationApiProcessing && !isConversationListEndRef.current) {
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
  }, [conversationListSpinnerRef.current, isAllConversationApiProcessing, getConversationList]);

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
      (error) => {
        actions.processingApiError(StartConversationApi.name);
        enqueueSnackbar({ message: error.message, variant: 'error' });
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

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

      if (value && selectors.userServiceSocket.chat) {
        userListFiltersFormInstance.onChange('q', `${value.firstName} ${value.lastName}`);
        actions.processingApiLoading(StartConversationApi.name);
        selectors.userServiceSocket.chat.emit('start-conversation', { payload: value });
      }
    },
    [selectors.userServiceSocket.chat]
  );

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
          {conversationInfinityList.length > 0 ? (
            <ListWrapper disablePadding>
              {conversationInfinityList.map((item) => (
                <ListItemButton
                  key={item.conversation.id}
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
                        <ListItemText
                          secondaryTypographyProps={{
                            fontSize: '10px',
                            fontWeight: '500',
                          }}
                          sx={{ flexGrow: '0', flexShrink: '0' }}
                          // @ts-ignore
                          secondary={moment(item.conversation.updatedAt.seconds * 1000).format('L')}
                        />
                      </Box>
                      {item.conversation.lastMessage && (
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
                            secondary={item.conversation.lastMessage.text}
                          />
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                </ListItemButton>
              ))}
              {!isConversationListEndRef.current && (
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
          <Box sx={{ position: 'fixed', zIndex: 1, bottom: '0', left: '0', width: '280px' }}>
            <Box sx={{ width: '100%', backgroundColor: '#e0e0e0' }}>
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
