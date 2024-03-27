import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form"
import { emailRegex } from "../utils/account-regexs"



interface EmailLabelAndInputParams {
    labelText?: string, // the text to display on the label
    inputName?: string, // the name to assign to the email input

    register: UseFormRegister<FieldValues>, // the register function, from the useForm() hook of the react-hook-form package
    errors: FieldErrors<FieldValues> // the errors object, from the formState object, from the useForm() hook of the react-hook-form package
}

/**
 * Renders the following:
 * A label
 * An email input
 * The validation errors for the email input, displayed next to the email input
 * @param emailLabelAndInputParams an EmailLabelAndInputParams object with the following properties:
 * labelText - the text to display on the label. default value: "Email"
 * inputName - the name to assign to the email input. default value: "email"
 * errorText - the text to display if there is a validation error
 * register - the register function, from the useForm() hook of the react-hook-form package
 * errors - the errors object, from the formState object, from the useForm() hook of the react-hook-form package
 * @returns An EmailLabelAndInput JSX Component
 */
export default function EmailLabelAndInput({
        labelText = "Email",
        inputName = "email",

        register,
        errors
    }: EmailLabelAndInputParams) {

    return (
        <>
            <label className="form-label">{labelText}</label>
            <div className="d-flex">
                <input className="form-control p-2 form-element" placeholder="name@example.com"
                    {...register(inputName, { // register this input to the form
                        required: true,
                        pattern: emailRegex
                    })}
                />
                {errors[inputName] && // display any errors
                    <p className="text-danger px-2">Please enter a valid email</p>
                }
            </div>
        </>
	)
}