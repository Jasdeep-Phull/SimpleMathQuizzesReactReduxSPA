import { useEffect, useState } from "react"

interface LoadingMessageParams {
    message: string; // the message to display
    markup?: string; // custom markup to wrap around the message, currently only "h5" is supported, default value: <div>
}

/**
 * Renders text while loading or awaiting something. Displays dots after the text, which change over time.
 * @param loadingMessageParams a LoadingMessageParams object, with the following properties:
 * message - the message to display
 * (optional) markup - custom markup to wrap around the message, currently only "h5" is supported. default value: <div>
 * @returns A LoadingMessage JSX Component
 */
export default function LoadingMessage({ message, markup }: LoadingMessageParams) {
    const [loadingDots, setLoadingDots] = useState<string>("");

    useEffect(() => {
        setInterval(() => { // if there are 3 dots: clear all dots. else: add 1 more dot. do this every 250 milliseconds
            setLoadingDots(d => d.length >= 3 ?
                ""
                :
                d.concat("."));
            
        }, 250)
    }, [])

    switch (markup) {
        case "h5":
            return (
                <h5 className="loading-message border border-3 border-warning">
                    {`- ${message}${loadingDots}`}
                </h5>)
        default:
            return (
                <div className="loading-message border border-3 border-warning">
                    {`- ${message}${loadingDots}`}
                </div>
            )
    }
}