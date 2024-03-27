import { Link, useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import { Quiz } from '../../quiz';
import { addErrorStatusToErrorMessage, apiTsMessages, apiTsResponses, convertErrorPropertiesToString, getQuizzesAsync, printObject } from '../../api';
import { useState } from 'react';
import Title from '../../components/title';
import DetailsLink from '../../components/details-link';
import EditLink from '../../components/edit-link';
import DeleteButton from '../../components/delete-button';
import { selectToken } from '../../redux/accountSlice';
import { store } from '../../redux/store';
import { replaceQuizzes, selectQuizzes } from '../../redux/quizzesSlice';
import { scorePercentage } from '../../utils/scorePercentage';
import { useAppSelector } from '../../redux/hooks';
import { deleteQuizHelperAsync } from '../../utils/delete-quiz';
import LoadingMessage from '../../components/loading-message';
import { displayDateTime } from '../../utils/display-date-time';


/**
 * Loader for the index route.
 * Makes an API request to get all of the quizzes for the current user if one of the following is true:
 * - The quizzes in the redux store is undefined, null or an empty list (length <= 0)
 * - The "reSync" query string parameter is "true"
 * After this the quizzes are sorted according to the "sortBy" parameter and dispatched to the redux store, replacing the quizzes currently in it
 * @param request the url that the user navigated to
 * @returns Returns null if the request was successful, and returns the error message of the request if it was unsuccessful
 */
export async function loader({ request }: any): Promise<string|null> {
    console.log(`index loader called`);

    // retrieve url, and find the values of sortBy and reSync
    const url = new URL(request.url);
    const sortBy = url.searchParams.get("sortBy");
    const reSync = url.searchParams.get("reSync");
    console.log(`loader sortBy: ${sortBy}`);
    console.log(`loader reSync: ${reSync}`);

    /*
    check if the user is authenticated
    this is endpoint is protected by the RequireAuthentication component, but the index loader still runs regardless if RequireAuthentication allows access to the page or not
    */
    const token = selectToken(store.getState());
    if (token === undefined || token === null || token === "") {
        return apiTsResponses.unauthenticatedString;
    }

    // get quizzes from the redux store and check if it is undefined, null or an empty list (length <= 0), or if reSync = true
    const quizzes: Quiz[] = selectQuizzes(store.getState());
    if (quizzes === undefined || quizzes === null || quizzes.length <= 0 || reSync === "true") {
        console.log("getting quizzes from server")
        const response = getQuizzesAsync() // API request
            // the above function from api.ts does not check or error handle the response.checking and error handling is done here by the index loader
            .then((response: (Response|string|undefined)) => {
                if (response === undefined) throw response; // most likley a network error
                else if (response?.ok !== true) throw response; // response status code >= 400
                return response.json(); // success
            })
            // what to do if the request was successful
            .then((data) => {
                console.log(`index loader (getQuizzesAsync()) success: ${data}`);
                sortAndDispatchQuizzes(data, sortBy);
                return null;
            })
            // what to do if there was a network error or response status >= 400
            .catch((error: (Response|undefined)) => {
                let errorMessage = "";
                try { // treat error as a Response object with status >= 400, if it was a network error (undefined) then the catch block will deal with it
                    console.log(`getQuizzesAsync() fail: ${error}`);

                    errorMessage = addErrorStatusToErrorMessage(error?.status); // add a message about the error status code to the error message
                    console.log(`status: ${error?.status}`);

                    /* this code should be redundant, but i left it here in case it was actually needed
                    if (error?.body === null || error?.body === null) {
                        return error?.status
                    }
                    */

                    return error?.text() // need to convert to string and then convert to JSON, because trying to parse an empty JSON response to JSON causes an error
                        .then((stringData: any) => {
                            try { // try to parse data as JSON, the catch block will handle non-JSON responses
                                const data = JSON.parse(stringData);

                                // (optional) print JSON response
                                console.log("error response object");
                                printObject(data);

                                // add problem details response properties to the error message
                                errorMessage += `\n${convertErrorPropertiesToString(data)}`;
                                console.log(errorMessage);

                                return errorMessage;
                            }
                            catch (ex) {
                                console.log(`response from request was not a json, or body was empty ${ex}`);
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
                    console.log(`response from getQuizzesAsync() was most likely a network error: ${ex}`);
                    if (errorMessage === "") {
                        return apiTsMessages.unknownNetworkErrorString;
                    }
                    else {
                        // return errorMessage if something was assigned to it before the exception occurred
                        return errorMessage;
                    }
                }
            });
        console.log(`loader return value: ${response}`);
        return response; // the above code does not return undefined, but typescript thinks it does
    }
    else {
        // the quizzes object in the store is already populated with something, just need to re-sort it using the "sortBy" parameter 
        console.log("re-sorting redux quizzes");
        sortAndDispatchQuizzes(quizzes, sortBy);
    }
    /*
    the user's quizzes have already been fetched from server
    loaders cannot return undefined, so return null instead
    */
    console.log("loader return value: null");
    return null;
}

/**
 * Sorts the quizzes according to the value of "sortBy"
 * Does not return anything, this function replaces the quizzes in the redux store with the sorted quizzes instead
 * @param quizzes the quizzes to sort
 * @param sortBy determines how to sort the quizzes:
 * - id_Ascending - sort by id, ascending
 * - id_Descending - sort by id, descending
 * - scorePercentage_Ascending - sort by scorePercentage, ascending
 * - scorePercentage_Descending - sort by scorePercentage, descending
 * - dateTime_Ascending - sort by creation date and time, ascending
 * - dateTime_Descending (default) - sort by creation date and time, descending
 */
function sortAndDispatchQuizzes(quizzes: Quiz[], sortBy: (string|null)): undefined {
    let sortedQuizzes = [...quizzes];
    console.log("sorting quizzes");

    switch (sortBy) {
        case "id_Ascending":
            console.log("id ascending");
            sortedQuizzes = sortedQuizzes.sort((first: Quiz, second: Quiz) => {
                return first.id - second.id;
            })
            break;

        case "id_Descending":
            console.log("id descending");
            sortedQuizzes = sortedQuizzes.sort((first: Quiz, second: Quiz) => {
                return second.id - first.id;
            })
            break;

        case "scorePercentage_Ascending":
            console.log("score ascending");
            sortedQuizzes = sortedQuizzes.sort((first: Quiz, second: Quiz) => {
                return scorePercentage(first) - scorePercentage(second);
            })
            break;

        case "scorePercentage_Descending":
            console.log("score descending");
            sortedQuizzes = sortedQuizzes.sort((first: Quiz, second: Quiz) => {
                return scorePercentage(second) - scorePercentage(first);
            })
            break;

        case "dateTime_Ascending":
            console.log("date ascending");
            sortedQuizzes = sortedQuizzes.sort((first: Quiz, second: Quiz) => {
                return Number(new Date(first.creationDateTime)) - Number(new Date(second.creationDateTime));
            })
            break;

        default: // "dateTime_Descending"
            console.log("default (dateTime_Descending)");
            sortedQuizzes = sortedQuizzes.sort((first: Quiz, second: Quiz) => {
                return Number(new Date(second.creationDateTime)) - Number(new Date(first.creationDateTime));
            })
            break;
    }

    // (optional) print quizzes
    console.log("sorted Quizzes");
    sortedQuizzes.forEach(quiz => {
        console.log(quiz.score);
    })
    // replace quizzes in the store with the sorted quizzes
    store.dispatch(replaceQuizzes(sortedQuizzes));
}


/**
 * Renders a page with all of the user's saved quizzes. Displays the following for each quiz:
 * - ID
 * - Date and time of creation
 * - Score (as a percentage)
 * - Score
 * - Links to view, edit and delete the quiz
 * @returns An Index JSX Component
 */
export default function Index() {
    const navigate = useNavigate();

    /*
    this map is used to display a loading message next to a quiz while it is being deleted

    if a quiz with id = 3 is being deleted, the map is updated with the entry: [Key: 3, Value: true], once the delete request is finished then the map is updated with the entry: [Key: 3, Value: false]

    If any entry is set to true (e.g [Key: 4, Value: true]), a message will be rendered next to the corressponding quiz (quiz with ID = 4 for this example)
    */
    const [deletingQuizMap, setDeletingQuizMap] = useState<Map<number, boolean>>(new Map<number, boolean>);

    const [searchParams, setSearchParams] = useSearchParams();
    const sortBy = searchParams.get("sortBy"); // used to set the links for the table headings
    console.log(`sortBy: ${sortBy}`);

    const quizzes: Quiz[] = useAppSelector(selectQuizzes); // get quizzes from store

    const error = useLoaderData(); // get the error message (if any) from the index loader

    if (error === apiTsResponses.unauthenticatedString) {
        // redirect to login if the user is unauthenticated
        navigate("/login", { replace: true });
    }
    else if (error !== undefined && error !== null && error !== "") {
        // make an alert for error
        alert(error);
    }

    /**
     * Replaces the deletingQuizMap with a new map and adds the record [Key: quizId, Value: value] to it
     * @param quizId the id of the quiz, which is used as the key for the new record in the new map
     * @param value the value of the new record in the new map
     */
    function updateDeletingQuizState(quizId: number, value: boolean) {
        setDeletingQuizMap(new Map<number, boolean>().set(quizId, value));
    }


    /**
     * Confirms the action with the user, and then makes a delete quiz request to the API using the ID of the quiz to delete.
     * If this is successful the user's list of quizzes will be updated.
     * Displays error messages as an alert if unsuccessful
     * @param quizId the ID of the quiz to delete
     */
    async function handleDeleteQuizAsync(quizId: number): Promise<void> {
        if (confirm(`Please confirm that you want to delete this quiz (ID: ${quizId})`)) {
            updateDeletingQuizState(quizId, true); // display a message while deleting this quiz

            const [deleteStatus, deleteMessage] = await deleteQuizHelperAsync(quizId); // this function will create alerts if there are errors

            // (optional) print deletingQuizMap
            console.log("map:")
            deletingQuizMap.forEach((value, key) => {
                console.log(`k: ${key}, v: ${value}`)
            })

            updateDeletingQuizState(quizId, false); // stop displaying the deleting message for the quiz
        }
    }

    // If there are no quizzes to display
    if ((!Array.isArray(quizzes)) || quizzes.length <= 0) {
        return (
            <>
                <p className="text-center">
                    You have no quizzes, you can take a quiz by clicking <Link to={`../create`}>here</Link>
                </p>
            </>
        );
    }
    else {
        return (
            <>
                <Title
                    title={"Saved Quizzes"}
                    extraContent={
                        <Link // button to reload this page and make a new getQuizzes request, even if the quizzes object in the store is already populated with data
                            className="btn btn-outline-primary text-dark"
                            to={"/?reSync=true"}>
                            Re-sync Quizzes With Server
                        </Link>}
                />

                <div className="row justify-content-center text-center">
                    {/* These divs currently do nothing, but were left in because they are a good way to separate the page titles and headings from the page body */}
                    <div className="col">

                        <table className="table table-sm table-hover">
                            <thead>
                                <tr>
                                    <th className="col-1">
                                        <Link
                                            to={sortBy === "id_Ascending" ? // set links based on the current value of sortBy
                                                "/?sortBy=id_Descending"
                                                :
                                                "/?sortBy=id_Ascending"}>
                                            ID
                                        </Link>
                                    </th>

                                    <th className="col-5">
                                        <Link
                                            to={sortBy === "dateTime_Ascending" ?
                                                "/?sortBy=dateTime_Descending"
                                                :
                                                "/?sortBy=dateTime_Ascending"}>
                                            Date and Time of Creation
                                        </Link>
                                    </th>

                                    <th className="col-1">
                                        <Link
                                            to={sortBy === "scorePercentage_Ascending" ?
                                                "/?sortBy=scorePercentage_Descending"
                                                :
                                                "/?sortBy=scorePercentage_Ascending"}>
                                            Score (%)
                                        </Link>
                                    </th>

                                    <th className="col-1">
                                        Score
                                    </th>

                                    <th className="col-4">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {quizzes.map((quiz, index) => // display each quiz in quizzes
                                    <tr key={quiz.id}>
                                        <td>
                                            {quiz.id}
                                        </td>

                                        <td>
                                            {displayDateTime(quiz.creationDateTime)}
                                        </td>

                                        <td>
                                            {scorePercentage(quiz)}%
                                        </td>

                                        <td>
                                            {quiz.score}/{quiz.questions.length}
                                        </td>

                                        <td className="text-middle">

                                            <DetailsLink
                                                quizId={quiz.id}
                                                linkText={"View"}
                                            />
                                            {/* Displays " | " between each link */}
                                            &nbsp;|&nbsp;

                                            <EditLink
                                                quizId={quiz.id}
                                                linkText={"Edit"}
                                            />
                                            &nbsp;|&nbsp;

                                            <DeleteButton
                                                quizId={quiz.id}
                                                deleteFunction={handleDeleteQuizAsync}
                                                buttonText={"Delete"}
                                            />

                                            {(deletingQuizMap.get(quiz.id) === true) && // display message while quiz is being deleted
                                                <LoadingMessage message={`Deleting Quiz (ID: ${quiz.id})`} />}

                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <p className="text-center">
                            <Link
                                className="btn btn-outline-primary text-dark"
                                to={`../create`}>
                                New Quiz
                            </Link>
                        </p>

                    </div>
                </div>
            </>
        );
    }
}