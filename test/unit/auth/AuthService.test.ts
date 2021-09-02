import { Request } from 'express';
import MockExpressRequest from 'mock-express-request';
import { User } from 'src/api/models/User';

import { AuthService } from '../../../src/auth/AuthService';
import { LogMock } from '../lib/LogMock';
import { RepositoryMock } from '../lib/RepositoryMock';
import {env} from '../../../src/env';
import * as jwt from 'jsonwebtoken';
import uuid from 'uuid';

describe('AuthService', () => {

    let authService: AuthService;
    let userRepository: RepositoryMock<User>;
    let log: LogMock;
    beforeEach(() => {
        log = new LogMock();
        userRepository = new RepositoryMock<User>();
        authService = new AuthService(log, userRepository as any);
    });

    describe('parseTokenFromRequest', () => {
        test('Should return the credentials of the basic authorization header', async () => {
            const rand = uuid.v4();
            const token = jwt.sign({
                id: rand,
                version: env.app.version,
            }, env.passport.secretKey, {
                expiresIn: env.passport.expiration,
            });
            const req: Request = new MockExpressRequest({
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const credentials = await authService.parseAuthFromRequest(req);
            expect(credentials.id).toBe(rand);
        });
        test('Should return undefined if the token is expired', async () => {
            const rand = uuid.v4();
            const token = jwt.sign({
                id: rand,
                version: env.app.version,
            }, env.passport.secretKey, {
                expiresIn: '0 seconds',
            });
            const req: Request = new MockExpressRequest({
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const credentials = await authService.parseAuthFromRequest(req);
            expect(credentials).toBeUndefined();
            expect(log.warnMock).toBeCalledWith('Token is invalid', []);
        });

        test('Should return undefined if there is no bearer authorization header', async () => {
            const req: Request = new MockExpressRequest({
                headers: {
                    Authorization: 'Bearer',
                },
            });
            const token = await authService.parseAuthFromRequest(req);
            expect(token).toBeUndefined();
            expect(log.infoMock).toBeCalledWith('There is no token passed', []);
        });
        //
        test('Should return undefined if there is a invalid bearer authorization header', async () => {
            const req: Request = new MockExpressRequest({
                headers: {
                    Authorization: 'Bearer 1234',
                },
            });
            const token = await authService.parseAuthFromRequest(req);
            expect(token).toBeUndefined();
            expect(log.warnMock).toBeCalledWith('Token is invalid', []);
        });

    });

});
