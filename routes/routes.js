const { json } = require('express');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const multer = require('multer')
var multerAzure = require('multer-azure')

const fs = require('fs')
const Razorpay = require('razorpay')
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { success, error, validation } = require("./responseApi");
var mysql = require('mysql');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceaccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



var connection = mysql.createConnection({
  multipleStatements: true,


  ssl: {
    rejectUnauthorized: false
  },
  host: "forteennew.mysql.database.azure.com", user: "prateek", password: "Sis#1605", database: "fourteen", port: 3306, timeout: 5000,
});




var uploadimage = multer({
  storage: multerAzure({
    account: 'logifilkes', //The name of the Azure storage account
    key: '6Fe5CO+e23a+ttd52n8bLNOMCdjo05FPUSqr9ShlpnJo6KiocLBeMORrRWS3V7vTcbDHRVHpMvcl+AStp1nk5Q==', //A key listed under Access keys in the storage account pane
    container: 'logo',  //Any container name, it will be created if it doesn't exist
    blobPathResolver: function (req, file, callback) {
      var blobPath = GetRandomId(1080, 800000) + ".jpg"
      callback(null, blobPath);
    }
  })
})

const sendFireBaseNotifications = (registrationToken, _title, _body) => {

  try {

    const message = {
      data: {
        title: _title,
        body: _body
      },
      token: registrationToken
    };
    admin.messaging().send(message)
      .then((response) => {
        console.log('Notification sent:', response);
      })
      .catch((error) => {
        console.error('Error sending notification:', error);
      });
  }
  catch (err) {





  }


};













function GetRandomId(min, max) {
  return Math.floor(
    Math.random() * (max - min) + min
  )
}



















var pool = mysql.createPool({

  connectionLimit: 10,
  host: "forteennew.mysql.database.azure.com", user: "prateek", password: "Sis#1605", database: "fourteen", port: 3306, timeout: 5000,
});




// Vitacore

// Vitacore
router.post('/user/post', async (req, res) => {
  const { emailAddress, name, image, referedBy } = req.body;

  if (!emailAddress || !name) {
    return res.status(400).json({ error: 'emailAddress and name are required' });
  }

  try {

    pool.query('select * from vitacureuser where emailAddress = ?', [emailAddress], function (errors, results, fields) {
      if (errors) throw errors;
  
      if (results.length == 0)
         {
        pool.query('insert into vitacureuser (referedBy, emailAddress, name, image) values (?, ?, ?, ?)', [referedBy, emailAddress, name, image], function (errors, results, fields) {

          if (errors) throw errors;

          console.log(results);
          pool.query('SELECT * FROM vitacureuser WHERE userId = ?', [results.insertId], function (errors, user, fields) {
            if (errors) throw errors;
  
  
            return res.json(success("User Added Successfully", { data: user[0] }, res.statusCode)); 
          });




        });
      


    

      }
      else {
        return res.json(success("Login Successful!", { data: results }, 200))
      }
  
  
  
    });













    /*  const  [users] =  await pool.query('SELECT * FROM vitacureuser WHERE emailAddress = ?', [emailAddress]);

    if (users.length > 0) {
      // User exists, return the user  
      return res.json(success("User Added Successfully", { data: users[0] }, res.statusCode));
    } else {
      const [result] = pool.Connection.query(
        'INSERT INTO vitacureuser (referredBy, emailAddress, name, image) VALUES (?, ?, ?, ?)',
        [referredBy, emailAddress, name, image]
      );

      // Fetch the newly inserted user
      const [newUser] = pool.query('SELECT * FROM vitacureuser WHERE id = ?', [result.insertId]);

      return res.json(success("User Added Successfully", { data: newUser[0] }, res.statusCode)); */
  //  }
  } catch (err) {
   // console.error('Error:', err);
   // return res.status(500).json({ error: 'Internal server error' });
  }
});



router.get("/User/UpdateMobile/:mobile", async (req, res) => {
  try {
      // Verify the token and extract userId
      const userId =  req.params.userId;
      const newMobile = req.params.mobile;

      // Update the user's mobile number in the database
      const [updateResult] = await pool.query(
          "UPDATE vitacureuser SET mobile = ? WHERE userId = ?",
          [newMobile, userId]
      );

      if (updateResult.affectedRows === 0) {
          return res.status(404).json({
              status: "error",
              message: "User not found or mobile number not updated",
          });
      }

      return res.json({
          status: "success",
          message: "Phone Number Updated!",
          data: "1",
      });

  } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
          status: "error",
          message: "Something went wrong",
          error: error.message,
      });
  }
});

router.post("/User/UpdateProfile", async (req, res) => {
  try {
      // Verify the token and extract userId
    
   

      // Extract name and image from request body
      const { name, image,userId} = req.body;

      // Update the user's profile (name and image) in the database
      const [updateResult] = await pool.query(
          "UPDATE vitacureuser SET name = ?, image = ? WHERE userId = ?",
          [name, image, userId]
      );

      if (updateResult.affectedRows === 0) {
          return res.status(404).json({
              status: "error",
              message: "Profile update failed. Please try later.",
              data: "1",
          });
      }

      return res.json({
          status: "success",
          message: "Profile Updated Successfully",
          data: "0",
      });

  } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
          status: "error",
          message: "Something went wrong",
          error: error.message,
      });
  }
});

router.get("/medicalreport/GetReport", async (req, res) => {
  try {
      // Verify the token and extract userId
 
      const userId =  req.params.userId;

      // Query to get all medical records for the user from the medicalrecordsvitacore table
      const [results] = await pool.query(
          "SELECT * FROM medicalrecordsvitacore WHERE userId = ?",
          [userId]
      );

      // Iterate over the records and format the date (convert to "ago" format)
      results.forEach((record) => {
          const dateTimeStamp = new Date(record.dateTimeStamp);
          record.ago = moment(dateTimeStamp).fromNow();
      });

      // Return the records
      return res.json({
          status: "success",
          message: "OK",
          data: results,
      });

  } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
          status: "error",
          message: "Something went wrong",
          error: error.message,
      });
  }
});


router.get("/medicalreport/GetSmartReport/:recordId", async (req, res) => {
  try {
      // Extract recordId from URL parameters
      const recordId = req.params.recordId;

      // MySQL query to get data from MedicalRecordAI table and join with vitaldetailsvitacore table
      const [results] = await pool.query(
          `
          SELECT m.*, v.normalizedText, v.image
          FROM medicalrecordaidatas m
          JOIN vitaldetailsvitacore v ON m.vitalId = v.vitalId
          WHERE m.recordId = ?
          `,
          [recordId]
      );

      if (results.length === 0) {
          return res.status(404).json({
              status: "error",
              message: "Record not found",
          });
      }

      // Return the joined results
      return res.json({
          status: "success",
          message: "OK",
          data: results,
      });

  } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
          status: "error",
          message: "Something went wrong",
          error: error.message,
      });
  }
});

router.post("/vitaldetails/post", async (req, res) => {
  try {
  

    const { normalizedText, normalvalues, description, majorVitalId } = req.body;

    // Generate a random vitalId
    const vitalId = GetRandomId(10000, 1000000);

    // MySQL query to insert the new vital details into the table
    const [result] = await pool.query(
      `
      INSERT INTO vitaldetailsvitacore (vitalId, normalizedText, normalvalues, description, majorVitalId)
      VALUES (?, ?, ?, ?, ?)
      `,
      [vitalId, normalizedText, normalvalues, description, majorVitalId]
    );

    // Return a success response with the inserted data
    return res.json({
      status: "success",
      message: "OK",
      data: {
        vitalId,
        normalizedText,
        normalvalues,
        description,
        majorVitalId,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: error.message,
    });
  }
});



router.get("/vitaldetails/getcharts/:vitalId", async (req, res) => {
  try {
    // Decode the JWT token to extract userId
 
    const userId = req.params.userId;
    const vitalId = req.params.vitalId;

    // MySQL query to fetch data based on userId and vitalId
    const [results] = await pool.query(
      `
      SELECT * 
      FROM medicalrecordaidatas 
      WHERE userId = ? AND vitalId = ?
      `,
      [userId, vitalId]
    );

    if (results.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No records found",
      });
    }

    // Return the records
    return res.json({
      status: "success",
      message: "OK",
      data: results,
    });

  } catch (errors) {
    console.error("Error:", errors);
    return res.status(500).json({
      status: "error",
      message: errors.message,
    });
  }
});



router.get("/vitaldetails/updateVitalValue/:mraiId/:testvalue/:testname", async (req, res) => {
  try {

    // Extract parameters from the request
    const { mraiId, testvalue, testname } = req.params;

    // MySQL query to update the test value and test name based on mraiId
    const [result] = await pool.query(
      `
      UPDATE medicalrecordaidatas
      SET testvalue = ?, testname = ?
      WHERE mraiId = ?
      `,
      [testvalue, testname, mraiId]
    );

    // Check if the update was successful
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Record not found",
      });
    }

    // Return success message
    return res.json({
      status: "success",
      message: "Record Successfully Updated",
      data: { affectedRows: result.affectedRows },
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: error.message,
    });
  }
});



router.get("/vitaldetails/updateVitalValue/:mraiId/:testvalue/:testname", async (req, res) => {
  try {
    // Extract parameters from the request
    const { mraiId, testvalue, testname } = req.params;

    // MySQL query to update the test value and test name based on mraiId
    const [result] = await pool.query(
      `
      UPDATE medicalrecordaidatas
      SET testvalue = ?, testname = ?
      WHERE mraiId = ?
      `,
      [testvalue, testname, mraiId]
    );

    // Check if the update was successful
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Record not found",
      });
    }

    // Return success message
    return res.json({
      status: "success",
      message: "Record Successfully Updated",
      data: { affectedRows: result.affectedRows },
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: error.message,
    });
  }
});





router.get("/smartHealth/GetSmartHealthAnalysis", async (req, res) => {
  try {
    // Decode the JWT token to extract userId
   
    const userId =  req.params.userId;
    // MySQL query to join `majorvitalsvitacore`, `vitaldetailsschemas`, and `medicalrecordaidatas` tables
    const [results] = await pool.query(
      `
      SELECT mv.*, vd.*, mr.*
      FROM majorvitalsvitacore mv
      LEFT JOIN vitaldetailsschemas vd ON mv.majorVitalId = vd.majorVitalId
      LEFT JOIN vitaldetailsvitacore mr ON vd.vitalId = mr.vitalId
      WHERE mv.userId = ?
      `,
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No records found",
      });
    }

    // Return the combined data as a response
    return res.json({
      status: "success",
      message: "OK",
      data: results,
    });
  } catch (errors) {
    console.error("Error:", errors);
    return res.status(500).json({
      status: "error",
      message: errors.message,
    });
  }
});

router.post("/vitaldetails/addHeartRate", async (req, res) => {
  try {
    // Decode the JWT token to get userId


    // Get the data from the request body
    const { testname, testvalue, testunit, normalizedText, vitalId, dated,userId } = req.body;

    // Generate random mraiId
    const mraiId = GetRandomId(10000, 1000000);

    // MySQL query to insert the data into `medicalrecordaidatas` table
    const [result] = await pool.query(
      `
      INSERT INTO medicalrecordaidatas (mraiId, recordId, testname, testvalue, testunit, normalizedText, vitalId, dated, userId, status)
      VALUES (?, 0, ?, ?, ?, ?, ?, ?, ?)
      `,
      [mraiId, testname, testvalue, testunit, normalizedText, vitalId, dated, userId, true] // Assuming 'status' is true by default
    );

    // Return success response
    return res.json({
      status: "success",
      message: "Heart Rates Added",
      data: { mraiId }, // Returning the generated mraiId
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});


router.get("/getvitals/getvitalsByMajorVitalId/:majorVitalId", async (req, res) => {
  const majorVitalId = req.params.majorVitalId;
  
 
  try {
    // MySQL query to fetch vital details by majorVitalId
    const [rows] = await pool.query(
      "SELECT * FROM vitaldetailsvitacore WHERE majorVitalId = ?",
      [majorVitalId]
    );

    // If no data is found
    if (rows.length === 0) {
      return res.json({
        status: "error",
        message: "No vitals found for the given majorVitalId",
        data: [],
      });
    }

    // Return the fetched vitals
    return res.json({
      status: "success",
      message: "Vitals Fetched Successfully",
      data: rows, // Returning the fetched rows as data
    });
  } catch (error) {
    console.error("Error fetching vitals:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/labtest/getProviderToken/:providerId", async (req, res) => {
  const providerId = req.params.providerId;

  if (providerId == 1) {
    // Provider 1 requires external API login to fetch token
    const config = {
      baseURL: "https://velso.thyrocare.cloud/api",
    };

    axios
      .post(
        "/Login/Login",
        {
          username: "9650269758",
          password: "050A24",
          portalType: "",
          userType: "dsa",
          facebookId: "string",
          mobile: "string",
        },
        config
      )
      .then(function (response) {
        res.json(
          success("Meddleware Logged In", { data: response.data.apiKey }, res.statusCode)
        );
      })
      .catch(function (error) {
        res.json(error("Error while logging in", res.statusCode));
      });
  } else {
    try {
      // For other providerId, fetch token from MySQL database
      const [rows] = await pool.query(
        "SELECT apiKey FROM providers WHERE providerId = ?",
        [providerId]
      );

      if (rows.length > 0) {
        res.json(
          success("Provider Token Fetched Successfully", { data: rows[0].apiKey }, res.statusCode)
        );
      } else {
        res.json(error("Provider not found", res.statusCode));
      }
    } catch (error) {
      console.error("Error fetching provider token:", error);
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
});




router.post('/labtest/gettests', async (req, res) => {
  const { providerId, type: testtype, apiKey: vendorApiKey } = req.body;

  if (providerId === 1) {
    // If providerId is 1, you still call the external API
    var config = {
      baseURL: 'https://velso.thyrocare.cloud/api',
    };

    try {
      const response = await axios.post('/productsmaster/Products', {
        ProductType: testtype,
        apiKey: vendorApiKey
      }, config);

      let testsArray = [];
      
      switch (testtype) {
        case 'TEST':
          response.data.master.tests.forEach(results => {
            let childArray = [];
            results.childs.forEach(child => {
              childArray.push({
                name: child.name,
                code: child.code,
                groupName: results.groupName,
              });
            });

            testsArray.push({
              name: results.name,
              code: results.code,
              testCount: results.testCount,
              fasting: results.fasting,
              diseaseGroup: results.diseaseGroup,
              units: results.units,
              groupName: results.groupName,
              category: results.category,
              rate: results.rate.b2C,
              discount: results.rate.b2B,
              testlist: childArray
            });
          });

          return res.json(success("Lab Tests Fetched Successfully", { data: testsArray }, res.statusCode));
        
        case 'Profile':
        case 'Offer':
          // Similar handling for 'Profile' and 'Offer'
          response.data.master[testtype.toLowerCase()].forEach(results => {
            let childArray = [];
            results.childs.forEach(child => {
              childArray.push({
                name: child.name,
                code: child.code,
                groupName: results.groupName,
              });
            });

            testsArray.push({
              name: results.name,
              code: results.code,
              testCount: results.testCount,
              fasting: results.fasting,
              diseaseGroup: results.diseaseGroup,
              units: results.units,
              groupName: results.groupName,
              category: results.category,
              rate: results.rate.b2C,
              discount: results.rate.b2B,
              image: results.imageMaster[0].imgLocations,
              image1: results.imageMaster[1].imgLocations,
              testlist: childArray
            });
          });

          return res.json(success("Lab Tests Fetched Successfully", { data: testsArray }, res.statusCode));

        default:
          console.log(`Sorry, we are out of ${testtype}.`);
          return res.json(error(`No valid test type: ${testtype}`, res.statusCode));
      }
    } catch (error) {
      console.error(error);
      return res.json(error("Error fetching lab tests", res.statusCode));
    }
  } else {
    // If providerId is not 1, retrieve from MySQL
    try {
      // Example query to retrieve tests from MySQL based on providerId and testtype
      const [rows] = await pool.query(
        `SELECT * FROM lab_tests WHERE providerId = ? AND testType = ?`, 
        [providerId, testtype]
      );

      if (rows.length === 0) {
        return res.json(error("No lab tests found for the given provider and test type", res.statusCode));
      }

      return res.json(success("Lab Tests Fetched Successfully", { data: rows }, res.statusCode));

    } catch (error) {
      console.error(error);
      return res.json(error("Error fetching data from MySQL", res.statusCode));
    }
  }
});

router.post('/labtest/getAppontmentSlots', async (req, res) => {
  const { providerId, Pincode: pincode, apiKey: vendorApiKey, date } = req.body;

  if (providerId === 1) {
    // External API call to Thyrocare for providerId 1
    const config = {
      baseURL: 'https://velso.thyrocare.cloud/api',
    };

    try {
      const response = await axios.post('/TechsoApi/GetAppointmentSlots', {
        Pincode: pincode,
        ApiKey: vendorApiKey,
        Date: date
      }, config);

      const slotsArray = response.data.lSlotDataRes.map(child => ({
        id: child.id,
        slot: child.slot,
      }));

      res.json(success(response.data.response, { data: slotsArray }, res.statusCode));
    } catch (error) {
      console.log(error);
      res.json(error("Error fetching appointment slots", res.statusCode));
    }
  } else {
    // For other providerId, query from MySQL
    try {
      const [rows] = await pool.query(
        `SELECT * FROM appointment_slots WHERE providerId = ? AND pincode = ? AND date = ?`, 
        [providerId, pincode, date]
      );

      if (rows.length === 0) {
        return res.json(error("No appointment slots found", res.statusCode));
      }

      res.json(success("Appointment slots fetched successfully", { data: rows }, res.statusCode));
    } catch (error) {
      console.log(error);
      res.json(error("Error fetching appointment slots from MySQL", res.statusCode));
    }
  }
});

// Route for verifying Pincode availability
router.post('/labtest/verifyPinCodeAvaiblity', async (req, res) => {
  const { providerId, Pincode: pincode, apiKey: vendorApiKey } = req.body;

  if (providerId === 1) {
    // External API call to Thyrocare for providerId 1
    const config = {
      baseURL: 'https://velso.thyrocare.cloud/api',
    };

    try {
      const response = await axios.post('/TechsoApi/PincodeAvailability', {
        Pincode: pincode,
        ApiKey: vendorApiKey
      }, config);

      res.json(success(response.data.response, { data: response.data }, res.statusCode));
    } catch (error) {
      console.log(error);
      res.json(error("Error verifying Pincode availability", res.statusCode));
    }
  } else {
    // For other providerId, query MySQL to verify Pincode availability
    try {
      const [rows] = await pool.query(
        `SELECT * FROM pincode_availability WHERE providerId = ? AND pincode = ?`, 
        [providerId, pincode]
      );

      if (rows.length === 0) {
        return res.json(error("Pincode not available for the given provider", res.statusCode));
      }

      res.json(success("Pincode availability verified successfully", { data: rows }, res.statusCode));
    } catch (error) {
      console.log(error);
      res.json(error("Error verifying Pincode availability from MySQL", res.statusCode));
    }
  }
});






router.post('/labtest/bookLabTest', async (req, res) => {
 
  const { providerId, apiKey, Email, Gender, Mobile, Address, ApptDate, Pincode, Product, Rate, Reports, BenCount, ReportCode, BenDataXML,userId } = req.body;

  if (providerId === 1) {
    const config = {
      baseURL: 'https://velso.thyrocare.cloud/api',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await axios.post('/BookingMaster/DSABooking', {
        ApiKey: apiKey,
        Email,
        Gender,
        Mobile,
        Address,
        ApptDate,
        Pincode: String(Pincode),
        Product,
        Rate,
        ReportCode,
        Reports,
        BenCount,
        BenDataXML,
        Margin: "0",
        OrderId: String(GetRandomId(10000, 1000000)),
        OrderBy: "DSA",
        Passon: 0,
        PayType: "Postpaid",
        PhoneNo: "",
        Remarks: "",
        ServiceType: "H",
        RefCode: "9650269758",
      }, config);

      if (response.data.respId === "RES02012") {
        // Insert into laborderdetails table
        const labOrderDetails = {
          orderId: response.data.refOrderId,
          userId,
          providerId,
          bookedOn: moment().format('YYYY-MM-DD HH:mm:ss'), // Current timestamp
          address: Address,
          product: Product,
          rate: response.data.customerRate,
          paymentType: response.data.payType,
          serviceType: response.data.serviceType,
          appointmentDate: ApptDate,
        };

        const query = 'INSERT INTO laborderdetails (orderId, userId, providerId, bookedOn, address, product, rate, paymentType, serviceType, appointmentDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [
          labOrderDetails.orderId,
          labOrderDetails.userId,
          labOrderDetails.providerId,
          labOrderDetails.bookedOn,
          labOrderDetails.address,
          labOrderDetails.product,
          labOrderDetails.rate,
          labOrderDetails.paymentType,
          labOrderDetails.serviceType,
          labOrderDetails.appointmentDate,
        ], (err, result) => {
          if (err) {
            console.log("Error saving to MySQL:", err);
            return res.json(error("Database error", res.statusCode));
          }
          console.log("Order saved successfully to MySQL:", result);
          res.json(success("Done", { data: response.data }, res.statusCode));
        });
      } else {
        res.json(error("Error in booking lab test", res.statusCode));
      }
    } catch (err) {
      console.log("Error with Axios request:", err);
      res.json(error("Failed to book lab test", res.statusCode));
    }
  } else {
    res.json(error("Invalid provider", res.statusCode));
  }
});



router.post('/vitaldetails/addCustomVitalRecords', async (req, res) => {
 

  // Get data from request body
  const { testname, testvalue, testunit, normalizedText, vitalId, dated, majorVitalId,userId } = req.body;

  const mraiId = GetRandomId(10000, 1000000); // Generate random ID for mraiId
  const recordId = 0; // Default value for recordId

  const query = `INSERT INTO medicalrecordaidatas (mraiId, recordId, testname, testvalue, testunit, normalizedText, vitalId, dated, userId, majorVitalId) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [mraiId, recordId, testname, testvalue, testunit, normalizedText, vitalId, dated, userId, majorVitalId];

  db.query(query, values, (err, result) => {
    if (err) {
      console.log("Error inserting into MySQL:", err);
      return res.json(error("Database error", res.statusCode));
    }
    console.log("Vital record added successfully to MySQL:", result);
    res.json(success("Vitals Added Successfully", { data: "1" }, res.statusCode));
  });
});






router.get('/labtest/Getbeni/:beniUserId', async (req, res) => {
  const { beniUserId } = req.params;

  const query = `
    SELECT * FROM beneficiaries
    WHERE beniUserId = ?
  `;

  db.query(query, [beniUserId], (err, result) => {
    if (err) {
      return res.json(error("Error fetching beneficiaries", res.statusCode));
    }
    res.json(success("OK", { data: result }, res.statusCode));
  });
});

router.get('/labtest/GetbeniDetails/:baniid', async (req, res) => {
  const { baniid } = req.params;

  const query = `
    SELECT * FROM beneficiaries
    WHERE baniid = ?
  `;

  db.query(query, [baniid], (err, result) => {
    if (err) {
      return res.json(error("Error fetching beneficiary details", res.statusCode));
    }
    res.json(success("OK", { data: result }, res.statusCode));
  });
});

router.get('/labtest/getOrders', async (req, res) => {


  const userId = req.params.userId;
  
  const query = `
    SELECT * FROM laborderdetails
    WHERE userId = ?
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.json(error("Error fetching orders", res.statusCode));
    }
    res.json(success("OK", { data: result }, res.statusCode));
  });
});
router.post('/labtest/getOrdersSummary', async (req, res) => {
  const { orderId, providerId, apiKey,userId } = req.body;

  if (providerId == 1) {
    var config = {
      baseURL: 'https://velso.thyrocare.cloud/api',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    axios.post('/OrderSummary/OrderSummary', { ApiKey: apiKey, OrderNo: orderId }, config)
      .then(function (data) {
        if (data.data.respId == "RES00001") {
          res.json(success(data.data.response, { data: data.data }, res.statusCode));
        } else {
          res.json(success(data.data.response, { data: data.data }, res.statusCode));
        }
      })
      .catch(function (error) {
        res.json(error("Error fetching order summary", res.statusCode));
      });
  } else {
    res.json(error("Invalid provider", res.statusCode));
  }
});



module.exports = router;
