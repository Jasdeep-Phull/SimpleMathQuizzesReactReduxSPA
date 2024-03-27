import { useRouteError } from "react-router-dom";

/**
 * Renders the error page for this SPA
 * Displays any errros encountered
 * @returns An ErrorPage JSX Component
 */
export default function ErrorPage() {
    // get error
    const error = useRouteError();
    console.log(error);

    return (
        <div id="error-page">
            <h1>Error</h1>
            <p>An unexpected error has occurred.</p>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </div>
    );
}