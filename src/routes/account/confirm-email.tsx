import { useLoaderData, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Form } from "semantic-ui-react"
import Title from "../../components/title";

export default function ConfirmEmail() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();

    return (
        <>
            <Title
                title={"Confirm Email"}
            />

            <div className="row">
                <div className="col">

                    <Form onSubmit={handleSubmit(async (data) => (data))}>


                    <label className="form-label">Reset Code</label>
                    <div className="d-flex">
                        <input className="form-control p-2 form-element" placeholder="code"
                            {...register("code", {
                                required: true,
                            })}
                        />
                        {errors["code"] &&
                            <p className="text-danger p-2">Please enter a code</p>
                        }
                    </div>

                    </Form>
                </div>
            </div>
        </>
    )
}