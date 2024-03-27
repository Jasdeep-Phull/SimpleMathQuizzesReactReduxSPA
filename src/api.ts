// import { useSelector, useDispatch } from "react-redux";
import { store } from "./redux/store"
import { Quiz } from "./quiz";
import { selectToken, login, logout, selectRefreshToken, tokenRefresh, selectTokenExpiryTime } from "./redux/accountSlice"
import { addQuiz, editQuiz, removeQuiz } from "./redux/quizzesSlice";

// This script is responsible for making requests to the API, and converting API responses to a format that can be displayed by the pages of the SPA

/**
 * CORS is not set up on the SPA or the API. The SPA and API were tested with CORS disabled.
 * Tested on chrome with CORS disabled using: 'chrome.exe --disable-web-security --user-data-dir=~/chromeTemp'
 * (from folder: 'C:\Program Files\Google\Chrome\Application')
 */


const serverLocation: string = "https://localhost:7244"; // the web address of the web API, other constants and functions append to this string to form an endpoint


// quiz url functions

// appends the quiz api location to serverLocation
const quizUrl: string = `${serverLocation}/api/Quiz`;
/**
 * Returns the value of quizUrl with the endpoint parameter appended to it
 * @param endpoint the string to add to quizUrl
 * @returns The value of quizUrl with the endpoint parameter appended to it
 */
function fullQuizRoute(endpoint: string = ""): string {
    return `${quizUrl}${endpoint}`;
};


// account url functions

// appends the account api location to serverLocation
const accountUrl: string = `${serverLocation}/account`;

/**
 * Returns the value of accountUrl with the endpoint parameter appended to it
 * @param endpointthe string to add to accountUrl
 * @returns The value of accountUrl with the endpoint parameter appended to it
 */
function fullAccountRoute(endpoint: string): string {
    return `${accountUrl}${endpoint}`;
};

// account endpoints stored as properties of an object
export const accountUrls = {
    login: fullAccountRoute("/login"),
    forgotPassword: fullAccountRoute("/forgotPassword"),
    resetPassword: fullAccountRoute("/resetPassword"),
    register: fullAccountRoute("/register"),
    logout: fullAccountRoute("/logout"),
    manage: fullAccountRoute("/manage/info"), // for changing email and password
    refresh: fullAccountRoute("/refresh") // for refreshing access tokens
};


// these responses are used internally to determine the status of a request
// this object is used frequently throughout the entire SPA
export const apiTsResponses = {
    successString: "success",
    tokenIsStillValidString: "token is still valid",
    tokenIsCloseToExpiringString: "token is close to expiring",
    userIsUnauthenticatedString: "user is unauthenticated",
    errorString: "error",
    unauthenticatedString: "unauthenticated"
}

// these messages are used to show error messages to the client/front end
// this object is used frequently throughout the entire SPA
export const apiTsMessages = {
    // unknownErrorString: "Unable to connect to server, unknown error encountered during server request.",
    unknownErrorString: "Unknown error encountered during server request.",

    unknownNetworkErrorString: "Unable to connect to server, unexpected network error encountered during server request.\nPlease check your internet connection and try again.",
}


/**
 * Gets the token stored in the redux store
 * @returns the token in the redux store
 */
function getToken(): string {
    return selectToken(store.getState());
}

/**
 * Gets the token expiry time in the redux store
 * @returns the token expiry time in the redux store
 */
function getTokenExpiryTime(): number {
    return selectTokenExpiryTime(store.getState());
}

/**
 * Gets the refresh token in the redux store
 * @returns the refresh token in the redux store
 */
function getRefreshToken(): string {
    return selectRefreshToken(store.getState());
}


/**
 * Returns a header to use for all requests that don't need authentication.
 * Properties:
 * - 'Content-type': "application/json",
 * - 'accept': "application/json"
 * @returns a header with:
 * - 'Content-type': "application/json",
 * - 'accept': "application/json"
 */
function standardHeader(): HeadersInit {
    return {
        'Content-type': "application/json",
        'accept': "application/json"
    }
}

/**
 * Returns a header to use for all requests that need authentication.
 * Properties:
 * - 'Authorization': `Bearer ${access_token}`,
 * - 'Content-type': "application/json",
 * - 'accept': "application/json"
 * @returns a header with:
 * - 'Authorization': `Bearer ${token}`,
 * - 'Content-type': "application/json",
 * - 'accept': "application/json"
 */
function authHeader(): HeadersInit {
    const token = getToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-type': "application/json",
        'accept': "application/json"
    }
}


/**
 * Checks if there is a token saved in the store.
 * Checks how long the current token will remain valid for.
 * If the current token will expire in less than 5 minutes, a token refresh request will be made to the API. If this request fails then the current token, which is still valid, will be used instead.
 * Makes a token refresh request to the API if the current token is expired
 * @returns (All return values are properties of apiTsResponses)
 * Returns unauthenticated if the token is undefined, null or an empty string
 * Returns tokenIsStillValid if the current token has more than 5 minutes left before it expires
 * Returns success if the token was refreshed successfully
 * Returns tokenIsCloseToExpiring if there was an unsuccessful token refresh attempt made before the current token expired
 * Returns any of the responses from tokenRefreshAsync if the current token is expired
 */
async function refreshTokenIfCloseToExpiry(): Promise<string|undefined> {
    // const timeDifference = Date.now() - Number(getTokenExpiryDate);
    console.log("checking token");

    const token = getToken();
    const fiveMinutesInMilliseconds = 300000;

    if (token === undefined || token === null || token === "") { // user is unauthenticated
        console.log("unAuth");
        return apiTsResponses.unauthenticatedString;
    }

    // find how long the current token is still valid for
    const timeDifference = getTokenExpiryTime() - Date.now();

    if (timeDifference > fiveMinutesInMilliseconds) { // if timeDifference is greater than 5 minutes
        console.log("stillValid");
        return apiTsResponses.tokenIsStillValidString;
    }
    else if (timeDifference > 0) { // if timeDifference is between five minutes and 0
        // this else-if statement tries to refresh the token before it has expired, and does not throw an error if it encounters an error. Instead it will proceed with the request using the original token
        console.log("refreshing token, within 5 mins");
        const tokenResponse = await tokenRefreshAsync();

        if (tokenResponse === apiTsResponses.successString) {
            console.log("token was successfully refreshed during this request");
            return apiTsResponses.successString;
        }
        else {
            console.log("token is close to expiring. attempted to refresh token and failed, using original token for this request");
            return apiTsResponses.tokenIsCloseToExpiringString;
        }
    }
    else {
        console.log("tokenExpired, refreshing");
        return await tokenRefreshAsync();
    }
}

/**
 * Checks if a token refresh request resulted in an unsuccessful response (response status code >= 400) that might need to be displayed.
 * This function only checks for unsuccessful responses, network errors (response === undefined) return false
 * @param tokenResponse the response for the token refresh request
 * @returns true if the response status code is greater than or equal to 400, and false otherwise (returns false for networks errors/undefined responses)
 */
function checkForRefreshErrors(tokenResponse: (string|undefined)): boolean {
    return (
        tokenResponse !== undefined &&
        tokenResponse !== apiTsResponses.unauthenticatedString &&
        tokenResponse !== apiTsResponses.tokenIsStillValidString &&
        tokenResponse !== apiTsResponses.successString &&
        tokenResponse !== apiTsResponses.tokenIsCloseToExpiringString
    );
}


// quiz async API functions


/**
 * Makes a GET API request to get all of the saved quizzes for the current user
 * @returns Returns all of the saved quizzes for the current user if successful.
 * Returns a Problem Details response if there was an error.
 * If there was an error encountered while refreshing the token, returns the contents of the Problem Details response for the token refresh request. This is returned as a string, with each property separated by a line break ('\n').
 * Returns undefined if there was a network error or an unknown error
 */
export async function getQuizzesAsync(): Promise<Response | string | undefined> {
    try { // check status of access token
        const tokenResponse = await refreshTokenIfCloseToExpiry();
        if (checkForRefreshErrors(tokenResponse)) return tokenResponse; // return the response from the token refresh if it has error messages
    }
    catch (error) {
        console.log(`token refresh error: ${error}`);
        return undefined;
    }

    try {
        const response = await fetch(fullQuizRoute(), { // API request
            method: "GET",
            headers: authHeader()
        });
        printObject(response); // (optional) print response
        return response; // the index loader error handles this response
    }
    catch (error) { // network error
        console.log(`getQuizzesAsync() error: ${error}`);
    }
    return undefined;
}

/**
 * Makes a GET API request to get a list of generated questions for a new quiz
 * @param numberOfQuestions the number of questions to generate
 * @returns Returns the list of generated questions if successful.
 * Returns a Problem Details response if there was an error.
 * If there was an error encountered while refreshing the token, returns the contents of the Problem Details response for the token refresh request. This is returned as a string, with each property separated by a line break ('\n').
 * Returns undefined if there was a network error or an unknown error
 */
export async function generateQuestionsAsync(numberOfQuestions: number) {
    try { // check status of access token
        const tokenResponse = await refreshTokenIfCloseToExpiry();
        if (checkForRefreshErrors(tokenResponse)) return tokenResponse; // return the response from the token refresh if it has error messages
    }
    catch (error) {
        console.log(`token refresh error: ${error}`);
        return undefined;
    }

    try {
        const response = await fetch(fullQuizRoute(`/Questions/${numberOfQuestions}`), { // API request
            method: "GET",
            headers: authHeader()
        });
        printObject(response); // (optional) print response
        return response; // the create loader error handles this response
    }
    catch (error) { // network error
        console.log(`generateQuestionsAsync() error: ${error}`);
    }
    return undefined;
}


/**
 * Makes a POST API request to create a new quiz.
 * Updates the redux store with the new quiz if the API request was successful.
 * Returns the error message of the API request if it was unsuccessful
 * @param questions the questions to create the new quiz with
 * @param userAnswers the user's answers for the questions
 * @returns Returns apiTsResponses.successString if successful.
 * Returns the contents of the Problem Details response if there was an error. This is returned as a string, with each property separated by a line break ('\n').
 * Returns undefined if there was a network error or an unknown error
 */
export async function createQuizAsync(questions: string[], userAnswers: (number|null)[]): Promise<string | undefined> {
    try { // check status of access token
        const tokenResponse = await refreshTokenIfCloseToExpiry();
        if (checkForRefreshErrors(tokenResponse)) return tokenResponse; // return the response from the token refresh if it has error messages
    }
    catch (error) {
        console.log(`token refresh error: ${error}`);
        return undefined;
    }

    try {
        // (optional) print request body
        console.log(`body: ${JSON.stringify({
            questions: questions,
            userAnswers: userAnswers,
        })}`);

        const response = fetch(fullQuizRoute(), { // API request
            method: "POST",
            headers: authHeader(),
            body: JSON.stringify({ // request body
                questions: questions,
                userAnswers: userAnswers
            })
        })
            // check response
            .then((response) => {
                printObject(response); // (optional) print response
                if (response === undefined) throw response; // network error
                else if (response?.ok !== true) throw response; // response status code >= 400
                console.log(`createQuizAsync() success`);
                return response.json(); // success
            })
            // what to do if the request was successful
            .then((data: Quiz) => {
                console.log(`response: ${data}`)
                store.dispatch(addQuiz(data)); // add the new quiz from the API response to redux store
                return apiTsResponses.successString;
            })
            // what to do if there was a network error or response status >= 400
            .catch((error) => {
                return tryGetErrorMessageFromResponse(error);
            });
        return response;
    }
    catch (error) { // unknown error
        console.log(`createQuizAsync() unknown error: ${error}`);
    }
    return undefined;
}

/**
 * Makes a PATCH API request to edit an existing quiz.
 * Updates the redux store with the edited quiz if the API request was successful.
 * Returns the error message of the API request if it was unsuccessful
 * @param quizId the ID of the quiz to edit
 * @param userAnswers The user's new answers for the quiz
 * @returns Returns apiTsResponses.successString if successful.
 * Returns the contents of the Problem Details response if there was an error. This is returned as a string, with each property separated by a line break ('\n').
 * Returns undefined if there was a network error or an unknown error
 */
export async function editQuizAsync(quizId: number, userAnswers: (number | null)[]): Promise<string | undefined> {
    try { // check status of access token
        const tokenResponse = await refreshTokenIfCloseToExpiry();
        if (checkForRefreshErrors(tokenResponse)) return tokenResponse; // return the response from the token refresh if it has error messages
    }
    catch (error) {
        console.log(`token refresh error: ${error}`);
        return undefined;
    }

    try {
        // (optional) print request body
        console.log(`body: ${JSON.stringify({
            id: quizId,
            userAnswers: userAnswers,
        })}`);

        const response = fetch(fullQuizRoute(`/${quizId}`), { // API request
            method: "PATCH",
            headers: authHeader(),
            body: JSON.stringify({ // request body
                id: quizId,
                userAnswers: userAnswers,
            })
        })
            // check response
            .then((response) => {
                printObject(response); // (optional) print response
                if (response === undefined) throw response; // network error
                else if (response?.ok !== true) throw response; // response status code >= 400
                console.log(`editQuizAsync() success`);
                return response.json(); // success
            })
            // what to do if the request was successful
            .then((data: Quiz) => {
                console.log(`response: ${data}`)
                store.dispatch(editQuiz(data)); // update the quiz in the redux store with the newly edited quiz from the API response
                return apiTsResponses.successString;
            })
            // what to do if there was a network error or response status >= 400
            .catch((error) => {
                return tryGetErrorMessageFromResponse(error);
            });
        return response;
    }
    catch (error) { // unknown error
        console.log(`editQuizAsync() error: ${error}`);
    }
    return undefined;
}

/**
 * Makes a DELETE API request to delete a quiz.
 * Removes the quiz from the redux store if the API request was successful.
 * Returns the error message of the API request if it was unsuccessful
 * @param quizId the ID of the quiz to delete
 * @returns Returns apiTsResponses.successString if successful.
 * Returns the contents of the Problem Details response if there was an error. This is returned as a string, with each property separated by a line break ('\n').
 * Returns undefined if there was a network error or an unknown error
 */
export async function deleteQuizAsync(quizId: number): Promise<string | undefined> {
    try { // check status of access token
        const tokenResponse = await refreshTokenIfCloseToExpiry();
        if (checkForRefreshErrors(tokenResponse)) return tokenResponse; // return the response from the token refresh if it has error messages
    }
    catch (error) {
        console.log(`token refresh error: ${error}`);
        return undefined;
    }

    try {
        const response = fetch(fullQuizRoute(`/${quizId}`), { // API request
            method: "DELETE",
            headers: authHeader()
        })
            // check response
            .then((response) => {
                printObject(response); // (optional) print response
                if (response === undefined) throw response; // network error
                else if (response?.ok !== true) throw response; // response status code >= 400
                console.log(`deleteQuizAsync(${quizId}) success`);
                // success
                store.dispatch(removeQuiz(quizId)); // remove deleted quiz from the redux store
                return apiTsResponses.successString;
            })
            // what to do if there was a network error or response status >= 400
            .catch((error) => {
                return tryGetErrorMessageFromResponse(error);
            });
        return response;
    }
    catch (error) { // unknown error
        console.log(`deleteQuizAsync() error: ${error}`);
    }
    return undefined;
}


// account async API functions


/**
 * Makes a POST API request to get a new access token, by sending the refresh token to the refresh API endpoint.
 * If the API request was successful, the new access token and refresh token are stored in the redux store. The 'expiresIn' property is sent to the redux store, then the account slice uses it to re-calculate the token expiry time and update the store with it.
 * Returns the error message of the API request if it was unsuccessful
 * @returns Returns apiTsResponses.successString if successful.
 * Returns the contents of the Problem Details response if there was an error. This is returned as a string, with each property separated by a line break ('\n').
 * Returns undefined if there was a network error or an unknown error
 */
export async function tokenRefreshAsync(): Promise<string | undefined> {
    const refreshToken: string = getRefreshToken();

    try {
        // (optional) print request body
        console.log(`body: ${JSON.stringify({
            refreshToken: refreshToken
        })}`);

        const response = fetch(accountUrls.refresh, { // API request
            method: "POST",
            headers: standardHeader(),
            body: JSON.stringify({ // request body
                refreshToken: refreshToken
            })
        })
            // check response
            .then((response) => {
                printObject(response); // (optional) print response
                if (response === undefined) throw response; // network error
                else if (response?.ok !== true) throw response; // response status code >= 400
                console.log(`tokenRefreshAsync() success`);
                return response.json(); // success
            })
            // what to do if the request was successful
            .then((data) => {
                console.log(`response: ${printObject(data)}`); // (optional) print response data
                store.dispatch(tokenRefresh({ // update the account data in the redux store with the data from the API response
                    token: data.accessToken,
                    expiresIn: data.expiresIn, // the AccountSlice re-calculates the token expiry time using the 'expiresIn' property
                    refreshToken: data.refreshToken
                }));
                return apiTsResponses.successString;
            })
            // what to do if there was a network error or response status >= 400
            .catch((error) => {
                return tryGetErrorMessageFromResponse(error);
            });
        return response;
    }
    catch (error) { // unknown error
        console.log(`tokenRefreshAsync() error: ${error}`);
    }
    return undefined;
}

/**
 * Makes a POST API request for the user to log in to their account
 * If the API request was successful, the email (from the parameter), access token and refresh token (both from the response) are stored in the redux store. The 'expiresIn' property is sent to the redux store, then the account slice uses it to re-calculate the token expiry time and update the store with it.
 * Returns the error message of the API request if it was unsuccessful
 * @param email the email to log in with
 * @param password the password to log in with
 * @returns Returns apiTsResponses.successString if successful.
 * If unsuccessful (response status code >= 400), an error message is derived from the response status code and returned.
 * Returns undefined if there was a network error or an unknown error
 */
export async function loginAsync(email: string, password: string): Promise<string|undefined> {
    try {
        // (optional) print request body
        console.log(`body: ${JSON.stringify({
            email: email,
            password: password,
        })}`);
        console.log(`url: ${accountUrls.login}`)

        const response = fetch(accountUrls.login, { // API request
            method: "POST",
            headers: standardHeader(),
            body: JSON.stringify({ // request body
                email: email,
                password: password,
            })
        })
            // check response
            .then((response) => {
                printObject(response); // (optional) print response
                if (response === undefined) throw response; // network error
                else if (response?.ok !== true) throw response; // response status code >= 400
                console.log(`loginAsync() success`);
                return response.json(); // success
            })
            // what to do if the request was successful
            .then((data) => {
                console.log(`response: ${data}`)
                store.dispatch(login({  // update the account data in the redux store with the email parameter and the data from the API response
                    email: email,
                    token: data.accessToken,
                    expiresIn: data.expiresIn, // the AccountSlice calculates the token expiry time using the 'expiresIn' property of the response
                    refreshToken: data.refreshToken
                }));
                return apiTsResponses.successString;
            })
            // what to do if there was a network error or response status >= 400
            .catch((error) => {
                // error handling is different for the login request because responses from this endpoint have no content/body
                let errorMessage = "";
                try {
                    console.log(`loginAsync() fail: ${error}`);
                    console.log(`status: ${error.status}`);
                    switch (error.status) { // derive error message from response status code
                        case 401:
                            errorMessage = "Username and password not recognised";
                            break;

                        case 404:
                            errorMessage = "Unable to reach/locate server";
                            break;

                        default:
                            errorMessage = apiTsMessages.unknownErrorString;
                            break;
                    }
                    return errorMessage;
                }
                catch (ex) { // response was not a Response object. Most likely was undefined (network error)
                    console.log(`response from loginAsync() was most likely a network error: ${ex}`);
                    return apiTsMessages.unknownNetworkErrorString;
                }
            });
        return response;
    }
    catch (error) { // unknown error
        console.log(`loginAsync() error: ${error}`);
    }
    return undefined;
}

/**
 * Makes a POST API request to get the reset code for an account, this is used if the user has forgotton their password.
 * If the API request was successful, the reset code will be sent to the email address of the user's account*
 * Returns the error message of the API request if it was unsuccessful
 * *currently the reset code is logged to the API console instead because the API does not have an email sender set up
 * @param email the email of the user's account
 * @returns Returns apiTsResponses.successString if successful.
 * Returns the contents of the Problem Details response if there was an error. This is returned as a string, with each property separated by a line break ('\n').
 * Returns undefined if there was a network error or an unknown error
 */
export async function forgotPasswordAsync(email: string) {
    try {
        // (optional) print request body
        console.log(`body: ${JSON.stringify({
            email: email
        })}`);

        const response = await fetch(accountUrls.forgotPassword, { // API request
            method: "POST",
            headers: standardHeader(),
            body: JSON.stringify({ // request body
                email: email
            })
        })
            // check response
            .then((response) => {
                printObject(response); // (optional) print response
                if (response === undefined) throw response; // network error
                else if (response?.ok !== true) throw response; // response status code >= 400
                console.log(`forgotPasswordAsync() success`);
                // success
                return apiTsResponses.successString;
            })
            // what to do if there was a network error or response status >= 400
            .catch((error) => {
                return tryGetErrorMessageFromResponse(error);
            });
        return response;
    }
    catch (error) { // unknown error
        console.log(`forgotPasswordAsync() error: ${error}`);
    }
    return undefined;
}


/**
 * Makes a POST API request to reset the password of the user's account, using the password reset code that was sent to the user's email* in the forgot password request.
 * If the API request was successful, the password for the account will be updated to the newPassword parameter
 * Returns the error message of the API request if it was unsuccessful
 * *currently the reset code is logged to the API console instead because the API does not have an email sender set up
 * @param email the email of the account to process a password reset for
 * @param code the reset code for the account, that was sent after a successful 'forgot password' API request
 * @param newPassword the new password to update the account with
 * @returns Returns apiTsResponses.successString if successful.
 * Returns the contents of the Problem Details response if there was an error. This is returned as a string, with each property separated by a line break ('\n').
 * Returns undefined if there was a network error or an unknown error
 */
export async function resetPasswordAsync(email: string, code: string, newPassword: string) {
    try {
        // (optional) print request body
        console.log(`body: ${JSON.stringify({
            email: email,
            resetCode: code,
            newPassword: newPassword
        })}`);

        const response = await fetch(accountUrls.resetPassword, { // API request
            method: "POST",
            headers: standardHeader(),
            body: JSON.stringify({ // request body
                email: email,
                resetCode: code,
                newPassword: newPassword
            })
        })
            // check response
            .then((response) => {
                printObject(response); // (optional) print response
                if (response === undefined) throw response; // network error
                else if (response?.ok !== true) throw response; // response status code >= 400
                console.log(`resetPasswordAsync() success`);
                return apiTsResponses.successString;  // success
            })
            // what to do if there was a network error or response status >= 400
            .catch((error) => {
                return tryGetErrorMessageFromResponse(error);
            });
        return response;
    }
    catch (error) { // unknown error
        console.log(`resetPasswordAsync() error: ${error}`);
    }
    return undefined;
}

/**
 * Makes a POST API request to create a new account
 * If the API request was successful, a new account will be created with the email and password provided
 * Returns the error message of the API request if it was unsuccessful
 * @param email the email for the new account
 * @param password the password for the new account
 * @returns Returns apiTsResponses.successString if successful.
 * Returns the contents of the Problem Details response if there was an error. This is returned as a string, with each property separated by a line break ('\n').
 * Returns undefined if there was a network error or an unknown error
 */
export async function registerAsync(email: string, password: string) {
    try {
        // (optional) print request body
        console.log(`body: ${JSON.stringify({
            email: email,
            password: password,
        })}`);

        const response = await fetch(accountUrls.register, { // API request
            method: "POST",
            headers: standardHeader(),
            body: JSON.stringify({ // request body
                email: email,
                password: password,
            })
        })
            // check response
            .then((response) => {
                printObject(response); // (optional) print response
                if (response === undefined) throw response; // network error
                else if (response?.ok !== true) throw response; // response status code >= 400
                console.log(`registerAsync() success`);
                // success
                return apiTsResponses.successString;
            })
            // what to do if there was a network error or response status >= 400
            .catch((error) => {
                return tryGetErrorMessageFromResponse(error);
            });
        return response;
    }
    catch (error) { // unknown error
        console.log(`registerAsync() error: ${error}`);
    }
    return undefined;
}

/**
 * Makes a POST API request to log out the current user
 * If the API request was successful, the current user will be logged out
 * Returns the error message of the API request if it was unsuccessful
 * @returns Returns apiTsResponses.successString if successful.
 * Returns the contents of the Problem Details response if there was an error. This is returned as a string, with each property separated by a line break ('\n').
 * Returns undefined if there was a network error or an unknown error
 */
export async function logoutAsync() {
    try { // check status of access token
        const tokenResponse = await refreshTokenIfCloseToExpiry();
        if (checkForRefreshErrors(tokenResponse)) return tokenResponse; // return the response from the token refresh if it has error messages
    }
    catch (error) {
        console.log(`token refresh error: ${error}`);
        return undefined;
    }

    try {
        const response = await fetch(accountUrls.logout, { // API request
            method: "POST",
            headers: authHeader(),
            body: JSON.stringify({})  // request body (need to send an empty json for logout requests)
        })
            // check response
            .then((response) => {
                printObject(response); // (optional) print response
                if (response === undefined) throw response; // network error
                else if (response?.ok !== true) throw response; // response status code >= 400
                console.log(`logoutAsync() success`);
                // success
                store.dispatch(logout()); // clear and reset all of the account data in the redux store (email, token, tokenExpiryTime, refreshToken)
                return apiTsResponses.successString;
            })
            // what to do if there was a network error or response status >= 400
            .catch((error) => {
                return tryGetErrorMessageFromResponse(error);
            });
        return response;
    }
    catch (error) { // unknown error
        console.log(`logoutAsync() error: ${error}`);
    }
    return undefined;
}

/**
 * Makes a POST API request to change the email address of the user's account
 * If the API request was successful, an email confirmation link will be sent to the new email*. When the user clicks the link an API request will be made to process the email change request
 * Returns the error message of the API request if it was unsuccessful
 * *currently the email confirmation link is logged to the API console instead because the API does not have an email sender set up. The user must copy the link in the API console and paste it in their browser to process the email change request
 * @param newEmail the new email to update the account with
 * @returns Returns apiTsResponses.successString if successful.
 * Returns the contents of the Problem Details response if there was an error. This is returned as a string, with each property separated by a line break ('\n').
 * Returns undefined if there was a network error or an unknown error
 */
export async function changeEmailAsync(newEmail: string) {
    try { // check status of access token
        const tokenResponse = await refreshTokenIfCloseToExpiry();
        console.log(`tokenResponse: ${tokenResponse}`);
        if (checkForRefreshErrors(tokenResponse)) return tokenResponse; // return the response from the token refresh if it has error messages
    }
    catch (error) {
        console.log(`token refresh error: ${error}`);
        return undefined;
    }

    try {
        // (optional) print request body
        console.log(`body: ${JSON.stringify({
            newEmail: newEmail
        })}`);

        const token: string = getToken();

        const response = await fetch(accountUrls.manage, { // API request
            method: "POST",
            headers: authHeader(),
            body: JSON.stringify({ // request body
                newEmail: newEmail
            })
        })
            // check response
            .then((response) => {
                printObject(response); // (optional) print response
                if (response === undefined) throw response; // network error
                else if (response?.ok !== true) throw response; // response status code >= 400
                console.log(`changeEmailAsync() success`);
                // success
                return apiTsResponses.successString;
            })
            // what to do if there was a network error or response status >= 400
            .catch((error) => {
                return tryGetErrorMessageFromResponse(error);
            });
        return response;
    }
    catch (error) { // unknown error
        console.log(`changeEmailAsync() error: ${error}`);
    }
    return undefined;
}

/**
 * Makes a POST API request to change the password of the user's account
 * If the API request was successful, the password of the user's account will be updated to the value of the newPassword parameter
 * Returns the error message of the API request if it was unsuccessful
 * @param newPassword The new password to update the account with
 * @param oldPassword The current password of the account
 * @returns Returns apiTsResponses.successString if successful.
 * Returns the contents of the Problem Details response if there was an error. This is returned as a string, with each property separated by a line break ('\n').
 * Returns undefined if there was a network error or an unknown error
 */
export async function changePasswordAsync(newPassword: string, oldPassword: string) {
    try { // check status of access token
        const tokenResponse = await refreshTokenIfCloseToExpiry();
        if (checkForRefreshErrors(tokenResponse)) return tokenResponse; // return the response from the token refresh if it has error messages
    }
    catch (error) {
        console.log(`token refresh error: ${error}`);
        return undefined;
    }

    try {
        // (optional) print request body
        console.log(`body: ${JSON.stringify({
            newPassword: newPassword,
            oldPassword: oldPassword
        })}`);

        const response = await fetch(accountUrls.manage, { // API request
            method: "POST",
            headers: authHeader(),
            body: JSON.stringify({ // request body
                newPassword: newPassword,
                oldPassword: oldPassword
            })
        })
            // check response
            .then((response) => {
                printObject(response); // (optional) print response
                if (response === undefined) throw response; // network error
                else if (response?.ok !== true) throw response; // response status code >= 400
                console.log(`changePasswordAsync() success`);
                // success
                return apiTsResponses.successString;
            })
            // what to do if there was a network error or response status >= 400
            .catch((error) => {
                return tryGetErrorMessageFromResponse(error);
            });
        return response;
    }
    catch (error) { // unknown error
        console.log(`changePasswordAsync() error: ${error}`);
    }
    return undefined;
}

/**
 * Determines if the error parameter is a Response object or undefined by using a try block.
 * If the error is a Response object, returns the properties of the error's data/body as a string, where each property is separated by a line break ('\n'). Returns apiTsMessages.unknownError if no other error messages can be found in the Response object.
 * If the error is undefined, returns a partial error message if possible, or returns apiTsMessages.unknownNetworkErrorString if no other error messages are present
 * @param error the Response object or undefined value to produce an error message for
 * @returns If the error is a Response object, returns the properties of the error's data/body as a string, where each property is separated by a line break ('\n'). Returns apiTsMessages.unknownError if no other error messages can be found in the Response object.
 * If the error is undefined, returns a partial error message if possible, or returns apiTsMessages.unknownNetworkErrorString if no other error messages are present
 */
function tryGetErrorMessageFromResponse(error: (Response|undefined)) {
    let errorMessage = "";
    try { // treat error as a Response object with status >= 400, if it was a network error (undefined) then the catch block will deal with it
        console.log(`request fail: ${error}`);

        console.log(`status: ${error?.status}`);
        errorMessage = addErrorStatusToErrorMessage(error?.status); // add a message about the error status code to the error message

        return error?.text() // need to convert to string and then convert to JSON, because trying to parse an empty JSON response to JSON causes an error
            .then((stringData: string) => {
                try { // try to parse data as JSON, the catch block will handle non-JSON responses
                    const data = JSON.parse(stringData);

                    // (optional) print JSON data
                    console.log("error response object");
                    printObject(data);

                    // add problem details response properties to the error message
                    errorMessage += `\n${convertErrorPropertiesToString(data)}`;
                    console.log(errorMessage);

                    return errorMessage;
                }
                catch (ex) {
                    console.log(`response from request was not a json, or body was empty: ${ex}`);
                    if (errorMessage === "") {
                        return apiTsMessages.unknownErrorString;
                    }
                    else {
                        // return errorMessage if something was assigned to it before the exception occurred
                        return errorMessage;
                    }
                }
            })
    }
    catch (ex) {
        console.log(`response from request was most likely a network error: ${ex}`);
        if (errorMessage === "") {
            return apiTsMessages.unknownNetworkErrorString;
        }
        else {
            // return errorMessage if something was assigned to it before the exception occurred
            return errorMessage;
        }
    }
}

/**
 * Returns an error message derived from the HTTP status code supplied
 * @param errorStatus the HTTP status code to display an error message for
 * @returns the error messsage dereived from the HTTP status code
 */
export function addErrorStatusToErrorMessage(errorStatus: number): string {
    console.log(`errorStatus: ${errorStatus}`);
    switch (errorStatus) {
        case 400:
            return "The server refused to process request";

        case 401:
            return "Unauthorized";

        case 404:
            return "Unable to reach/locate server";

        case 500:
            return "The server encountered an error while processing the request";

        default:
            return "Unknown error encountered during server request";
    }
}

/**
 * Converts the properties of a Problem Details response to a string, where each property is separated by a line break ('\n')
 * @param data the Problem Details response to convert to a string
 * @returns the properties of the Problem Details response to a string, where each property is separated by a line break ('\n')
 */
export function convertErrorPropertiesToString(data: any): string {
    let propertiesToIgnore: string[] = ["exception"]; // do not display details about exceptions
    if (Object.hasOwn(data, "exception")) { // hide these properties if there is an exception in the Problem Details response
        propertiesToIgnore.push("title");
        propertiesToIgnore.push("detail");
    }
    // if there is an exception in the response, the above properties expose too many details about the server implementation, hackers can use this information to find vulnerabilities

    let errorMessage: string = "";
    for (let property in data) {
        // this is needed because 'errors' is a nested object in the Problem Details response object, so need to iterate through its properties
        if (property === "errors" && !propertiesToIgnore.includes("errors")) {
            // the 'errors' property is used for validation error messages
            errorMessage += "\nerrors:"
            for (let error in data.errors) {
                errorMessage += `\n- ${error}: ${data.errors[error]}`; // add a line break, the error name and the error value to the error message
            }
        }
        else if (!propertiesToIgnore.includes(property)) {
            errorMessage += `\n${property}: ${data[property]}`; // add a line break, the property name and the property value to the error message
        }
    }
    console.log(`errorMessageToString: ${errorMessage}`)
    return errorMessage;
}

/**
* Prints all of the property names and values of an object to the console 
* @param object the object to print to the console
*/
export function printObject(object: any) {
    console.log("object:")
    try {
        for (let property in object) {
            console.log(`${property}: ${object[property]}`);
        }
    }
    catch (error) {
        console.log(`${object}\nerror while logging: ${error}`)
    }
}