import { Quiz } from "../quiz";

/**
 * Calculates the score (as a percentage) for a quiz
 * @param quiz the quiz to calculate a score percentage for
 * @returns the score (as a percentage) for the quiz supplied
 */
export function scorePercentage(quiz: Quiz) {
    return (quiz.score / quiz.questions.length) * 100;
}