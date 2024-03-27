import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

// redux slice that handles storing and updating all account-related data for the SPA


// type for slice state
interface AccountState {
    email: string,
    token: string, // the access token from a successful login request
    tokenExpiryTime: number, // the time when the token will expire, stored as a number instead of a Date because Redux warns that Date is a non-serializable value, which might be prone to errors
    refreshToken: string, // a token which can be used to get a new access token when the current one expires
}

// Define the initial state using that type
const initialState: AccountState = {
    email: "",
    token: "",
    tokenExpiryTime: Date.now(), // initial token expiry time is the date/time (as a number) that this slice was initialised
    refreshToken: "",
}

export const accountSlice = createSlice({
    name: "account",
    initialState: initialState,
    reducers: {
        // createSlice() uses Immer, so it is fine to mutate state values inside this method. I still preferred to write these reducers in normal/non-Immer format

        // sets the email, token, tokenExpiryTime and refreshToken after a successful login request
        login: (state, action: PayloadAction<any>) => {
            const newState: AccountState = {
                ...state,
                email: action.payload.email,
                token: action.payload.token,
                tokenExpiryTime: calculateTokenExpiryTime(action.payload.expiresIn),
                refreshToken: action.payload.refreshToken,
            }
            console.log(`login newState: ${JSON.stringify(newState)}`);
            return newState;
        },

        // sets the token, tokenExpiryTime and refreshToken after a successful token refresh request
        tokenRefresh: (state, action: PayloadAction<any>) => {
            const newState: AccountState = {
                ...state,
                token: action.payload.token,
                tokenExpiryTime: calculateTokenExpiryTime(action.payload.expiresIn),
                refreshToken: action.payload.refreshToken
            }
            console.log(`tokenRefresh payload:\ntoken${action.payload.token}\nexpiresIn: ${action.payload.expiresIn}\nrefeshToken: ${action.payload.refreshToken}`)
            console.log(`tokenRefresh newState: ${JSON.stringify(newState)}`);
            return newState;
        },

        // changes email, token and refresh token to empty strings, and changes tokenExpiryTime to the current date/time (as a number), after a successful logout request
        logout: state => {
            const newState: AccountState = {
                ...state,
                email: "",
                token: "",
                tokenExpiryTime: Date.now(),
                refreshToken: ""
            }
            console.log(`logout newState: ${JSON.stringify(newState)}`);
            return newState;
        },

        /* This is not used, email change requests to the API are handled outside this SPA because there isn't an email provider set up for the API

        changeEmail: (state, action) => {
            const newState: AccountState = {
                ...state,
                email: action.payload.email
            }
            console.log(`changeEmail newState: ${JSON.stringify(newState)}`);
            return newState;
        }
        */
    },
})

/**
 * Calculates the expiry time of the token
 * @param expiresIn The time until the token expires, in seconds
 * @returns The expiry time of the token
 */
function calculateTokenExpiryTime(expiresIn: number): number {
    // expiresIn is in seconds, while Date.now() is in milliseconds, so expiresIn needs to be multiplied by 1000 to also be in milliseconds
    return (Date.now() + (expiresIn * 1000));
}

// export const { login, tokenRefresh, logout, changeEmail } = accountSlice.actions;
export const { login, tokenRefresh, logout } = accountSlice.actions;

// selectors
export const selectEmail = (state: RootState) => state.account.email;
export const selectToken = (state: RootState) => state.account.token;
export const selectTokenExpiryTime = (state: RootState) => state.account.tokenExpiryTime;
export const selectRefreshToken = (state: RootState) => state.account.refreshToken;

export default accountSlice.reducer;