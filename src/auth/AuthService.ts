import * as express from 'express';
import {Service} from 'typedi';
import {OrmRepository} from 'typeorm-typedi-extensions';

import {User} from '../api/models/User';
import {UserRepository} from '../api/repositories/UserRepository';
import {Logger, LoggerInterface} from '../decorators/Logger';
import * as jwt from 'jsonwebtoken';
import {env} from '../env';
import {SignInRequest} from '../api/controllers/requests/AuthRequests';
import {UnauthorizedError} from 'routing-controllers';
import {AuthResponse} from '../api/controllers/responses/AuthResponses';

@Service()
export class AuthService {

    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private userRepository: UserRepository
    ) { }

    public async signin(req: SignInRequest): Promise<AuthResponse> {
        const user = await this.userRepository.findOne({username: req.username});
        if (user !== undefined && await User.comparePassword(user, req.password)) {
            return {
                user,
                token: this.registAuthToken(user.id),
            };
        } else {
            throw new UnauthorizedError();
        }
    }

    public registAuthToken(id: string): string {
        return jwt.sign({
            id,
            version: env.app.version,
        }, env.passport.secretKey, (env.passport.expiration ? {
            expiresIn: env.passport.expiration,
        } : undefined));
    }

    public async parseAuthFromRequest(req: express.Request): Promise<{id: string, version: string}> {
        const authorization = req.header('authorization');

        if (authorization && authorization.split(' ')[0] === 'Bearer') {
            const token = authorization.split(' ')[1];
            if (token !== undefined) {
                try {
                    const decoded = jwt.verify(token, env.passport.secretKey) as any;
                    if (decoded) {
                        return decoded;
                    }
                } catch (e) {
                    this.log.warn('Token is invalid');
                }
            } else {
                this.log.info('There is no token passed');
            }
        }
        return undefined;
    }

    public async validateUser(id: string, roles: any[]): Promise<User> {
        const user = await this.userRepository.findOne(id);
        if (user && !roles.length) {
            return user;
        }
        if (user && roles.find(role => role === user.user_stat)) {
            return user;
        }
        return undefined;
    }
}
