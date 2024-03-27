import { apiTsMessages, apiTsResponses } from "../api";

/**
 * Checks the response from the api.ts method that made an API call. Creates an alert if the response was unsuccessful.
 * @param response The response from the api.ts method
 * @returns True if the response was apiTsResponses.successString, returns false otherwise
 */
export function checkResponse(response: (string|undefined)): boolean {
    switch (response) {
        case apiTsResponses.successString: // successful API request
            return true;

        case undefined: // network error during API request
            alert(apiTsMessages.unknownNetworkErrorString);
            return false;

        default: // unsuccessful API request (response status code >= 400)
            alert(response);
            return false;
    }
}