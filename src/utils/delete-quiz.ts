import { apiTsResponses, deleteQuizAsync } from "../api";

/**
 * Makes a request to the API to delete a quiz
 * Displays error messages as alerts if the request is unsuccessful
 * @param quizId The ID of the quiz to delete
 * @returns a 2-tuple, where the first element is a value from apiTsResponses that indicates the status of the response and the second element is a message about the request
 */
export async function deleteQuizHelperAsync(quizId: number): Promise<string[] | undefined> {
    const response = await deleteQuizAsync(quizId); // API request

    switch (response) {
        case apiTsResponses.successString: // request was successful
            const successMessage = "Quiz successfully deleted"
            alert(successMessage);
            return [apiTsResponses.successString, successMessage]; // currently none of the pages use the successMessage part of this return value

        case undefined: // network error
            const errorMessage: string = "Unable to connect to server, unexpected network error encountered during server request.\nPlease check your internet connection and try again."
            alert(errorMessage);
            return [apiTsResponses.errorString, errorMessage];

        default: // response status code is >= 400
            alert(response);
            return [apiTsResponses.errorString, response];
    }
}