export function getAuthErrorMessage(errorCode: string): string {
  const errorMap: Record<string, string> = {
    'auth/email-already-in-use': 'auth.errors.emailAlreadyInUse',
    'auth/invalid-email': 'auth.errors.invalidEmail',
    'auth/operation-not-allowed': 'auth.errors.operationNotAllowed',
    'auth/weak-password': 'auth.errors.weakPassword',
    'auth/user-disabled': 'auth.errors.userDisabled',
    'auth/user-not-found': 'auth.errors.userNotFound',
    'auth/wrong-password': 'auth.errors.wrongPassword',
    'auth/invalid-credential': 'auth.errors.invalidCredential',
    'auth/too-many-requests': 'auth.errors.tooManyRequests',
    'auth/network-request-failed': 'auth.errors.networkRequestFailed',
    'auth/popup-closed-by-user': 'auth.errors.popupClosedByUser',
    'auth/cancelled-popup-request': 'auth.errors.cancelledPopupRequest',
  };

  return errorMap[errorCode] || 'auth.errors.default';
}

