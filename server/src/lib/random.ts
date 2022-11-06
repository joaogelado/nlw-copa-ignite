import { randomBytes } from "crypto";

// Used to create JWT Signature

export function randomString(length: number): string {
    const code = randomBytes(length);
    const string = code.toString("hex");

    return string;
}
