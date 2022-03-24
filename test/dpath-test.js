const lib = require('../dmap.js')

describe('dpath', ()=> {
    it('parse', ()=> {
        const ast0 = lib.parse(':free')

        const ast1 = lib.parse(':free:weth')
        console.log(JSON.stringify(ast1))
    })
})
