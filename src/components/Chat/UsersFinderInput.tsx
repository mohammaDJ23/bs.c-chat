import { memo, useEffect } from 'react';
import { ChangeEvent, FC, useCallback, useRef, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useAction, useAuth, useForm, useInfinityList, usePaginationList, useRequest, useSelector } from '../../hooks';
import { ConversationList, ConversationObj, UserList, UserListFilters, UserObj, debounce } from '../../lib';
import { AllOwnersApi, AllUsersApi, MessagesApi, StartConversationApi } from '../../apis';
import { useSnackbar } from 'notistack';

const UsersFinderInput: FC = () => {
  const [isSearchUsersAutoCompleteOpen, setIsSearchUsersAutoCompleteOpen] = useState(false);
  const selectors = useSelector();
  const actions = useAction();
  const auth = useAuth();
  const request = useRequest();
  const snackbar = useSnackbar();
  const isCurrentOwner = auth.isCurrentOwner();
  const userListInstance = usePaginationList(UserList);
  const userListFiltersFormInstance = useForm(UserListFilters);
  const conversationListInstance = useInfinityList(ConversationList);
  const userListFiltersForm = userListFiltersFormInstance.getForm();
  const isStartConversationApiProcessing = request.isApiProcessing(StartConversationApi);
  const isInitialMessagesApiProcessing = request.isInitialApiProcessing(MessagesApi);
  const halfSecDebounce = useRef(debounce());
  const chatSocket = selectors.userServiceSocket.chat;
  const connectionSocket = selectors.userServiceSocket.connection;

  useEffect(() => {
    if (chatSocket && connectionSocket) {
      chatSocket.on('fail-start-conversation', (error: Error) => {
        actions.processingApiError(StartConversationApi.name);
        snackbar.enqueueSnackbar({ message: error.message, variant: 'error' });
      });

      chatSocket.on('success-start-conversation', (data: ConversationObj) => {
        userListFiltersFormInstance.onChange('q', '');
      });

      return () => {
        chatSocket.removeListener('fail-start-conversation');
        chatSocket.removeListener('success-start-conversation');
      };
    }
  }, [chatSocket, connectionSocket, conversationListInstance]);

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
