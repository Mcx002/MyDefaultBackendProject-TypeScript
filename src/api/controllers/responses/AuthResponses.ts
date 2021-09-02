import {IsString, ValidateNested} from 'class-validator';
import {UserResponse} from './UserResponses';
import {Type} from 'class-transformer';

export class AuthResponse {
    @ValidateNested()
    @Type(() => UserResponse)
    public user: UserResponse;

    @IsString()
    public token: string;
}
