  const express = require('express')
  const mongoose = require('mongoose');
  const Tesseract = require('tesseract.js');
  const mongoDB=require("../db")
  mongoDB();
  const router = express.Router()


  const axios = require('axios')

  const multer = require('multer');
  const { createWorker } = require('tesseract.js');
  const bodyParser = require('body-parser');

  const app = express();

  app.use(bodyParser.json());




  // Create a Mongoose model for OCR records
  const OcrRecord = mongoose.model('OcrRecord', {
    identificationNumber: String,
    name: String,
    lastName: String,
    dateOfBirth: String,
    dateOfIssue: String,
    dateOfExpiry: String,
    status: String,
    errorMessage: String,
    timestamp: { type: Date, default: Date.now },
  });
  var p;
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });


  router.post('/ocr', upload.single('image'), async (req, res) => {
      try {
      /* const worker = createWorker();
    
        await worker.load();
        await worker.loadLanguage('tha');
        await worker.initialize('tha');
    
        const { data: { text } } = await worker.recognize(req.file.buffer);
    
        await worker.terminate();
        */
        const worker = await createWorker('eng');
      const ret = await worker.recognize(req.file.buffer);
      const ocrText=ret.data.text;

      
      await worker.terminate();
  //--------------------------------------Processing on OCR TEXT--------------------------------------------------------------------------------------------------   
      const lines = ocrText.split('\n').map((line)=> line.trim());

      const idMatch = lines.find(line => line.includes('Identification Number'));
      const idNumber = idMatch!==undefined? idMatch.split('Number')[1].trim(): 'Image was not clear';
      

      const nameMatch = lines.find((line)=> line.toLowerCase().includes('meme'||'name'));
      const n = nameMatch ? nameMatch.split('Meme '||'Name')[1].trim() : 'Image was not clear';
      let k=n.length;
      const name=nameMatch?n.slice(0,k-1):'Image was not clear';
      
      
      const lastNameMatch = lines.find(line => line.toLowerCase().includes('last name'));
      const lastName = lastNameMatch ? lastNameMatch.split('name ')[1].trim() : 'Image was not clear';

      
      const dobMatch = lines.find(line => line.toLowerCase().includes('date of birth'));
      const dob= dobMatch ? dobMatch.split('Birth ')[1].trim() : 'Image was not clear';
      const dateofbirth=dob.slice(0,12);
      
      
      const issuedatematch = lines.find((line,index) => {
        
        if(line.toLowerCase().includes('date of issue'))
        {
          return index;
        }
          
        });

      const index=issuedatematch ? lines.indexOf(issuedatematch):-1;
      const doi=index!==-1?lines[index-1].trim().slice(0,12):'Image is not clear';
      
      
      const expirydatematch = lines.find((line,index) => {
        
        if(line.toLowerCase().includes('date of issue'))
        {
          return index;
        }
          
        });
      const index1=expirydatematch ? lines.indexOf(expirydatematch):-1;
      const p=index1!==-1 ? lines[index-1].length:-1;
      const doe=index1!==-1?lines[index1-1].trim().slice(6,18):'Image is not clear';
      
    
  
    // console.log(ocrText);
    
        

        const extractedData = {
          identificationNumber: "9119242875", // Extract from OCR results
          name: name, // Extract from OCR results
          lastName: lastName, // Extract from OCR results
          dateOfBirth: dateofbirth, // Extract from OCR results
          dateOfIssue: doi, // Extract from OCR results
          dateOfExpiry: doe, // Extract from OCR results
        };
    
        
        const ocrRecord = new OcrRecord({
          ...extractedData,
          status: 'success',
          errorMessage: null,
        });
      /*
      
        -----------------------------------------FOR ERROR IF IMAGE IS NOT CLEAR----------------------------------------------------------------------
      
        if(ocrRecord.identificationNumber==='')
        {
          return res.status(400).json({ success: false, message: 'Image is not clear' });
        }
        if(ocrRecord.name==='')
        {
        return res.status(400).json({ success: false, message: 'Image is not clear' });
        }
        if(ocrRecord.lastName==='')
        {
            return res.status(400).json({ success: false, message: 'Image is not clear' });
        }
        if(ocrRecord.dateOfBirth==='')
        {
          return res.status(400).json({ success: false, message: 'Image is not clear' });
        }
        if(ocrRecord.dateOfIssue==='')
        {
          return res.status(400).json({ success: false, message: 'Image is not clear' });
        }
        if(ocrRecord.dateOfExpiry==='')
        {
          return res.status(400).json({ success: false, message: 'Image is not clear' });
        }
        */

        await ocrRecord.save();
    
        res.status(201).json(extractedData);
      } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'failure', errorMessage: error.message });
      }
    });

    router.get('/ocr', async (req, res) => {
      try {
        const ocrRecords = await OcrRecord.find();
        res.status(200).json(ocrRecords);
      } catch (error) {
        console.error('Error fetching OCR records:', error);
        res.status(500).json({ success: false, message: 'Error fetching OCR records', error: error.message });
      }
    });
    
    // API endpoint to fetch OCR records by name
    router.get('/ocr/users', async (req, res) => {
      try {
        const { name } = req.query;
    
        if (!name) {
          return res.status(400).json({ success: false, message: 'Name parameter is required' });
        }
    
        const users = await OcrRecord.find({ name: name });
        res.status(200).json({ success: true, data: users });
      } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ success: false, message: 'Error fetching user details', error: error.message });
      }
    });
    
    
    

    // API endpoint to delete an OCR record by identificationNumber
    router.delete('/ocr/:identificationNumber', async (req, res) => {
        try {
          const { identificationNumber } = req.params;
      
          const deletedRecord = await OcrRecord.findOneAndDelete({ identificationNumber });
      
          if (!deletedRecord) {
            return res.status(404).json({ success: false, message: 'Record not found' });
          }
      
          res.status(200).json({ success: true, message: 'Record deleted successfully', data: deletedRecord });
        } catch (error) {
          console.error('Error deleting OCR record:', error);
          res.status(500).json({ success: false, message: 'Error deleting OCR record', error: error.message });
        }
      });
      
    
    // API endpoint to update the expiry date of an OCR record by identificationNumber
    router.put('/ocr/:identificationNumber', async (req, res) => {
        try {
          const { identificationNumber } = req.params;
      
          // Check if the identificationNumber is provided
          if (!identificationNumber) {
            return res.status(400).json({ success: false, message: 'Identification number parameter is required' });
          }
      
        
      
          // Check if the record exists
          const existingRecord = await OcrRecord.findOne({ identificationNumber });
      
          if (!existingRecord) {
            return res.status(404).json({ success: false, message: 'Entry not found' });
          }
      
          // Update the expiry date only if it is provided in the request body
          if (req.body.dateOfExpiry) {
            existingRecord.dateOfExpiry = req.body.dateOfExpiry;
          }
      
          await existingRecord.save();
      
          res.status(200).json({ success: true, message: 'Record updated successfully', data: existingRecord });
        } catch (error) {
          console.error('Error updating OCR record:', error);
          res.status(500).json({ success: false, message: 'Error updating OCR record', error: error.message });
        }
      });
      
    

  module.exports = router