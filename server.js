const http = require('http')
const fs = require('fs')
const port = 6400
const goodsDB = require ('./goodsDB.json')
const uuid = require('uuid').v4

const writeFileFunction = (data) => {
  fs.writeFile('./goodsDB.json', JSON.stringify(data), 'utf-8', (err, data) => {
    if (err) {
      console.log(err.message)
    } else {
      return data
    }
  })
}

const server = http.createServer((req, res) => {
  const { method, url } = req
  if (method === 'POST' && url.startsWith('/createupdatedGoods')) {
    let body = ''

    req.on('data', (chunks) => {
      body += chunks
      console.log(body)
    })

    req.on('end', () => {
      const data = JSON.parse(body)
      console.log(data)

      const { name, instock, unit, unitprice, quantity, totalprice } = data

      const updatedGoods = {
        id: uuid(),
        name,
        instock,
        unit,
        unitprice,
        quantity,
        totalprice: quantity * unitprice,
      }
      console.log(updatedGoods)

      goodsDB.push(updatedGoods)
      writeFileFunction(goodsDB)

      res.writeHead(201, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          message: 'Good created successfully',
          data: updatedGoods,
        })
      )
    })
  } else if (method === 'GET' && url.startsWith('/getAllgoods')) {
    if (goodsDB.length < 1) {
      res.writeHead(404, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          message: 'Goods not found',
        })
      )
    } else {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          message: 'Goods retrieved successfully',
          data: goodsDB,
        })
      )
    }
  } else if (method === 'PUT' && url.startsWith('/updateGood')) {
    let body = ''

    req.on('data', (chunks) => {
      body += chunks
      console.log(body)
    })

    req.on('end', () => {
      const data = JSON.parse(body)
      console.log(data)
      const id = url.split('/')[2]
      console.log(id)
      const good = goodsDB.find((e) => e.id === id)
      const findGoodIndex = goodsDB.findIndex((e) => e.id === good.id)
      goodsDB[findGoodIndex] = { ...goodsDB[findGoodIndex], ...data }

      writeFileFunction(goodsDB)
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          message: 'Good updated successfully',
          data: goodsDB[findGoodIndex],
        })
      )
    })
  } else if (method === 'DELETE' && url.startsWith('/deleteGoods')) {
    const id = url.split('/')[2]
    const good = goodsDB.find((e) => e.id === id)
    const goodIndex = goodsDB.findIndex((e) => e.id === good.id)

    if (goodIndex === -1) {
      res.writeHead(404, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          message: 'Not found',
        })
      )
    } else {
      goodsDB.splice(goodIndex, 1)
      writeFileFunction(goodsDB)

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          message: 'Good deleted successfully',
          data: null,
        })
      )
    }
  }
})

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})