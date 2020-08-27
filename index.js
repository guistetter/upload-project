const express = require('express')
const app = express()
const path = require('path')
const s3 = require('s3')
const multer = require('multer')

const upload = multer({dest: 'uploads'})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) =>{
  res.render('index')
})

app.post('/upload', upload.single('foto'),(req, res) => {
  res.send(req.file)
})

app.listen(3000,() => console.log('running...'))