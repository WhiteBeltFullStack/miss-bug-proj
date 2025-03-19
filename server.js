import express from 'express'

const app = express()


app.get('/', (req, res) => res.send('Hello there'))
app.get('/api/sasha', (req, res) => res.send('sashaaaa'))










const port = 3030
app.listen(port, () => console.log(`Server ready at port ${port}` ))


