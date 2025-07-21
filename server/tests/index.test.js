import request from 'supertest';
import { app } from '../app/server';
const PORT = process.env.PORT || 3000;

describe('Index Test', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(PORT, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should respond with 404 for unknown route', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(404);
  });

  it('should start the server and respond with 200 for known route', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });
});
