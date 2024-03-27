import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { store } from "./redux/store"
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css"; // index.css needs to be below bootstrap (and any other library) to take precedence / have priority
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// SPA pages
import Root from './routes/root';
import ErrorPage from './routes/error-page';
import RequireAuthentication from "./routes/require-authentication"
import NotFound from "./routes/not-found"
// - quiz pages
import Index , { loader as indexLoader }  from './routes/quiz/index';
import Details from "./routes/quiz/details";
import Create, { loader as createLoader } from "./routes/quiz/create"
import Edit from "./routes/quiz/edit"
// - account pages
import Login from "./routes/account/login"
import Register from "./routes/account/register"
import ChangeEmail from "./routes/account/change-email"
import ChangePassword from "./routes/account/change-password"
import ForgotPassword from "./routes/account/forgot-password"
import ResetPassword from "./routes/account/reset-password"

/**
 * CORS is not set up on the SPA or the API. The SPA and API were tested with CORS disabled.
 * Tested on chrome with CORS disabled using: 'chrome.exe --disable-web-security --user-data-dir=~/chromeTemp'
 * (from folder: 'C:\Program Files\Google\Chrome\Application')
 */


// create router for SPA
const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: <RequireAuthentication childComponent={<Index />} />,
                loader: indexLoader // RequireAuthentication does not stop loaders from running. This loader has code to check authentication
            },
            {
                path: "details/:quizId",
                element: <RequireAuthentication childComponent={<Details />} />
            },
            {
                path: "create",
                element: <RequireAuthentication childComponent={<Create />} />,
                loader: createLoader // RequireAuthentication does not stop loaders from running. This loader has code to check authentication
            },
            {
                path: "edit/:quizId",
                element: <RequireAuthentication childComponent={<Edit />} />
            },
            {
                index: true,
                path: "login",
                element: <Login />,
            },
            {
                path: "register",
                element: <Register />,
            },
            {
                path: "forgot-password",
                element: <ForgotPassword />
            },
            {
                path: "reset-password",
                element: <ResetPassword />
            },
            {
                path: "change-email",
                element: <RequireAuthentication childComponent={<ChangeEmail />} />,
            },
            {
                path: "change-password",
                element: <RequireAuthentication childComponent={<ChangePassword />} />,
            },
            {
                path: "*", // for any other routes
                element: <NotFound />
            }
        ]
    },
]);


const container = document.getElementById("root")

if (container) {
    const root = createRoot(container)

    /**
     * removed react strict mode because it broke the "create" page.
     * Since strict mode rendered everything twice, if 10 questions were sent to "create", then 20 answer boxes would render
     */
    root.render(
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider >
    )
} else {
    throw new Error(
        "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
    )
}

/* original root.render():

        <React.StrictMode>
            <Provider store={store}>
                <RouterProvider router={router} />
            </Provider >
        </React.StrictMode>,
*/