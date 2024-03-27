import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import Title from "../../components/title";
import { useForm } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { useAppSelector } from "../../redux/hooks";
import { selectToken } from "../../redux/accountSlice";
import { apiTsMessages, loginAsync } from "../../api";
import LoadingMessage from "../../components/loading-message";
import PasswordLabelAndInput, { PasswordInputTypes } from "../../components/password-label-and-input";
import EmailLabelAndInput from "../../components/email-label-and-input";
import { checkResponse } from "../../utils/check-response";


/**
 * Renders a form for users to log in to their account. The form has the following inputs:
 * - email (using the EmailLabelAndInput component)
 * - password (using the PasswordLabelAndInput component, type: login)
 * When the user submits the form, a login request is made to the API. If this is successful the user will be redirected to the index route
 * @returns A Login JSX Component
 */
export default function Login() {
    const navigate = useNavigate();

    const token = useAppSelector(selectToken);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

    /**
     * Makes a login request to the API using the form data.
     * If this is successful the user will be redirected to the index route.
     * Displays error messages as an alert if unsuccessful
     * @param data the form data
     */
    async function handleLoginAsync(data: any) {
        for (let property in data) { // (optional) print form data
            console.log(`${property}: ${data[property]}`);
        }

        try {
            let response = await loginAsync(data.email, data.password); // API request
            
            if (checkResponse(response)) {
                console.log("handleLogin success")
                navigate("/", { replace: true });
            }
            
        }
        catch (error) {
            console.log(`handleLogin() error: ${error}`);
            alert(apiTsMessages.unknownErrorString);
        }
    }

    if (!(token === undefined || token === null || token === "")) {
        // if user is already authenticated, redirect them to index
        return (
            <Navigate
                to={`/`}
                replace={true}
            />
        )
    }

    return (
        <>
            <Title title={"Login"} />

            <div className="row">
                <div className="col">

                    <Form onSubmit={handleSubmit(async (data) => await handleLoginAsync(data))}>
                        
                        <EmailLabelAndInput
                            register={register}
                            errors={errors}
                        />

                        <PasswordLabelAndInput
                            inputType={PasswordInputTypes.login}
                            register={register}
                            errors={errors}
                        />
                        
                        {isSubmitting &&
                            <LoadingMessage message={"Logging in"} />}

                        <button
                            type="submit"
                            className="w-40 btn btn-lg btn-outline-primary mt-3 text-dark">
                            Log in
                        </button>

                    </Form>

                    <div>
                        <Link
                            className="btn btn-outline-primary text-dark mt-2"
                            to={`../forgot-password`}>
                            Forgot Password?
                        </Link>
                    </div>
                    {/* These links are in separate divs to ensure that they are on different rows (aligned vertically) */}

                    <div>
                        <Link
                            className="btn btn-outline-primary text-dark my-2"
                            to={`../register`}>
                            Register as a new user
                        </Link>
                    </div>

                </div>
            </div>
        </>
    )
}