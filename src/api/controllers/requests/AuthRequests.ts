import {IsNotEmpty} from 'class-validator';

export class SignInRequest {
    @IsNotEmpty()
    public username: string;

    @IsNotEmpty()
    public password: string;
}
