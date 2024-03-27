import { Form } from "semantic-ui-react"
import Title from "../../components/title"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom";
import { apiTsMessages, registerAsync } from "../../api";
import LoadingMessage from "../../components/loading-message";
import EmailLabelAndInput from "../../components/email-label-and-input";
import PasswordLabelAndInput, { PasswordInputTypes } from "../../components/password-label-and-input";
import ConfirmPassword from "../../components/confirm-password";
import { checkResponse } from "../../utils/check-response";


/**
 * Renders a form for users to create an account. The form has the following inputs:
 * - email (using the EmailLabelAndInput component)
 * - password (using the PasswordLabelAndInput component, type: createPassword)
 * - confirm password (using the ConfirmPassword component)
 * When the user submits the form, a register request is made to the API. If this is successful the user will be redirected to the login page
 * @returns A Register JSX Component
 */
export default function Register() {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();

    /**
     * Makes a register request to the API using the form data.
     * If this is successful the user will be redirected to the login route.
     * Displays error messages as an alert if unsuccessful
     * @param data the form data
     */
    async function handleRegisterAsync(data: any) {
        try {
            let response = await registerAsync(data.email, data.password); // API request

            if (checkResponse(response)) { // check if response was successful (checkResponse handles displaying error messages as alerts)
                alert("Registration successful");
                navigate("/login", { replace: true });
            }
        }
        catch (error) {
            console.log(`handleRegister() error: ${error}`);
            alert(apiTsMessages.unknownErrorString);
        }
    }

    return (
        <>
            <Title title={"Register"} />

            <div className="row">
                {/* These divs currently do nothing, but were left in because they are a good way to separate the page titles and headings from the page body */}
                <div className="col">

                    <Form onSubmit={handleSubmit(async (data) => handleRegisterAsync(data))}>

                        <EmailLabelAndInput
                            register={register}
                            errors={errors}
                        />

                        <PasswordLabelAndInput
                            inputType={PasswordInputTypes.createPassword} // Password must match the passwordRegex pattern
                            register={register}
                            errors={errors}
                        />

                        <ConfirmPassword
                            // default error message: "Password and Confirm Password are different"
                            register={register}
                            errors={errors}
                            watch={watch}
                            inputToConfirm={"password"} // the default name of the password input in the PasswordLabelAndInput component is "password"
                        />
                        
                        {isSubmitting && // display loading message while the form is submitting
                            <LoadingMessage message={"Registering"} />}

                        <button
                            type="submit"
                            className="w-40 btn btn-lg btn-outline-primary mt-3 text-dark">
                            Register
                        </button>

                    </Form>

                    <div>
                        <Link
                            className="btn btn-outline-primary text-dark my-2"
                            to={`../login`}>
                            Already have an account? Login
                        </Link>
                    </div>

                </div>
            </div>
        </>
    )
}