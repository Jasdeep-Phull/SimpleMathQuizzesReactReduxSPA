import { Link } from "react-router-dom"

interface EditLinkParams {
    quizId: number, // the ID of the quiz to display
    linkText?: string // the text to display on the Link element
}

/**
 * Renders a Link component that navigates to the edit page for a specified quiz
 * @param editLinkParams An EditLinkParams object with the following properties:
 * quizId - the ID of the quiz to display
 * linkText - the text to display on the Link element. default value: `Edit Quiz (ID:${quizId})`
 * @returns An EditLink JSX Component
 */
export default function EditLink({
        quizId,
        linkText = `Edit Quiz (ID:${quizId})`
    }: EditLinkParams) {

    return (
        <Link
            className="btn btn-outline-primary text-dark"
            to={`../edit/${quizId}`}>
            {linkText}
        </Link>
    )
}