import { httpUrl, newUser } from '@/tests/common/setup';
import request from 'supertest';
import { describe, expect, it } from 'vitest';



describe('/user', async () => {
  describe('create a user', () => {
    it('should create a user', async () => {
      let response = await request(httpUrl)
        .post('/user').send(newUser)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)

      delete response.body.id
      expect(response.body).toEqual(newUser)

      request(httpUrl).get('/user')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          delete res.body.users[0].id
          expect(res.body).toEqual({ "status": 200, users: [newUser] })
        })
    })
  })
})