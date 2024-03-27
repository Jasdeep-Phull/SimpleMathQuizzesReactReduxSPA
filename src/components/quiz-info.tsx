import { Quiz } from "../quiz";
import { displayDateTime } from "../utils/display-date-time";

interface QuizInfoParams {
    quiz: Quiz // the quiz to display information about
}

/**
 * Renders a line of text with the ID, creation date and time, and score of a quiz
 * @param quizInfoParams a QuizInfoParams object with the following properties:
 * quiz - The quiz to display information about
 * @returns A QuizInfo JSX Component
 */
export default function QuizInfo({ quiz }: QuizInfoParams) {
    return (
        <h5>
            (ID: {quiz.id}, Created on: {displayDateTime(quiz.creationDateTime)}, Score: {quiz.score})
        </h5>
    )
}