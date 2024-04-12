import express from 'express'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import cors from 'cors'

const app = express()
const port = 3000

const tokenSecret = process.env.TOKEN_SECRET as string
const users = [
    {username: "jkowal", password: "123"}
];

app.use(cors())
app.use(express.json())

app.get('/', (req,res)=>{
    res.send('test')
})

app.post('/login', (req,res) =>{
    const username = req.body.username
    console.log(username)
    const password = req.body.password
    console.log(password)

    console.log(validateUser(username,password))

    if(validateUser(username,password)){
        const token = generateToken(3000)
        res.status(200).send({token})   
    } else {
        res.status(401).send("Wrong login details!")
    }
})

app.post('/register', (req,res)=>{
    const username = req.body.username
    const password = req.body.password

    const newUser = {username: username, password: password}

    users.push(newUser)

    res.status(201).send("Successfully registered new user!")
})

app.listen(port, () => {
    console.log(`API listening on port: ${port}`)
})

function validateUser(username:string, password: string){
   users.forEach(user =>{
    if(user.username==username && user.password==password){
        return true
    }
   })

   return false
}

function generateToken(expirationInSeconds: number) {
    const exp = Math.floor(Date.now() / 1000) + expirationInSeconds
    const token = jwt.sign({ exp, foo: 'bar' }, tokenSecret, { algorithm: 'HS256' })
    return token
}