import {IsEmail, IsNotEmpty} from 'class-validator';

export class BaseUser {
    @IsNotEmpty()
    public firstName: string;

    @IsNotEmpty()
    public lastName: string;

    @IsEmail()
    @IsNotEmpty()
    public email: string;

    @IsNotEmpty()
    public username: string;
}

export class CreateUserBody extends BaseUser {
    @IsNotEmpty()
    public password: string;
}
