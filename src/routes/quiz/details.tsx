import { Link, useNavigate, useParams } from "react-router-dom";
import { Quiz } from "../../quiz";
//import { selectQuizzes } from "../redux-slices/quizzesSlice";
//import { useAppSelector } from "../app/hooks";
import { useState } from "react";
import { useAppSelector } from "../../redux/hooks";
import { selectQuizzes } from "../../redux/quizzesSlice";
import { deleteQuizHelperAsync } from "../../utils/delete-quiz";
import { apiTsResponses } from "../../api";
import Title from "../../components/title";
import QuizInfo from "../../components/quiz-info";
import LoadingMessage from "../../components/loading-message";
import IndexLink from "../../components/index-link";
import EditLink from "../../components/edit-link";
import DeleteButton from "../../components/delete-button";


interface detailsParams {
    quizId?: string // the ID of the quiz to display details for
}

/**
 * Renders a page which displays a table. Each row has the following:
 * - A question from the quiz
 * - The user's answer for that question
 * - A comment about the question and user answer. Displays "Correct" if the user's answer is correct, and displays the correct answer otherwise
 * 
 * Below the table there are links to:
 * - Navigate back to index route
 * - Edit the quiz
 * - Delete the quiz
 * If the user successfully deletes the quiz they will be redirected to the index route
 * @returns A Details JSX Component
 */
export default function Details() {
    const navigate = useNavigate();

    const [deletingQuiz, setDeletingQuiz] = useState<boolean>(false); // used to display a message while the quiz is being deleted

    const { quizId }: detailsParams = useParams(); // get quiz ID from quizId parameter
    const quiz: (Quiz|undefined) = useAppSelector(selectQuizzes).find(q => q.id === parseInt(quizId, 10)); // finds and sets the quiz, or returns undefined if the quiz cannot be found

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

    // Quiz cannot be found
    if (quiz === null || quiz === undefined) {
        return (
            <div className="text-center">
                <p>
                    Unable to retreive quiz (ID: {quizId}), or quiz does not exist
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
                    title={"View Quiz"}
                    extraContent={
                        <QuizInfo
                            quiz={quiz}
                        />}
                />

                <div className="row justify-content-center">
                    <div className="col-10">

                        <table className="table table-sm table-hover text-center">
                            <thead>
                                <tr>
                                    <th className="col-3">
                                        Questions
                                    </th>

                                    <th className="col-5">
                                        User Answers
                                    </th>

                                    <th className="col-4" />
                                    {/* For comments about this question and user answer */}
                                </tr>
                            </thead>
                            <tbody>
                                {quiz.questions.map((question: string, index: number) => // display for each question in the quiz
                                    <tr key={index}>
                                        <td>
                                            {question}
                                        </td>

                                        <td>
                                            {(quiz.userAnswers[index] === undefined || quiz.userAnswers[index] === null) ?
                                                "unanswered, or invalid answer"
                                                :
                                                quiz.userAnswers[index]
                                            }
                                        </td>

                                        <td>
                                            {quiz.userAnswers[index] === quiz.correctAnswers[index] ?
                                                <p className="text-success">
                                                    Correct
                                                </p>
                                                :
                                                <p className="text-danger">
                                                    Correct Answer: {quiz.correctAnswers[index]}
                                                </p>
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="my-2 justify-content-start">

                            {deletingQuiz && // display message if this quiz is being deleted
                                <LoadingMessage message="Deleting Quiz" />}

                            <IndexLink />
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

                        </div>
                    </div>
                </div>
            </>
        );
    }
}