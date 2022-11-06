import { ZodError } from "zod";

interface ZodIssue {
    friendlyMessage: string;
    code: string;
    got?: string;
    expected?: string;
    location: {
        form: boolean;
        field: boolean;
        path?: (string | number)[];
    };
}

interface ZodErrorObject {
    issues: Array<ZodIssue>;
}

type ErrorObject = ZodErrorObject | Error;

interface FinalErrorObject {
    errorObject: ErrorObject;
    errorMetadata: ErrorMetadata;
}

interface ErrorMetadata {
    statusCode: number;
}

export function createErrorMessage(
    error: Error,
    source: string,
    safe: boolean = false
): FinalErrorObject {
    let errorObject: ErrorObject,
        finalErrorObject: FinalErrorObject,
        errorMetadata: ErrorMetadata;

    if (!(error instanceof Error)) {
        throw new Error("The error is not an instance of Error.");
    }

    // TODO: implement the create error message
    if (error instanceof ZodError) {
        errorObject = createZodErrorMessage(error, source);
        errorMetadata = {
            statusCode: 400,
        };
    } else {
        errorObject = error;
        errorMetadata = {
            statusCode: 500,
        };
    }

    finalErrorObject = {
        errorObject,
        errorMetadata,
    };

    return finalErrorObject;
}

function createZodErrorMessage(error: ZodError, source: string) {
    let errorObject = {
        issues: [] as Array<ZodIssue>,
    };

    function codeBuilder(
        source: string,
        reason: string,
        path: (string | number)[]
    ) {
        return `${source
            .toUpperCase()
            .replace(" ", "_")}:VALIDATION_ERROR:${reason
            .toUpperCase()
            .replace(" ", "_")}@${path.join(".")}`;
    }

    for (let issue of error.issues) {
        if (issue.path.length == 0) {
            errorObject.issues.push({
                code: codeBuilder(
                    source,
                    "missing or invalid body query or params",
                    ["root"]
                ),
                friendlyMessage:
                    "The request body, which should exist, is undefined or not an object.",
                location: {
                    form: true,
                    field: false,
                    path: issue.path,
                },
            });

            continue;
        }

        switch (issue.code) {
            case "invalid_type":
                errorObject.issues.push({
                    code: codeBuilder(source, issue.code, issue.path),
                    friendlyMessage: `The value at '${issue.path.join(
                        "."
                    )}' is not of type ${issue.expected}.`,
                    got: issue.received,
                    expected: issue.expected,
                    location: {
                        form: false,
                        field: true,
                        path: issue.path,
                    },
                });
                break;
            case "invalid_string":
                errorObject.issues.push({
                    code: codeBuilder(source, issue.code, issue.path),
                    friendlyMessage: `The value at '${issue.path.join(
                        "."
                    )}' is not a valid string.`,
                    location: {
                        form: false,
                        field: true,
                        path: issue.path,
                    },
                });
                break;
            case "too_big":
                errorObject.issues.push({
                    code: codeBuilder(source, issue.code, issue.path),

                    friendlyMessage: `The value at '${issue.path.join(
                        "."
                    )}' is too big (maximum: ${issue.maximum}).`,
                    location: {
                        form: false,
                        field: true,
                        path: issue.path,
                    },
                });
                break;
            case "too_small":
                errorObject.issues.push({
                    code: codeBuilder(source, issue.code, issue.path),

                    friendlyMessage: `The value at '${issue.path.join(
                        "."
                    )}' is too small (minimum: ${issue.minimum}).`,
                    location: {
                        form: false,
                        field: true,
                        path: issue.path,
                    },
                });
                break;
            default:
                errorObject.issues.push({
                    code: codeBuilder(source, "UNKNOWN", issue.path),
                    friendlyMessage: `An validation error not handled occurred at '${issue.path.join(
                        "."
                    )}'.`,
                    location: {
                        form: false,
                        field: true,
                        path: issue.path,
                    },
                });
                break;
        }
    }

    return errorObject;
}
