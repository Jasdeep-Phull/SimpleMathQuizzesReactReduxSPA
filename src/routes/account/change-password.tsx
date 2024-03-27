import { Form } from "semantic-ui-react"
import Title from "../../components/title"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom";
import { apiTsMessages, changePasswordAsync } from "../../api";
import LoadingMessage from "../../components/loading-message";
import PasswordLabelAndInput, { PasswordInputTypes } from "../../components/password-label-and-input";
import ConfirmPassword from "../../components/confirm-password";
import { checkResponse } from "../../utils/check-response";


/**
 * Renders a form for users to change the password of their account. The form has the following inputs:
 * - old password (using the PasswordLabelAndInput component, type: login)
 * - new password (using the PasswordLabelAndInput component, type: createPassword)
 * - confirm new password (using the ConfirmPassword component)
 * When the user submits the form, a change password request is made to the API. If this is successful the user will be redirected to the index route
 * @returns A ChangePassword JSX Component
 */
export default function ChangePassword() {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();

    /**
     * Makes a change password request to the API using the form data.
     * If this is successful the user will be redirected to the index route.
     * Displays error messages as an alert if unsuccessful
     * @param data the form data
     */
    async function handleChangePasswordAsync(data: any) {
        try {
            let response = await changePasswordAsync(data.newPassword, data.oldPassword); // API request

            if (checkResponse(response)) {
                alert("Password change successful");
                navigate("/", { replace: true });
            }
        }
        catch (error) {
            console.log(`handleChangePasswordAsync() error: ${error}`);
            alert(apiTsMessages.unknownErrorString);
        }
    }

    return (
        <>
            <Title
                title={"Change Password"}
                extraContent={
                    <Link
                        className="btn btn-outline-primary text-dark"
                        to={`../change-email`}>
                        Change Email
                    </Link>}
            />

            <div className="row">
                <div className="col">

                    <Form onSubmit={handleSubmit(async (data) => handleChangePasswordAsync(data))}>

                        <PasswordLabelAndInput
                            labelText={"Current Password"}
                            inputName={"oldPassword"}
                            inputType={PasswordInputTypes.login}
                            register={register}
                            errors={errors}
                        />

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
                            <LoadingMessage message={"Changing Password"} />}

                        <button
                            type="submit"
                            className="w-40 btn btn-lg btn-outline-primary my-3 text-dark">
                            Change Password
                        </button>

                    </Form>
                </div>
            </div>
        </>
    )
}