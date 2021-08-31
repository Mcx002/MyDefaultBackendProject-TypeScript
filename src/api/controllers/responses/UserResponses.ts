import {IsUUID} from 'class-validator';
import {BaseUser} from '../requests/UserRequests';

export class UserResponse extends BaseUser {
    @IsUUID()
    public id: string;
}
