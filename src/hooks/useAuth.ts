import {
  getToken,
  getDecodedToken,
  isUserAuthenticated,
  isUser,
  isAdmin,
  isOwner,
  getUserRoles,
  isUserEqualToCurrentUser,
  hasRole,
  hasRoleAuthorized,
  isCurrentUser,
  isCurrentAdmin,
  isCurrentOwner,
  hasAdminRoleAuthorized,
  hasCreatedByOwnerRoleAuthorized,
  hasOwnerRoleAuthorized,
  hasUserRoleAuthroized,
  isUserCreatedByCurrentUser,
} from '../lib';

export function useAuth() {
  return {
    getToken,
    getDecodedToken,
    isUserAuthenticated,
    isUser,
    isAdmin,
    isOwner,
    getUserRoles,
    isUserEqualToCurrentUser,
    hasRole,
    hasRoleAuthorized,
    isCurrentUser,
    isCurrentAdmin,
    isCurrentOwner,
    hasAdminRoleAuthorized,
    hasCreatedByOwnerRoleAuthorized,
    hasOwnerRoleAuthorized,
    hasUserRoleAuthroized,
    isUserCreatedByCurrentUser,
  };
}
