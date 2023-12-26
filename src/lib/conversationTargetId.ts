import { getDecodedToken } from './authentication';
import { ConversationDocObj, ConversationObj } from './lists';

export function getConversationTargetId(conversation: ConversationObj | ConversationDocObj) {
  const decodedToken = getDecodedToken();

  if (!decodedToken) {
    throw new Error('Could not found the user id from the token');
  }

  if ('conversation' in conversation) {
    return conversation.conversation.creatorId === decodedToken.id
      ? conversation.conversation.targetId
      : conversation.conversation.creatorId;
  }

  return conversation.creatorId === decodedToken.id ? conversation.targetId : conversation.creatorId;
}
