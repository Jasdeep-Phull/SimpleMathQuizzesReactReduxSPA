import { FieldErrors, FieldValues, UseFormRegister, UseFormWatch } from "react-hook-form";
import PasswordLabelAndInput, { PasswordInputTypes } from "./password-label-and-input";

interface ConfirmPasswordParams {
    labelText?: string, // the text to display on the label
    inputName?: string, // the name to assign to the password input
    errorText?: string, // the text to display if there is a validation error

    register: UseFormRegister<FieldValues>, // the register function, from the useForm() hook of the react-hook-form package
    errors: FieldErrors<FieldValues>, // the errors object, from the formState object, from the useForm() hook of the react-hook-form package

    watch: UseFormWatch<FieldValues>, // the watch function, from the useForm() hook of the react-hook-form package
    inputToConfirm: string // the registered name of the input to compare against this component's input for validation
}

/**
 * Renders a confirm password component, which compares the value of its password input to the value of another specified input.
 * This component has the following elements:
 * A label
 * A password input
 * A "Show Password" button next to the label, to unhide the contents of the password input
 * The validation errors for the password input, displayed next to the password input
 * @param confirmPasswordParams a ConfirmPasswordParams object with the following properties:
 * labelText - the text to display on the label. default value: "Confirm Password"
 * inputName - the name to assign to the password input. default value: "confirmPassword"
 * errorText - the text to display if there is a validation error
 * register - the register function, from the useForm() hook of the react-hook-form package
 * errors - the errors object, from the formState object, from the useForm() hook of the react-hook-form package
 * watch - the watch function, from the useForm() hook of the react-hook-form package
 * inputToConfirm - the registered name of the input to compare against this component's input for validation
 * @returns A ConfirmPassword JSX Component
 */
export default function ConfirmPassword({
        labelText = "Confirm Password",
        inputName = "confirmPassword",
        errorText = `Password and ${labelText} are different`,

        register,
        errors,

        watch,
        inputToConfirm,
    }: ConfirmPasswordParams) {

    const inputRequirements = {
        required: true,
        validate: (userInput: string) => {
            if (userInput !== watch(inputToConfirm)) { // the value of the input must match the value of inputToConfirm
                return errorText;
            }
        }
    }

    // passes the parameters and inputRequirements to a PasswordLabelAndInput, with inputType = confirmPassword
    return (
        <PasswordLabelAndInput
            inputType={PasswordInputTypes.confirmPassword}

            labelText={labelText}
            inputName={inputName}
            errorText={errorText}

            register={register}
            errors={errors}

            customValidation={inputRequirements}
        />
    )
}