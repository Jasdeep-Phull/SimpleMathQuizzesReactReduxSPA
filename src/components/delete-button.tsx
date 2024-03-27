interface DeleteButtonParams {
    quizId: number, // the ID of the quiz to delete
    deleteFunction: Function, /* The function to call to delete the quiz.
    Making this a parameter allows the page to display a "Deleting Quiz" loading message component while the quiz is being deleted.Please look at the handleDeleteQuizAsync function on the Details or Edit pages for more information. (The handleDeleteQuizAsync function on the Index page is more complicated)
    */
    buttonText?: string // the text to display on the button
}

/**
 * Renders a button that will call a function to delete a quiz
 * (This is component is a button, but it looks exactly like the links used in this SPA)
 * @param deleteButtonParams A DeleteButtonParams object with the following properties:
 * quizId - the ID of the quiz to delete
 * deleteFunction - The function to call to delete the quiz
 * buttonText - the text to display on the button. default value: `Delete Quiz (ID:${quizId})`
 * @returns a DeleteButton JSX Component
 */
export default function DeleteButton({
        quizId,
        deleteFunction,
        buttonText = `Delete Quiz (ID:${quizId})`
    }: DeleteButtonParams) {

    return (
        <button
            className="btn btn-outline-danger text-dark"
            onClick={async () => deleteFunction(quizId)}>
            {buttonText}
        </button>
    )
}