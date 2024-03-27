import { Link } from "react-router-dom"

interface IndexLinkParams {
    linkText?: string // the text to display on the Link element
}

/**
 * Renders a Link component that navigates to the index page
 * @param indexLinkParams An IndexLinkParams object with the following properties:
 * linkText - the text to display on the Link element. default value: "Back to Saved Quizzes"
 * @returns An IndexLink JSX Component
 */
export default function IndexLink({
        linkText =  "Back to Saved Quizzes"
    }: IndexLinkParams) {

    return (
        <Link
            className="btn btn-outline-primary text-dark"
            to={`../`}>
            {linkText}
        </Link>
    )
}