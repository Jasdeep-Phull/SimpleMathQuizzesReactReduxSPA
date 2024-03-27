import { Link } from "react-router-dom"

interface DetailsLinkParams {
    quizId: number, // the ID of the quiz to display
    linkText?: string // the text to display on the Link element
}

/**
 * Renders a Link component that navigates to the details page for a specified quiz
 * @param detailsLinkParams A DetailsLinkParams object with the following properties:
 * quizId - the ID of the quiz to display
 * linkText - the text to display on the Link element. default value: `View Quiz (ID:${quizId})`
 * @returns A DetailsLink JSX Component
 */
export default function DetailsLink({
        quizId,
        linkText = `View Quiz (ID:${quizId})`
    }: DetailsLinkParams) {

    return (
        <Link
            className="btn btn-outline-primary text-dark"
            to={`../details/${quizId}`}>
            {linkText}
        </Link>
    )
}