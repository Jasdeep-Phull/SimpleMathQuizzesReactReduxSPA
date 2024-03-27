import { Form } from "semantic-ui-react"
import Title from "../../components/title"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom";
import { apiTsMessages, changeEmailAsync } from "../../api";
import LoadingMessage from "../../components/loading-message";
import EmailLabelAndInput from "../../components/email-label-and-input";
import ConfirmInput from "../../components/confirm-input";
import { checkResponse } from "../../utils/check-response";


/**
 * Renders a form for users to change the email address of their account. The form has the following inputs:
 * - email (using the EmailLabelAndInput component)
 * - confirm email (using the ConfirmInput component)
 * When the user submits the form, a change email request is made to the API. If this is successful the API will log the url to process the email change. This page has instructions for how to proceed if the request was successful.
 * 
 * (The process to change email is strange because
 * - the ASP.NET Core Identity "change email" endpoint needs to send an email to confirm the new email address, and
 * - the API does not have an email sender service)
 * @returns A ChangeEmail JSX Component
 */
export default function ChangeEmail() {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();

    const emailResetInstructions = 'How to change email:\n1) Enter your new email and click "Change Email"\n2) Check the API console for a link\n3) Logout, or close this tab\n4) Paste the link into your browser search bar and press "Enter"\n\nAfter that you can close the tab with the API link and log back in to this website using your new email';

    /**
     * Makes a change email request to the API using the form data.
     * If this is successful the API will log the url to process the email change.
     * Displays error messages as an alert if unsuccessful
     * @param data the form data
     */
    async function handleChangeEmailAsync(data: any) {
        console.log("data");
        for (let property in data) { // (optional) print form data
            console.log(`${property}: ${data[property]}`);
        }

        try {
            let response = await changeEmailAsync(data.newEmail); // API request
            
            if (checkResponse(response)) {
                const successString = "Email change requested successfully\n\nPlease follow the instructions on this page to complete the email change"
                alert(successString);
            }
        }
        catch (error) {
            console.log(`handleChangeEmailAsync() error: ${error}`);
            alert(apiTsMessages.unknownErrorString);
        }
    }

    return (
        <>
            <Title
                title={"Change Email"}
                extraContent={
                    <Link
                        className="btn btn-outline-primary text-dark"
                        to={`../change-password`}>
                        Change Password
                    </Link>}
            />

            <div className="row">
                <div className="col">

                    <div className="text-with-line-breaks">{emailResetInstructions}</div>

                    <Form className="mt-5" onSubmit={handleSubmit(async (data) => handleChangeEmailAsync(data))}>

                        <EmailLabelAndInput
                            labelText={"New Email"}
                            inputName={"newEmail"}
                            register={register}
                            errors={errors}
                        />

                        <ConfirmInput
                            labelText={"Confirm New Email"}
                            inputName={"confirmNewEmail"}
                            errorText={"New Email and Confirm New Email are different"}
                            register={register}
                            errors={errors}
                            watch={watch}
                            inputToConfirm={"newEmail"}
                        />

                        {isSubmitting &&
                            <LoadingMessage message={"Changing Email"} />}

                        <button
                            type="submit"
                            className="w-40 btn btn-lg btn-outline-primary my-3 text-dark">
                            Change Email
                        </button>

                    </Form>
                </div>
            </div>
        </>
    )
}