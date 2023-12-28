const fs = require('fs');
const phonenumbers = require('libphonenumber-js'); // Library for handling phone numbers in JavaScript


function isPhoneNumber(value) {
  try {
    return phonenumbers.isValidPhoneNumber(value , "IN")
  } catch (e) {
    return false;
  }
}

const checkPhoneNumber = (number)=>{
  if (isPhoneNumber(number)) {
    let formattedVal = number.replace(/\s/g, ''); // Remove spaces
    if (formattedVal.length > 10) {
      formattedVal = formattedVal.startsWith('+') ? formattedVal.substring(3) : formattedVal.substring(2);
    }
    formattedVal = '91' + formattedVal;
    return formattedVal
  }
  return false

}

async function parseFile(filePath) {
  const phoneNumbers = [];
  try {
    const fileExtension = filePath.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const rows = fileContent.split('\n');
      rows.forEach((row) => {
        const values = row.split(',');
        values.forEach((val) => {
          if (isPhoneNumber(val)) {
            let formattedVal = val.replace(/\s/g, ''); // Remove spaces
            if (formattedVal.length > 10) {
              formattedVal = formattedVal.startsWith('+') ? formattedVal.substring(3) : formattedVal.substring(2);
            }
            formattedVal = '91' + formattedVal;
            phoneNumbers.push(formattedVal);
          }
        });
      });
    } else { // Treat as a text file
      const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
      lines.forEach((line) => {
        const values = line.trim().split(' ');
        values.forEach((val) => {
          // console.lsog(val)
          if (isPhoneNumber(val)) {
            let formattedVal = val.replace(/\s/g, ''); // Remove spaces
            if (formattedVal.length > 10) {
              formattedVal = formattedVal.startsWith('+') ? formattedVal.substring(3) : formattedVal.substring(2);
            }
            formattedVal = '91' + formattedVal;
            phoneNumbers.push(formattedVal);
          }
        });
      });
    }
  } catch (err) {
    console.log('File not found or error reading the file:', err);
  }

  return phoneNumbers;
}

if(require.main == module){
try {
    const filePath = 'numbers.csv';
    const numbersList = parseFile(filePath);
    if (numbersList.length > 0) {
      console.log('Phone numbers in the file:', numbersList);
    } else {
      console.log('No valid phone numbers found in the file.');
    }
    
} catch (error) {
    console.log(error)
    
}
}

module.exports = {
  parseFile ,
  checkPhoneNumber
                };
