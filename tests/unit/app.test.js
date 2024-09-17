const request =require('supertest')
const app = require('../../src/app')

describe('404 Handler', ()=> {
    test('Return 404 satus and error message', async ()=>{
        const response = await request(app).get('/nonExistingRoute') // Make a request to a route that does not exist
       .expect(404) // Expect a 404 status code

        expect(response.body).toEqual({
            status: "error",
            error: {
                message: 'not found',
                code: 404
            }
        })
    } )
})