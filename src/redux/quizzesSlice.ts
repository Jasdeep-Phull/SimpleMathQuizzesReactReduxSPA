import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Quiz } from "../quiz";
import { RootState } from "./store";

// redux slice that handles storing and updating all quiz-related data for the SPA


// Define a type for the slice state
interface QuizState {
    quizzes: Quiz[] // the user's quizzes
}

// Define the initial state using that type
const initialState: QuizState = {
    quizzes: []
}
/*
In some cases, TypeScript may unnecessarily tighten the type of the initial state. If that happens, you can work around it by casting the initial state using as, instead of declaring the type of the variable:
// Workaround: cast state instead of declaring variable type
const initialState = {
  value: 0,
} as CounterState
*/

export const quizzesSlice = createSlice({
    name: "quiz",
    initialState: initialState,
    reducers: {
        // createSlice() uses Immer, so it is fine to mutate state values inside this method. I still preferred to write these reducers in normal/non-Immer format

        // overwrite all quizzes in the store with the list of quizzes in the payload
        // used by the index loader after a successful request
        replaceQuizzes: (state, action: PayloadAction<Quiz[]>) => {
            const newState: QuizState = {
                ...state,
                quizzes: action.payload
            }
            console.log(`replaceQuizzes newState: ${JSON.stringify(newState)}`);
            return newState;
        },

        // adds a new quiz to the store
        // used by the create route after a successful create request
        addQuiz: (state, action: PayloadAction<Quiz>) => {
            const newState: QuizState = {
                ...state,
                quizzes: [...state.quizzes, action.payload]
            }
            console.log(`addQuiz newState: ${JSON.stringify(newState)}`);
            return newState;
        },

        // edits a quiz in the store
        // used by the edit route after a successful update request
        editQuiz: (state, action: PayloadAction<Quiz>) => {
            const newState: QuizState = {
                ...state,
                quizzes: state.quizzes.map(q => {
                    if (q.id === action.payload.id) {
                        return action.payload;
                    }
                    else {
                        return q;
                    }
                })
            }
            console.log(`editQuiz newState: ${JSON.stringify(newState)}`);
            return newState;
        },

        // removes a quiz from the store
        // used by the index, details and edit routes after a successful delete request
        removeQuiz: (state, action: PayloadAction<number>) => {
            const newState: QuizState = {
                ...state,
                quizzes: state.quizzes.filter(q => q.id !== action.payload)
            }
            console.log(`removeQuiz newState: ${JSON.stringify(newState)}`);
            return newState;
        },
    },
})

export const { replaceQuizzes, addQuiz, editQuiz, removeQuiz } = quizzesSlice.actions;

export const selectQuizzes = (state: RootState) => state.quiz.quizzes;

export default quizzesSlice.reducer;