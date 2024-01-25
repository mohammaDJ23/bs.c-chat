import { memo, useEffect } from 'react';
import { ChangeEvent, FC, useCallback, useRef, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useAction, useAuth, useForm, useInfinityList, usePaginationList, useRequest, useSelector } from '../../hooks';
import { Conversation, ConversationList, UserList, UserListFilters, UserObj, debounce } from '../../lib';
import { AllOwnersApi, AllUsersApi, MessagesApi, StartConversationApi } from '../../apis';
import { useSnackbar } from 'notistack';
import { WsErrorObj } from '../../lib/socket';

const UsersFinderInput: FC = () => {
  const [isSearchUsersAutoCompleteOpen, setIsSearchUsersAutoCompleteOpen] = useState(false);
  const selectors = useSelector();
  const actions = useAction();
  const auth = useAuth();
  const request = useRequest();
  const snackbar = useSnackbar();
  const isCurrentOwner = auth.isCurrentOwner();
  const userListInstance = usePaginationList(UserList);
  const conversationListInstance = useInfinityList(ConversationList);
  const userListFiltersFormInstance = useForm(UserListFilters);
  const userListFiltersForm = userListFiltersFormInstance.getForm();
  const isStartConversationApiProcessing = request.isApiProcessing(StartConversationApi);
  const isInitialMessagesApiProcessing = request.isInitialApiProcessing(MessagesApi);
  const halfSecDebounce = useRef(debounce());
  const chatSocket = selectors.userServiceSocket.chat;

  const isSearchConversationQueryExist = useCallback(() => {
    return userListFiltersFormInstance.getForm().q.length > 0;
  }, [userListFiltersFormInstance]);

  useEffect(() => {
    if (chatSocket) {
      chatSocket.on('error', (data: WsErrorObj) => {
        if (data.event === 'start-conversation') {
          actions.processingApiError(StartConversationApi.name);
          snackbar.enqueueSnackbar({ message: data.message, variant: 'error' });
        }
      });

      chatSocket.removeListener('start-conversation');
      chatSocket.on('start-conversation', (data: Conversation) => {
        if (data.conversation.lastMessage) {
          if (isSearchConversationQueryExist()) {
            actions.processingApiSuccess(StartConversationApi.name);
            userListFiltersFormInstance.onChange('q', '');
          }

          const conversationEl = document.querySelector(`[data-cid="${data.conversation.id}"]`);

          if (conversationEl) {
            const index = conversationEl.getAttribute('data-index');

            if (index && !isNaN(parseInt(index))) {
              const parsedIndex = +index;
              const conversationList = conversationListInstance.getList();

              if (conversationList[parsedIndex]) {
                const [newConversation] = conversationList.splice(parsedIndex, 1);
                conversationListInstance.unshiftList(newConversation);
              }
            }
          }
        }
      });

      return () => {
        chatSocket.removeListener('start-conversation');
      };
    }
  }, [chatSocket, conversationListInstance, userListFiltersFormInstance, isSearchConversationQueryExist]);

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
        chatSocket.emit('start-conversation', { id: value.id });
      }
    },
    [chatSocket, isInitialMessagesApiProcessing]
  );

  return (
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
      onBlur={() => {
        setIsSearchUsersAutoCompleteOpen(false);
      }}
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
  );
};

export default memo(UsersFinderInput);
