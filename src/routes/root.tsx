import { Outlet, Link, useNavigation, useNavigate } from "react-router-dom";
import LoadingMessage from "../components/loading-message";
import { apiTsMessages, logoutAsync } from "../api";
import { useAppSelector } from "../redux/hooks";
import { selectEmail, selectToken } from "../redux/accountSlice";
import { checkResponse } from "../utils/check-response";

/**
 * The root route of the SPA
 * Renders the navbar for the SPA and displays all of the routes of the SPA under the navbar, as child routes.
 * The navbar has:
 * - The name of the SPA "SimpleMathQuizzes", which redirects to the index route when clicked
 * - A "Saved Quizzes" button, which redirects to the index route when clicked
 * - A "New Quiz" button, which redirects to the create route when clicked
 * If the user is authenticated, these will also be displayed:
 * - A `Hello, ${user's email}` button, which redirects to the change email route when clicked
 * - A "Logout" button, which makes a logout API request. If successful the user will be redirected to the login route
 * @returns A Root JSX Component
 */
export default function Root() {
    const navigation = useNavigation(); // used to check navigation state, and display a loading message if the router is loading a route
    const navigate = useNavigate(); // used to redirect the user to another route

    const email = useAppSelector(selectEmail);
    const token = useAppSelector(selectToken); // used to determine if the user is authenticated

    /**
     * Makes a request to the API to log out the current user, after confirming this action with the user
     * If this request is successful the user will be redirected to the Login route
     * If unsuccessful, the error message will be displayed in an alert
     */
    async function handleLogoutAsync() {
        if (confirm("Please confirm that you want to logout")) {
            try {
                const response = await logoutAsync(); // API request
                if (checkResponse(response)) { // if successful
                    navigate("/login", { replace: true });
                }
            }
            catch (error) {
                console.log(`handleRegister() error: ${error}`);
                alert(apiTsMessages.unknownErrorString);
            }
        }
    }

    return (
        <>
            {/* Navbar for the SPA */}
            <nav className="navbar navbar-expand-sm navbar-toggleable-sm navbar-light bg-white border-bottom box-shadow mb-3">
                <div className="container-fluid">
                    <Link
                        className="navbar-brand"
                        to={`/`}>
                        SimpleMathQuizzes
                    </Link>

                    <div className="navbar-collapse collapse d-sm-inline-flex justify-content-between">
                        <div className="navbar-nav flex-grow-1">

                            <Link
                                className="nav-item nav-link text-dark px-2"
                                to={`/`}>
                                Home (Saved Quizzes)
                            </Link>

                            <Link
                                className="nav-item nav-link text-dark px-2"
                                to={`../create`}>
                                New Quiz
                            </Link>

                        </div>
                        {!(token === null || token === undefined || token === "") && // display account navbar elements if the user is logged in
                            <>
                                <Link
                                    className="nav-item nav-link text-dark px-2"
                                    to={`/change-email`}>
                                    Hello, {email}
                                </Link>

                                <button
                                    className="nav-item btn btn-outline-primary text-dark px-2"
                                    onClick={async () => handleLogoutAsync()}>
                                    Logout
                                </button>
                            </>
                        }
                    </div>
                </div>
            </nav>

            <div className="row justify-content-center">
                <div className="col-9 justify-content-center">
                    
                    {navigation.state === "loading" && // display "Loading" Loading Message if the router is loading a route
                        <LoadingMessage message={"Loading"} markup={"h5"} />}

                    <Outlet /> {/* Display the child route here */}

                </div>
            </div>
        </>
    );
}