import { configureStore } from "@reduxjs/toolkit";
import accountReducer from "./accountSlice";
import quizzesReducer from "./quizzesSlice";

// slices implement the store logic, they are put together here
export const store = configureStore({
    reducer: {
        account: accountReducer,
        quiz: quizzesReducer
    }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch