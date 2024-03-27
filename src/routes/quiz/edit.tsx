import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Quiz } from "../../quiz";
import * as yup from "yup";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { answerRegex, checkAnswerMax, checkAnswerMin, checkAnswerPattern, maximumAnswerValue, minimumAnswerValue, parseIntAndErrorHandle } from "../../utils/quiz-submit-scripts";
import { apiTsMessages, apiTsResponses, editQuizAsync } from "../../api";
import { Form } from "semantic-ui-react";
import { checkResponse } from "../../utils/check-response";
import { deleteQuizHelperAsync } from "../../utils/delete-quiz";
import Title from "../../components/title";
import QuizInfo from "../../components/quiz-info";
import LoadingMessage from "../../components/loading-message";
import IndexLink from "../../components/index-link";
import DetailsLink from "../../components/details-link";
import DeleteButton from "../../components/delete-button";
import { useAppSelector } from "../../redux/hooks";
import { selectQuizzes } from "../../redux/quizzesSlice";


interface editParams {
    quizId?: string // the ID of the quiz to display and edit form for
}

/**
 * Renders a page with a form.
 * The form has a list of questions from an existing quiz.
 * Each question has an answer box below it, which is pre-filled with the saved user answer for the question.
 * 
 * Displays a submit button after all questions and answer boxes, which makes an API request to update the quiz with the new user answers in the form. If the API request is successful the user will be redirected to the index route.
 * 
 * Below the form there are links to:
 * - Navigate back to index route
 * - View the quiz (navigate to the details page for the quiz)
 * - Delete the quiz
 * If the user successfully deletes the quiz they will be redirected to the index route
 * @returns An Edit JSX Component
 */
export default function Edit() {
    const navigate = useNavigate();

    const [deletingQuiz, setDeletingQuiz] = useState<boolean>(false); // used to display a message while the quiz is being deleted

    const { quizId }: editParams = useParams(); // get quiz ID from quizId parameter
    const quiz: (Quiz | undefined) = useAppSelector(selectQuizzes).find(q => q.id === parseInt(quizId, 10)); // finds and sets the quiz, or returns undefined if the quiz cannot be found


    // get minimum and maximum answer values from quiz-submit-scripts.ts
    const minAnswerValue = minimumAnswerValue;
    const maxAnswerValue = maximumAnswerValue;

    /*
    validation for this form is done using Yup
    the data submitted as a list of answers
    answers must be:
    - an integer (a number without decimals)
    - greater than or equal to minAnswerValue (currently -500)
    - less than or equal to maxAnswerValue (currently 500)
    */
    const validationSchema = yup.object().shape({
        editedAnswers: yup.array().of(
            yup.object().shape({
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
     * FieldArray is used to be consistent with the create page
     */
    const { fields, append, replace } = useFieldArray({ name: "editedAnswers", control });


    /**
    * Confirms the action with the user, and then makes an update/edit quiz request to the API using the form data.
    * If this is successful the user will be redirected to the index route
    * @param data The form data
    */
    async function handleEditQuizAsync(data: any) {
        console.log(data);
        if (confirm("Please confirm that you want to submit your answers")) {
            /** convert form data to the format that the API expects
             * also converts answers from string to integer, any answer that cannot be parsed to integer are replaced with null (unanswered)
             * (the form data is currently an editedAnswers object with a list of answers, but the API expects a quiz ID and a list of answers, the quiz ID is added to the request body later in this function)
             */
            let userAnswers: (number | null)[] = [];
            data.editedAnswers.forEach((row: any) => {
                userAnswers.push(parseIntAndErrorHandle(row.answer));
            });

            // (optional) print request body
            console.log(`answers to send:`)
            userAnswers.forEach((answer, i) => {
                console.log(`${i} - ${answer}`)
            })

            try {
                const response = await editQuizAsync(quiz.id, userAnswers); // API request
                console.log(`response: ${response}`);
                
                if (checkResponse(response)) { // check if response was successful (checkResponse handles displaying error messages as alerts)
                    alert("Quiz successfully updated");
                    navigate("/", { replace: true }); // navigate to index if successful
                }
            }
            catch (error) {
                console.log(`handleEditQuizAsync() error: ${error}`);
                alert(apiTsMessages.unknownErrorString);
            }
        }
    }


    /**
     * Confirms the action with the user, and then makes a delete quiz request to the API using the ID of this quiz.
     * If this is successful the user will be redirected to the index route.
     * Displays error messages as an alert if unsuccessful
     * @param quizId the ID of the quiz to delete
     */
    async function handleDeleteQuizAsync(quizId: number): Promise<void> {
        if (confirm(`Please confirm that you want to delete this quiz (ID: ${quizId})`)) {
            setDeletingQuiz(true); // display a message while deleting

            const [response, responseMessage] = await deleteQuizHelperAsync(quizId); // this function will create alerts if there are errors

            if (response === apiTsResponses.successString) {
                // redirect to index if successful
                navigate("/", { replace: true });
            }

            setDeletingQuiz(false); // remove deleting message
        }
    }


    // this function populates the FieldArray with the current user answers of the quiz
    useEffect(() => {
        if (!(quiz === undefined || quiz === null)) {
            console.log("adding questions to fieldArray");

            let editedAnswers: any[] = []
            quiz.questions.forEach((question: string, index: number) => {
                console.log(`answer ${index}: ${quiz.userAnswers[index]}`);
                editedAnswers.push({ answer: quiz.userAnswers[index]?.toString() });
            })

            // (optional) print field array before it is assigned
            console.log(`objects: ${editedAnswers}`);
            editedAnswers.forEach((answer, index) => {
                console.log(`object${index}: {${answer.answer}}`);
            })

            replace(editedAnswers); // assign editedAnswers object to FieldArray
        }
        else {
            console.log(`could not find quiz with ID: ${parseInt(quizId, 10)}`)
        }
    }, []);

    // Quiz cannot be found
    if (quiz === null || quiz === undefined) {
        console.log(`could not find quiz with ID: ${parseInt(quizId, 10)}`)
        return (
            <div className="text-center">
                <p>
                    Unable to retreive quiz to edit (ID: {quizId}), or quiz does not exist
                </p>
                <p>
                    Quizzes are loaded in the index (saved quizzes) page
                </p>
                <p>
                    Please try to navigate to this quiz using the links in the <Link to={`/`}>index page</Link>
                </p>
            </div>
        );
    }
    else {
        return (
            <>
                <Title
                    title={"Edit Quiz"}
                    extraContent={
                        <QuizInfo
                            quiz={quiz}
                        />}
                />

                <div className="row">
                    <div className="col">

                        <Form onSubmit={handleSubmit(async (data) => await handleEditQuizAsync(data))}>

                            {fields.map((field, index: number) => // display for each answer in the FieldArray
                                <div key={index} className="mb-3">

                                    <label className="control-label">{quiz.questions[index]}</label> {/* display question */}

                                    <div className="d-flex">
                                        <input // display input, and register it to the FieldArray
                                            className="form-control answer-box p-2 form-element"
                                            {...register(`editedAnswers.${index}.answer`)}
                                        />

                                        <div
                                            className="text-danger px-2"> {/* display any errors */}
                                            {errors.editedAnswers?.[index]?.answer?.message}
                                        </div>
                                    </div>

                                </div>
                            )}

                            {isSubmitting && // display message if the new answers are being submitted
                                <LoadingMessage message={"Submitting new answers"} markup="h5" />}

                            <button
                                className="btn btn-outline-primary text-dark"
                                type="submit">
                                Submit
                            </button>

                        </Form>

                        <div className="my-2">

                            {deletingQuiz && // display message if this quiz is being deleted
                                <div><LoadingMessage message="Deleting Quiz" /></div>}
                            
                            <IndexLink />
                            {/* Displays " | " between each link */}
                            &nbsp;|&nbsp;

                            <DetailsLink
                                quizId={quiz.id}
                                linkText={"Quiz Details"}
                            />
                            &nbsp;|&nbsp;

                            <DeleteButton
                                quizId={quiz.id}
                                deleteFunction={handleDeleteQuizAsync}
                                buttonText={"Delete Quiz"}
                            />

                        </div>

                    </div>
                </div>
            </>
        );
    }
}