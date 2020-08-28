const express = require('express')
const app = express()
const path = require('path')
require('dotenv/config')
const s3 = require('s3')
const multer = require('multer')
const upload = multer({dest: 'uploads'})
const fs = require('fs')
const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_DATABASE, process.env.DATABASE_USER, process.env.DATABASE_SECRET,{
  dialect: 'mysql',
  host: process.env.DATABASE_HOST
})
//name sera o key no s3...
const Arquivo = sequelize.define('Arquivo',{
  name: Sequelize.STRING
})

const s3Config = {
  accessKeyId: process.env.ACCESS_ID,
  secretAccessKey: process.env.SECRET_KEY,
  bucket: 'primeiro-bucket-s3',
  region: 'us-east-1'
}
// const paramsS3 = {
//   s3Options:{
//     accessKeyId: process.env.ACCESS_ID,
//     secretAccessKey: process.env.SECRET_KEY,
//     region: 'us-east-1'
//   }
// }
// const client = s3.createClient(paramsS3)
const client = s3.createClient({s3Options: s3Config})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) =>{
  res.render('index')
})

uploadToS3 = (file, key, mimetype, s3Config) => {
  const params = {
    localFile: file, 
    s3Params:{
      Bucket: s3Config.bucket, 
      Key: key,
      ContentType: mimetype
    }
  }
  return new Promise((resolve, reject) => {
    const uploader = client.uploadFile(params)
    uploader.on('end',()=>{
      resolve()
    })
  })
}
const removeFile = (file) =>{
  return new Promise((resolve,reject)=>{
    fs.unlink(file, (err)=>{
      if(err){
        reject(err)
      }else{
        resolve()
      }
    })
  })
}
app.post('/upload', upload.single('foto'), async(req, res) => {
  await uploadToS3(req.file.path, req.file.originalname, req.file.mimetype, s3Config)
  await removeFile(req.file.path)
  //res.send(req.file)
  res.redirect('/')
})
// app.post('/upload', upload.single('foto'),(req, res) => {
//   const params = {
//     localFile: req.file.path,
//     s3Params:{
//       Bucket: 'primeiro-bucket-s3',
//       Key: req.file.originalname
//     }
//   }
//   const uploader = client.uploadFile(params)
//   uploader.on('end', () => {
//     fs.unlinkSync(req.file.path)
//     res.send(req.file)
//   })
// })

sequelize.sync().then(()=>{
  app.listen(3000,() => console.log('running...'))
})