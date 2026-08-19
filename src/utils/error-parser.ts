export const parseSystemError = (error: Error) => {
  try {
    const data = JSON.parse(error.message);
    return {
      isSystemError: !!data.operationType,
      message: data.error || error.message,
      path: data.path || 'N/A'
    };
  } catch {
    return { isSystemError: false, message: error.message, path: 'N/A' };
  }
};