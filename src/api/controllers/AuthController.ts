import {Body, JsonController, Post} from 'routing-controllers';
import {LoggerInterface} from '../../lib/logger';
import {Logger} from '../../decorators/Logger';
import {AuthService} from '../../auth/AuthService';
import {OpenAPI, ResponseSchema} from 'routing-controllers-openapi';
import {AuthResponse} from './responses/AuthResponses';
import {SignInRequest} from './requests/AuthRequests';

@JsonController('/auth')
export class AuthController {
    constructor(
        @Logger(__filename) log: LoggerInterface,
        private authService: AuthService
    ) {
    }

    @Post('/signin')
    @OpenAPI({
        summary: 'login user',
    })
    @ResponseSchema(AuthResponse)
    public signin(@Body() req: SignInRequest): Promise<AuthResponse> {
        return this.authService.signin(req);
    }
}
