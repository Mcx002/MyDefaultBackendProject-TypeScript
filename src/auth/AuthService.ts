import * as express from 'express';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

import { User } from '../api/models/User';
import { UserRepository } from '../api/repositories/UserRepository';
import { Logger, LoggerInterface } from '../decorators/Logger';
import * as jwt from 'jsonwebtoken';
import {env} from '../env';

@Service()
export class AuthService {

    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private userRepository: UserRepository
    ) { }

    public async parseAuthFromRequest(req: express.Request, roles: any[]): Promise<{ username: string, password: string } | User> {
        const authorization = req.header('authorization');

        if (authorization && authorization.split(' ')[0] === 'Basic') {
            this.log.info('Credentials provided by the client');
            const decodedBase64 = Buffer.from(authorization.split(' ')[1], 'base64').toString('ascii');
            const username = decodedBase64.split(':')[0];
            const password = decodedBase64.split(':')[1];
            if (username && password) {
                return { username, password };
            }
            this.log.info('No credentials provided by the client');
        }

        if (authorization && authorization.split(' ')[0] === 'Bearer') {
            const token = authorization.split(' ')[1];
            const decoded = jwt.verify(token, env.passport.secretKey) as any;
            const user = await this.userRepository.findOne({id: decoded.id});

            if (user && !roles.length) {
                return user;
            }
            if (user && roles.find(role => role === user.user_stat)) {
                return user;
            }
            this.log.info('No User founded by token');
        }
        return undefined;
    }

    public async validateUser(username: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: {
                username,
            },
        });

        if (await User.comparePassword(user, password)) {
            return user;
        }

        return undefined;
    }
}
