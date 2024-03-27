interface TitleParams {
    title: string, // the title text
    extraContent?: any // any content that should appear after the title text and before the <hr /> horizontal line
}

/**
 * Renders title text, with a <hr /> horizontal line after it
 * @param titleParams A TitleParams object, with the following properties:
 * title - The title text
 * (optional) extraContent - Any content that should appear after the title text and before the <hr /> horizontal line
 * @returns a Title JSX Component
 */
export default function Title({ title, extraContent }: TitleParams) {
    return (
        <>
            <h2>
                {title}
            </h2>
            {extraContent}

            <hr />
        </>
    )
}