import Title from "../components/title";

/**
 * Renders the "Not Found" page, for any webpages and resources that cannot be found
 * @returns the NotFound JSX Component
 */
export default function NotFound() {
    return (
        <div className="text-center">
            <Title
                title={"Not Found"}
            />
            <p>
                The webpage/resource that you requested cannot be found
            </p>
        </div>
    );
}