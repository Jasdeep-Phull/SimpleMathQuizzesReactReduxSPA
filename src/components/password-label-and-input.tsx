import { useState } from "react";
import { FieldErrors, FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form";
import { passwordRegex } from "../utils/account-regexs";


// the different types of password inputs
export enum PasswordInputTypes {
    login, // input cannot be empty
    createPassword, // input cannot be empty and must match the passwordRegex pattern in account-regexs.ts
    confirmPassword // new password components with type "confirmPassword" should only be created using the ConfirmPassword component
}

interface PasswordLabelAndInputParams {
    inputType?: PasswordInputTypes, // the type of the password input

    labelText?: string, // the text to display on the label
    inputName?: string, // the name to assign to the password input
    errorText?: string, // the text to display if there is a validation error

    register: UseFormRegister<FieldValues>, // the register function, from the useForm() hook of the react-hook-form package
    errors: FieldErrors<FieldValues>, // the errors object, from the formState object, from the useForm() hook of the react-hook-form package

    customValidation?: RegisterOptions // custom validation for this input. this should not be set manually, only the ConfirmPassword component should set this property
}

/**
 * Renders the following:
 * A label
 * A password input
 * A "Show Password" button next to the label, to unhide the contents of the password input
 * The validation errors for the password input, displayed next to the password input
 * (Password confirmation components should be created using the ConfirmPassword component)
 * @param passwordLabelAndInputParams a PasswordLabelAndInputParams object with the following properties:
 * inputType - the type of the password input (password confirmation components should be created using the ConfirmPassword component)
 * labelText - the text to display on the label. default value: "Password"
 * inputName - the name to assign to the password input. default value: "password"
 * errorText - the text to display if there is a validation error
 * register - the register function, from the useForm() hook of the react-hook-form package
 * errors - the errors object, from the formState object, from the useForm() hook of the react-hook-form package
 * customValidation - custom validation for this input. this should not be set manually, only the ConfirmPassword component should set this property
 * @returns A PasswordLabelAndInput JSX Component
 */
export default function PasswordLabelAndInput({
        inputType = PasswordInputTypes.login,

        labelText = "Password",
        inputName = "password",
        errorText = undefined,

        register,
        errors,

        customValidation = undefined // custom validation should not be set manually, only the ConfirmPassword component should set this property
    }: PasswordLabelAndInputParams) {

    const [showPassword, setShowPassword] = useState<boolean>(false); // used to show or hide the password input contents


    const passwordRequirements = (inputType === PasswordInputTypes.confirmPassword) ?
        // new password components with type "confirmPassword" should only be created using the ConfirmPassword component
        customValidation
        :
        (inputType === PasswordInputTypes.createPassword) ?
            {
                required: true,
                pattern: passwordRegex
            }
            :
            // inputType === login
            {
                required: true
            };


    const defaultErrorText = (inputType === PasswordInputTypes.createPassword) ?
        "Password requirements: \n - at least 6 characters\n - no more than 30 characters\n - 1 uppercase letter\n - 1 lowercase letter\n - 1 digit\n - 1 symbol (non-alphanumeric character)"
        :
        // inputType === login
        // if a confirmPassword input is created using the ConfirmPassword input, then it will provide a default error message
        // if the inputType is "confirmPassword", custom error text should be supplied by the ConfirmPassword
        "Password is required";


    // inverts the value of showPassword
    function toggleShowPassword() {
        setShowPassword(!showPassword);
    }


    return (
        <>
            <label className="form-label">{labelText}</label>
            <button type="button" className="w-40 ms-2 btn btn-outline-primary text-dark" onClick={() => toggleShowPassword()}>
                {showPassword ? // display text for this button
                    "Hide"
                    :
                    "Show"}
            </button>
            <div className="d-flex">
                <input className="form-control p-2 form-element" placeholder="password"
                    type={showPassword ? // set input type of input
                        "text"
                        :
                        "password"}
                    {...register(inputName, passwordRequirements)} // register this input to the form
                />
                {errors[inputName] && // display any errors
                    <p className="text-danger px-2 text-with-line-breaks">{(errorText === undefined || errorText === null || errorText === "") ?
                        // if errorText was not defined, then display defaultErrorText
                        defaultErrorText
                        :
                        errorText
                    }</p>
                }
            </div>
        </>
    )
}