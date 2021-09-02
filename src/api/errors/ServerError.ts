import {HttpError} from 'routing-controllers';

export class ServerError extends HttpError {
    public error: Error;

    constructor(message: string, code: number = 500, error?: Error) {
        super(code, message);
        this.error = error;
    }
}
