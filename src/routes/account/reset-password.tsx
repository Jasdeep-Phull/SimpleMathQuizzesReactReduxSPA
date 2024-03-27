import { Form } from "semantic-ui-react"
import Title from "../../components/title"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom";
import { apiTsMessages, resetPasswordAsync } from "../../api";
import LoadingMessage from "../../components/loading-message";
import PasswordLabelAndInput, { PasswordInputTypes } from "../../components/password-label-and-input";
import ConfirmPassword from "../../components/confirm-password";
import EmailLabelAndInput from "../../components/email-label-and-input";


/**
 * Renders a form for users to recover their account by resetting their password. The form has the following inputs:
 * - email (using the EmailLabelAndInput component)
 * - reset code (as JSX markup)
 * - new password (using the PasswordLabelAndInput component, type: createPassword)
 * - confirm new password (using the ConfirmPassword component)
 * When the user submits the form, a reset password request is made to the API. If this is successful the user will be redirected to the login route, where they can log in using their newly set password
 * @returns A ResetPassword JSX Component
 */
export default function ResetPassword() {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();

    const passwordResetInstructions = 'How to finish the password reset:\n1) Enter\n    - Your email\n - The reset code in the API console\n - Your new password for your account\n2) Click "Reset Password"\n\nAfter that you will be redirected to the login page when you submit this form.\nIf all of the information in the form was correct, then you will be able to log in using your new password';

    /**
     * Makes a reset password request to the API using the form data.
     * If this is successful the user will be redirected to the login route, where they can log in using their newly set password.
     * Displays error messages as an alert if unsuccessful
     * @param data the form data
     */
    async function handleResetPasswordAsync(data: any) {
        try {
            let response = await resetPasswordAsync(data.email, data.resetCode, data.newPassword); // API request
            
            switch (response) {
                case undefined:
                    alert(apiTsMessages.unknownNetworkErrorString);
                    break;
                default: // for all requests without network errors (both successful and unsuccessful)
                    alert("Form successfully submitted\n\nYou will now be redirected to the login page.\nIf all of the information in the form was correct, then you will be able to log in using your new password");
                    navigate("/login", { replace: true });
                /*
                there is no switch for errors, to protect account data. Dont want to alert the user if the email or reset code was incorrect
                front-end validation prevents validation errors for new password before this request is made, so the problem validation error responses not being displayed is avoided
                
                case apiTsResponses.successString:
                    alert("Password reset successful");
                    navigate("/login", { replace: true });
                    break;
                default:
                    alert(response);
                    break;
                */
            }
            
        }
        catch (error) {
            console.log(`handleResetPasswordAsync() error: ${error}`);
            alert(apiTsMessages.unknownErrorString);
        }
    }

    return (
        <>
            <Title
                title={"Reset Password"}
                extraContent={<Link
                    className="btn btn-outline-primary text-dark mt-2"
                    to={`../forgot-password`}>
                    Back to Forgot Password
                </Link>}
            />

            <div className="row">
                <div className="col">

                    <div className="text-with-line-breaks">{passwordResetInstructions}</div>

                    <Form className="mt-5" onSubmit={handleSubmit(async (data) => handleResetPasswordAsync(data))}>

                        <EmailLabelAndInput
                            register={register}
                            errors={errors}
                        />

                        <label className="form-label">Reset Code</label>
                        <div className="d-flex">
                            <input className="form-control p-2 form-element" placeholder="code"
                                {...register("resetCode", {
                                    required: true
                                })}
                            />
                            {errors["resetCode"] &&
                                <p className="text-danger p-2">Please enter a reset code</p>
                            }
                        </div>

                        <PasswordLabelAndInput
                            labelText={"New Password"}
                            inputName={"newPassword"}
                            inputType={PasswordInputTypes.createPassword}
                            register={register}
                            errors={errors}
                        />

                        <ConfirmPassword
                            labelText={"Confirm New Password"}
                            inputName={"confirmNewPassword"}
                            errorText={"New Password and Confirm New Password are different"}
                            register={register}
                            errors={errors}
                            watch={watch}
                            inputToConfirm={"newPassword"}
                        />

                        {isSubmitting &&
                            <LoadingMessage message={"Resetting Password"} />}

                        <button
                            type="submit"
                            className="w-40 btn btn-lg btn-outline-primary my-3 text-dark">
                            Reset Password
                        </button>

                    </Form>
                </div>
            </div>
        </>
    )
}