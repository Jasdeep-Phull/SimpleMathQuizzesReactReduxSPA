import { Form } from "semantic-ui-react"
import Title from "../../components/title"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom";
import { apiTsMessages, forgotPasswordAsync } from "../../api";
import LoadingMessage from "../../components/loading-message";
import EmailLabelAndInput from "../../components/email-label-and-input";
import { checkResponse } from "../../utils/check-response";

/**
 * Renders a form for users to start recovering their account if they have forgot their password. The form has the following inputs:
 * - email (using the EmailLabelAndInput component)
 * When the user submits the form, a forgot password request is made to the API. If this is successful the API will log the user's reset code. The user will then be redirected to the reset password route, where they can use the reset code to request a password reset and recover their account
 * @returns A ForgotPassword JSX Component
 */
export default function ForgotPassword() {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    /**
     * Makes a forgot password request to the API using the form data.
     * If this is successful the API will log the user's reset code. The user will then be redirected to the reset password route, where they can use the reset code to request a password reset and recover their account.
     * Displays error messages as an alert if unsuccessful
     * @param data the form data
     */
    async function handleForgotPasswordAsync(data: any) {
        console.log("data");
        for (let property in data) { // (optional) print form data
            console.log(`${property}: ${data[property]}`);
        }

        try {
            let response = await forgotPasswordAsync(data.email); // API request

            if (checkResponse(response)) {
                alert("Password reset requested successfully\n\nPlease follow the instructions on the next page to complete the password reset");
                navigate("/reset-password", { replace: true });
            }
        }
        catch (error) {
            console.log(`handleForgotPasswordAsync() error: ${error}`);
            alert(apiTsMessages.unknownErrorString);
        }
    }

    return (
        <>
            <Title title={"Forgot Password"} />

            <div className="row">
                <div className="col">

                    <Form onSubmit={handleSubmit(async (data) => handleForgotPasswordAsync(data))}>

                        <EmailLabelAndInput
                            labelText={"Email"}
                            inputName={"email"}
                            register={register}
                            errors={errors}
                        />

                        {isSubmitting &&
                            <LoadingMessage message={"Checking email"} />}

                        <button
                            type="submit"
                            className="w-40 btn btn-lg btn-outline-primary my-3 text-dark">
                            Recover Account
                        </button>

                    </Form>
                </div>
            </div>
        </>
    )
}