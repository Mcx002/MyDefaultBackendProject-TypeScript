import * as nock from 'nock';
import request from 'supertest';
import { runSeed } from 'typeorm-seeding';

import { User } from '../../../src/api/models/User';
import { CreateBruce } from '../../../src/database/seeds/CreateBruce';
import { closeDatabase } from '../../utils/database';
import { BootstrapSettings } from '../utils/bootstrap';
import { prepareServer } from '../utils/server';
import * as jwt from 'jsonwebtoken';
import {env} from '../../../src/env';

describe('/users', () => {

    let bruce: User;
    let bruceAuthorization: string;
    // let expiredAuthorization: string;
    let settings: BootstrapSettings;

    // -------------------------------------------------------------------------
    // Setup up
    // -------------------------------------------------------------------------

    beforeAll(async () => {
        settings = await prepareServer({ migrate: true });
        bruce = await runSeed<User>(CreateBruce);
        bruceAuthorization = jwt.sign({
            id: bruce.id,
            version: env.app.version,
        }, env.passport.secretKey, {
            expiresIn: env.passport.expiration,
        });
        // expiredAuthorization = jwt.sign({
        //     id: bruce.id,
        //     version: env.app.version,
        // }, env.passport.secretKey, {
        //     expiresIn: '0 seconds',
        // });
    });

    // -------------------------------------------------------------------------
    // Tear down
    // -------------------------------------------------------------------------

    afterAll(async () => {
        nock.cleanAll();
        await closeDatabase(settings.connection);
    });

    // -------------------------------------------------------------------------
    // Test cases
    // -------------------------------------------------------------------------

    test('GET: / should return a list of users', async (done) => {
        const response = await request(settings.app)
            .get('/users')
            .set('Authorization', `Bearer ${bruceAuthorization}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.length).toBe(1);
        done();
    });

    // test('GET: / should return error when token expired', async (done) => {
    //     const response = await request(settings.app)
    //         .get('/users')
    //         .set('Authorization', `Bearer ${expiredAuthorization}`)
    //         .expect('Content-Type', /json/)
    //         .expect(500);
    //     expect(response.ok).toBe(false);
    //     done();
    // });

    test('GET: /:id should return bruce', async (done) => {
        const response = await request(settings.app)
            .get(`/users/${bruce.id}`)
            .set('Authorization', `Bearer ${bruceAuthorization}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.id).toBe(bruce.id);
        expect(response.body.firstName).toBe(bruce.firstName);
        expect(response.body.lastName).toBe(bruce.lastName);
        expect(response.body.email).toBe(bruce.email);
        expect(response.body.username).toBe(bruce.username);
        done();
    });

    test('POST: / should create a user', async (done) => {
        const response = await request(settings.app)
            .post(`/users`)
            .set('Authorization', `Bearer ${bruceAuthorization}`)
            .send({
                email: 'user1@gmail.com',
                firstName: 'User',
                lastName: '1',
                password: 'member1234',
                username: 'user1',
            })
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.firstName).toBe('User');
        expect(response.body.lastName).toBe('1');
        expect(response.body.email).toBe('user1@gmail.com');
        expect(response.body.username).toBe('user1');
        done();
    });

    test('PUT: /:id should update a user', async (done) => {
        const response = await request(settings.app)
            .put(`/users/${bruce.id}`)
            .set('Authorization', `Bearer ${bruceAuthorization}`)
            .send({
                firstName: 'Bruce',
                lastName: 'Bahidi',
                email: 'bruceB@gmail.com',
                username: 'bruceajah',
            })
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.id).toBe(bruce.id);
        expect(response.body.firstName).toBe('Bruce');
        expect(response.body.lastName).toBe('Bahidi');
        expect(response.body.email).toBe('bruceB@gmail.com');
        expect(response.body.username).toBe('bruceajah');
        done();
    });

    test('DELETE: /:id should delete a user', async (done) => {
        await request(settings.app)
            .delete(`/users/${bruce.id}`)
            .set('Authorization', `Bearer ${bruceAuthorization}`)
            .expect(200);
        done();
    });

});
