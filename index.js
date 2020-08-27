const express = require('express')
const app = express()
const path = require('path')
require('dotenv/config')
const s3 = require('s3')
const multer = require('multer')
const upload = multer({dest: 'uploads'})
const fs = require('fs')
const paramsS3 = {
  s3Options:{
    accessKeyId: process.env.ACCESS_ID,
    secretAccessKey: process.env.SECRET_KEY,
    region: 'us-east-1'
  }
}
const client = s3.createClient(paramsS3)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) =>{
  res.render('index')
})

app.post('/upload', upload.single('foto'),(req, res) => {
  const params = {
    localFile: req.file.path,
    s3Params:{
      Bucket: 'primeiro-bucket-s3',
      Key: req.file.originalname
    }
  }
  const uploader = client.uploadFile(params)
  uploader.on('end', () => {
    fs.unlinkSync(req.file.path)
    res.send(req.file)
  })
})

app.listen(3000,() => console.log('running...'))