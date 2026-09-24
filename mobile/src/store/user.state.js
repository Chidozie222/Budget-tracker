export const initialAuthState = {
  isLogin: false,
  user: null,
  isLoading: false,
  error: null,
};

export const authReducer = (state, action) => {
  switch (action.type) {
    case "SIGN_IN":
      return {
        ...state,
        isLogin: true,
        user: action.payload,
        error: null,
      };
    case "SIGN_OUT":
      return {
        ...initialAuthState,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};
