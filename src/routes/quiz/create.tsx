import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { addErrorStatusToErrorMessage, apiTsMessages, apiTsResponses, convertErrorPropertiesToString, createQuizAsync, generateQuestionsAsync, printObject } from "../../api";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { answerRegex, checkAnswerMax, checkAnswerMin, checkAnswerPattern, maximumAnswerValue, minimumAnswerValue, parseIntAndErrorHandle } from "../../utils/quiz-submit-scripts";
import LoadingMessage from "../../components/loading-message";
import Title from "../../components/title";
import { selectToken } from "../../redux/accountSlice";
import { store } from "../../redux/store";
import IndexLink from "../../components/index-link";
import { checkResponse } from "../../utils/check-response";
import { Form } from "semantic-ui-react";


// the number of questions to generate for a new quiz
const numberOfQuestions: number = 10;

/**
 * Loader for the create route.
 * Makes an API request to generate a set of questions for a new quiz.
 * @returns A 2-tuple> The first element is a value from apiTsResponses that indicates the status of the response.
 * - If the request was successful, the second value of the 2-tuple is the list of questions from the request
 * - If the request was unsuccessful, the second value of the 2-tuple is the error message for the request
 */
export async function loader(): Promise<[string, any | undefined]> {
    console.log("create loader called");

    /*
    check if the user is authenticated
    this is endpoint is protected by the RequireAuthentication component, but the create loader still runs regardless if RequireAuthentication allows access to the page or not
    */
    const token = selectToken(store.getState());
    if (token === undefined || token === null || token === "") {
        return [apiTsResponses.unauthenticatedString, undefined];
    }

    const response = generateQuestionsAsync(numberOfQuestions) // API request
        // the above function from api.ts does not check or error handle the response.checking and error handling is done here by the create loader
        .then((response) => {
            if (response === undefined) throw response; // most likely a network error
            else if (response?.ok !== true) throw response; // response status code >= 400
            return response?.json(); // success
        })
        // what to do if the request is successful
        .then((data) => {
            console.log(`create loader (generateQuestionsAsync(${numberOfQuestions})) success: ${data}`);
            return [apiTsResponses.successString, data];
        })
        // what to do if there was a network error or response status >= 400
        .catch((error: (Response|undefined)) => {
            let errorMessage = "";
            try { // treat error as a Response object with status >= 400, if it was a network error (undefined) then the catch block will deal with it
                console.log(`generateQuestionsAsync() fail: ${error}`);

                errorMessage = addErrorStatusToErrorMessage(error?.status); // add a message about the error status code to the error message
                console.log(`status: ${error?.status}`);

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

                            return [apiTsResponses.errorString, errorMessage];
                        }
                        catch (ex) {
                            console.log(`response from request was not a json, or body was empty: ${ex}`);
                            if (errorMessage === "") {
                                return [apiTsResponses.errorString, apiTsMessages.unknownErrorString];
                            }
                            else {
                                // return errorMessage if something was assigned to it before the exception occurred
                                return [apiTsResponses.errorString, errorMessage];
                            }
                        }
                    })
            }
            catch (ex) {
                console.log(`response from generateQuestionsAsync() was most likely a network error: ${ex}`);
                if (errorMessage === "") {
                    return [apiTsResponses.errorString, apiTsMessages.unknownNetworkErrorString];
                }
                else {
                    // return errorMessage if something was assigned to it before the exception occurred
                    return [apiTsResponses.errorString, errorMessage];
                }
            }
        });
    return response; // the above code does not return undefined, but typescript thinks it does
}


/**
 * Renders a page with a form. The form has a list of questions, and each question has an answer box below it.
 * 
 * Displays a submit button after all questions and answer boxes, which makes an API request to create a new quiz from the questions and answers in the form. If the API request is successful the user will be redirected to the index route.
 * 
 * Displays a link after the submit button, to navigate back to the index route
 * @returns A Create JSX Component
 */
export default function Create() {
    const [responseString, data] = useLoaderData(); // get return value from loader
    console.log(`loaderData: ${responseString}, ${data}`);
    
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<string[]>([]); // this variable used to check if the API GET request was successful
    
    // get minimum and maximum answer values from quiz-submit-scripts.ts
    const minAnswerValue = minimumAnswerValue;
    const maxAnswerValue = maximumAnswerValue;

    /*
    validation for this form is done using Yup
    the data submitted as a list of [question, answer] 2-tuples
    questions are required (this is automatically populated in useEffect())
    answers must be:
    - an integer (a number without decimals)
    - greater than or equal to minAnswerValue (currently -500)
    - less than or equal to maxAnswerValue (currently 500)
    */
    const validationSchema = yup.object().shape({
        questionsAndAnswers: yup.array().of(
            yup.object().shape({
                question: yup.string()
                    .required("Question is required"),
                answer: yup.string() // if answer is type "number" then no answer (null/NaN/undefined) is invalid, i dont want to block form submit if a question is left unanswered 
                    .test(
                        "Answer must be a whole number (a number without decimals)", // name
                        "Answer must be a whole number (a number without decimals)", // message
                        (answer) => checkAnswerPattern(answer, answerRegex)) // test function
                    .test(
                        `Answer must be less than ${maxAnswerValue}`,
                        `Answer must be less than ${maxAnswerValue}`,
                        (answer) => checkAnswerMax(answer, maxAnswerValue))
                    .test(
                        `Answer must be greater than ${minAnswerValue}`,
                        `Answer must be greater than ${minAnswerValue}`,
                        (answer) => checkAnswerMin(answer, minAnswerValue))
            }))
    });

    const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: yupResolver(validationSchema) });

    /** this form uses a FieldArray.
     * FieldArray is used to add the questions to the form data, despite them not being inputs.
     * It is also better at dealing with changes to the number of questions
     */
    const { fields, replace } = useFieldArray({ name: "questionsAndAnswers", control });


    if (responseString === apiTsResponses.unauthenticatedString) {
        // redirect to login if the user is unauthenticated
        navigate("/login", { replace: true });
    }


    /**
     * Confirms the action with the user, and then makes a create quiz request to the API using the form data.
     * If this is successful the user will be redirected to the index route
     * @param data The form data
     */
    async function handleCreateQuizAsync(data: any) {
        console.log(data);
        if (confirm("Please confirm that you want to submit your answers")) {
            /** convert form data to the format that the API expects
             * also converts answers from string to integer, any answer that cannot be parsed to integer are replaced with null (unanswered)
             * (the form data is currently a list of [question, answer] 2-tuples, but the API expects a list of questions and a list of answers)
             */
            let newQuizQuestions: string[] = []; // named differently to avoid confusion between this variable and the "questions" state variable 
            let newQuizUserAnswers: (number|null)[] = [];
            data.questionsAndAnswers.forEach((qAndA: any) => {
                newQuizQuestions.push(qAndA.question);
                newQuizUserAnswers.push(parseIntAndErrorHandle(qAndA.answer));
            });

            // (optional) print request body
            console.log(`questions:`)
            console.log(`-- answers:`)
            newQuizQuestions.forEach((newQuizQuestion, i) => {
                console.log(`- ${newQuizQuestion}`)
                console.log(`- - ${newQuizUserAnswers[i]}`)
            })

            try {
                const response = await createQuizAsync(newQuizQuestions, newQuizUserAnswers); // API request
                console.log(`response: ${response}`);

                if (checkResponse(response)) { // check if response was successful (checkResponse handles displaying error messages as alerts)
                    alert("Quiz successfully created");
                    navigate("/", { replace: true }); // navigate to index if successful
                }
            }
            catch (error) {
                console.log(`handleCreateQuiz() error: ${error}`);
                alert(apiTsMessages.unknownErrorString);
            }
        }
    }

    /**
     * if the loader API request was unsuccessful, this function displays the error message
     * if the loader API request was successful, this function sets the questions state variable and populates the FieldArray with the questions from the API request
     */
    useEffect(() => {
        console.log("useEffect called");
        if (responseString === apiTsResponses.successString) {
            console.log(`response success`);
            setQuestions(data);
            console.log("resetting fieldArray and adding questions to it");
            
            let questionsAndAnswers: any[] = [];
            //using data instead of questions, because questions is a state and will update on react's next render, so it may still be an empty list for this code
            data.forEach((question: string, index: number) => {
                console.log(`question ${index}: ${question}`);
                questionsAndAnswers.push({ question: question, answer: "" });
            });

            // (optional) print field array before it is assigned
            console.log(`objects: ${questionsAndAnswers}`);
            questionsAndAnswers.forEach((qAndA, index) => {
                console.log(`object${index}: {${qAndA.question}, ${qAndA.answer}}`);
            })
            
            replace(questionsAndAnswers); // assign questionsAndAnswers object to FieldArray
        }
        else if (responseString === apiTsResponses.errorString) {
            console.log(`response error`);
            alert(data); // display alert for error message
        }
        else {
            // responseString should be unauthenticated if this code was reached
            if (responseString !== apiTsResponses.unauthenticatedString) {
                console.log("This part of the useEffect function should only be reached if the user is unauthenticated");
                console.log(`responseString is not unauthenticated, value: ${responseString}`);
            }
        }
    }, [responseString, data]); // these variables are needed. without them if the user clicks "New Quiz" in the navbar from this page, the page wont be updated with the newly requested questions

    // API request was unsuccessful
    if (questions === null || questions === undefined || questions.length <= 0) {
        return (
            <p className="text-center">
                Unable to retreive questions for new quiz
            </p>
        );
    }
    else {
        return (
            <>
                <Title
                    title={"New Quiz"}
                    extraContent={
                        <Link
                        // this button re-navigates to this route, and calls the create loader again, which then makes another API request to get another set of questions
                            className="btn btn-outline-primary text-dark"
                            to={`../create`}>
                            Re-generate Quiz
                        </Link>}
                />

                <div className="row">
                    <div className="col">

                        <Form onSubmit={handleSubmit(async (data) => await handleCreateQuizAsync(data))}>

                            {fields.map((field, index: number) => // display for each row in the FieldArray
                                <div key={index} className="mb-3">

                                    <label className="control-label">{field.question}</label> {/* display question */}

                                    <div className="d-flex">
                                        <input // display input, and register it to the FieldArray
                                            className="form-control answer-box p-2 form-element"
                                            {...register(`questionsAndAnswers.${index}.answer`)}
                                        />

                                        <div
                                            className="text-danger px-2"> {/* display any errors */}
                                            {errors.questionsAndAnswers?.[index]?.answer?.message}
                                        </div>
                                    </div>

                                </div>
                            )}

                            {isSubmitting && // display message if the quiz is being submitted
                                <LoadingMessage message={"Submitting quiz"} markup="h5" />}

                            <button
                                className="btn btn-outline-primary text-dark"
                                type="submit">
                                Submit
                            </button>

                        </Form>

                        <div className="my-2">
                            <IndexLink />
                        </div>

                    </div>
                </div>
            </>
        );
    }
}