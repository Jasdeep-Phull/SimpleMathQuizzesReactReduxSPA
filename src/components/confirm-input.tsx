import { FieldErrors, FieldValues, UseFormRegister, UseFormWatch } from "react-hook-form"

interface ConfirmInputParams {
    labelText: string, // the text to display on the label
    inputName: string, // the name to assign to the input
    errorText: string, // the text to display if there is a validation error

    register: UseFormRegister<FieldValues>, // the register function, from the useForm() hook of the react-hook-form package
    errors: FieldErrors<FieldValues>, // the errors object, from the formState object, from the useForm() hook of the react-hook-form package

    watch: UseFormWatch<FieldValues>, // the watch function, from the useForm() hook of the react-hook-form package
    inputToConfirm: string // the registered name of the input to compare against this component's input for validation
}

/**
 * Renders a confirm input component, which compares the value of its input to the value of another specified input.
 * This component has the following elements:
 * A label
 * An input
 * The validation errors for the input, displayed next to the input
 * @param confirmInputParams a ConfirmInputParams object with the following properties:
 * labelText - the text to display on the label
 * inputName - the name to assign to the input
 * errorText - the text to display if there is a validation error
 * register - the register function, from the useForm() hook of the react-hook-form package
 * errors - the errors object, from the formState object, from the useForm() hook of the react-hook-form package
 * watch - the watch function, from the useForm() hook of the react-hook-form package
 * inputToConfirm - the registered name of the input to compare against this component's input for validation
 * @returns A ConfirmInput JSX Component
 */
export default function ConfirmInput({
        labelText,
        inputName,
        errorText,
        register,
        errors,
        watch,
        inputToConfirm
    }: ConfirmInputParams) {

    return (
        <>
            <label className="form-label">{labelText}</label>
            <div className="d-flex">
                <input className="form-control p-2 form-element" placeholder={`confirm ${inputToConfirm}`}
                    {...register(inputName, { // register this input to the form
                        required: true,
                        validate: (userInput: string) => {
                            if (userInput !== watch(inputToConfirm)) { // the value of the input must match the value of inputToConfirm
                                return errorText;
                            }
                        }
                    })}
                />
                {errors[inputName] && // display any errors
                    <p className="text-danger px-2">{errorText}</p>
                }
            </div>
        </>
    )
}