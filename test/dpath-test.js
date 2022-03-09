const lib = require('../dmap.js')

describe('dpath', ()=> {
    it('parse', ()=> {
        const ast0 = lib.parse(':root')
        console.log(ast0)
    })
})
