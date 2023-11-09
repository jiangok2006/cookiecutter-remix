import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { httpUrl } from '../common/setup';

describe('/user', async () => {
  describe('create a user', () => {
    it('should create a user', async () => {
      const payload = {
        name: 'test',
        email: 'test@abc.com'
      }

      let response = await request(httpUrl)
        .post('/user').send(payload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toEqual(payload)

      response = await request(httpUrl).get('/user')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toEqual({ "status": 200, users: [payload] })

    })
  })
})