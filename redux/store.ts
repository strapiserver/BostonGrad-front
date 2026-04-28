import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "./mainReducer";
import leaveFeedbackReducer from "./leaveFeedbackSlice";

const store = configureStore({
  reducer: {
    main: mainReducer,
    leaveFeedback: leaveFeedbackReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
