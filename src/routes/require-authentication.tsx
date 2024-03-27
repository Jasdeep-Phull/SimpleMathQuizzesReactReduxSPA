import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { selectToken } from "../redux/accountSlice";


interface RequireAuthenticationParams {
    childComponent: JSX.Element // the component to redirect to if the user is authenticated
}

/**
 * Renders a component that is wrapped around a child component
 * This component checks the token in the account slice of the redux store to determine if the current user is authenticated
 * If the token is null, undefined, or an empty string: the user will be redirected to the login page
 * If none of those are true: the user will be redirected to the child component
 * @param requireAuthenticationParams A RequireAuthenticationParams object with the following properties:
 * childComponent - the component to redirect to if the user is authenticated
 * @returns A RequireAuthentication JSX Component
 */
export default function RequireAuthentication({ childComponent }: RequireAuthenticationParams) {
    const token = useAppSelector(selectToken);

    if (token === null || token === undefined || token === "") {
        // return <Navigate to={"/login"} replace={true}/>
        return <Navigate to={"../login"} replace={true} />
    }
    else {
        return childComponent
    } 
}