// Generate 500+ US locations for autocomplete
const fs = require('fs');
const path = require('path');

// Common US street names
const streetNames = [
  'Main Street', 'Broadway', 'Park Avenue', '5th Avenue', 'Madison Avenue',
  'Elm Street', 'Oak Street', 'Maple Street', 'Pine Street', 'Cedar Street',
  'Washington Street', 'Lincoln Avenue', 'Jefferson Street', 'Adams Street',
  'Market Street', 'Church Street', 'Spring Street', 'Mill Street',
  'Lake Street', 'Hill Street', 'Center Street', 'Union Street',
  'First Street', 'Second Street', 'Third Street', 'Fourth Street',
  'Sunset Boulevard', 'Hollywood Boulevard', 'Wilshire Boulevard',
  'Michigan Avenue', 'State Street', 'Clark Street', 'Wells Street',
  'Pennsylvania Avenue', 'Constitution Avenue', 'Independence Avenue',
  'Lexington Avenue', 'Amsterdam Avenue', 'Columbus Avenue',
  'Santa Monica Boulevard', 'Melrose Avenue', 'Fairfax Avenue',
  'Lake Shore Drive', 'Wacker Drive', 'LaSalle Street',
  'Mission Street', 'Geary Street', 'Van Ness Avenue', 'Castro Street',
  'Wall Street', 'Canal Street', 'Houston Street', 'Bleecker Street'
];

// Major US cities with states and ZIP codes
const cities = [
  { name: 'New York', state: 'New York', zips: ['10001', '10002', '10003', '10004', '10005', '10012', '10016', '10017', '10022', '10023', '10025'] },
  { name: 'Los Angeles', state: 'California', zips: ['90001', '90002', '90003', '90004', '90005', '90010', '90028', '90036', '90038', '90046', '90069'] },
  { name: 'Chicago', state: 'Illinois', zips: ['60601', '60602', '60603', '60604', '60605', '60606', '60607', '60610', '60611'] },
  { name: 'Houston', state: 'Texas', zips: ['77001', '77002', '77003', '77004', '77005', '77006', '77007', '77008', '77009'] },
  { name: 'Phoenix', state: 'Arizona', zips: ['85001', '85002', '85003', '85004', '85005', '85006', '85007', '85008'] },
  { name: 'Philadelphia', state: 'Pennsylvania', zips: ['19101', '19102', '19103', '19104', '19105', '19106', '19107'] },
  { name: 'San Antonio', state: 'Texas', zips: ['78201', '78202', '78203', '78204', '78205', '78206', '78207'] },
  { name: 'San Diego', state: 'California', zips: ['92101', '92102', '92103', '92104', '92105', '92106', '92107'] },
  { name: 'Dallas', state: 'Texas', zips: ['75201', '75202', '75203', '75204', '75205', '75206', '75207'] },
  { name: 'San Jose', state: 'California', zips: ['95101', '95102', '95103', '95104', '95105', '95106'] },
  { name: 'Austin', state: 'Texas', zips: ['78701', '78702', '78703', '78704', '78705', '78756'] },
  { name: 'Jacksonville', state: 'Florida', zips: ['32201', '32202', '32203', '32204', '32205'] },
  { name: 'San Francisco', state: 'California', zips: ['94102', '94103', '94104', '94105', '94109', '94110', '94114', '94115', '94117', '94133'] },
  { name: 'Columbus', state: 'Ohio', zips: ['43201', '43202', '43203', '43204', '43205'] },
  { name: 'Indianapolis', state: 'Indiana', zips: ['46201', '46202', '46203', '46204', '46205'] },
  { name: 'Fort Worth', state: 'Texas', zips: ['76101', '76102', '76103', '76104', '76105'] },
  { name: 'Charlotte', state: 'North Carolina', zips: ['28201', '28202', '28203', '28204', '28205'] },
  { name: 'Seattle', state: 'Washington', zips: ['98101', '98102', '98103', '98104', '98105'] },
  { name: 'Denver', state: 'Colorado', zips: ['80201', '80202', '80203', '80204', '80205'] },
  { name: 'Washington', state: 'District of Columbia', zips: ['20001', '20002', '20003', '20004', '20005', '20007', '20008', '20009', '20500'] },
  { name: 'Boston', state: 'Massachusetts', zips: ['02101', '02102', '02103', '02104', '02105', '02108', '02109', '02110', '02111', '02113', '02114', '02115'] },
  { name: 'Nashville', state: 'Tennessee', zips: ['37201', '37202', '37203', '37204', '37205'] },
  { name: 'Detroit', state: 'Michigan', zips: ['48201', '48202', '48203', '48204', '48205'] },
  { name: 'Portland', state: 'Oregon', zips: ['97201', '97202', '97203', '97204', '97205'] },
  { name: 'Las Vegas', state: 'Nevada', zips: ['89101', '89102', '89103', '89104', '89105'] },
  { name: 'Memphis', state: 'Tennessee', zips: ['38101', '38102', '38103', '38104', '38105'] },
  { name: 'Louisville', state: 'Kentucky', zips: ['40201', '40202', '40203', '40204', '40205'] },
  { name: 'Baltimore', state: 'Maryland', zips: ['21201', '21202', '21203', '21204', '21205'] },
  { name: 'Milwaukee', state: 'Wisconsin', zips: ['53201', '53202', '53203', '53204', '53205'] },
  { name: 'Albuquerque', state: 'New Mexico', zips: ['87101', '87102', '87103', '87104', '87105'] }
];

// Generate locations
const locations = [];
let count = 0;

// Generate house numbers from 100 to 9999
const houseNumbers = [];
for (let i = 100; i <= 9999; i += 100) {
  houseNumbers.push(i.toString());
}

// Add some specific house numbers
houseNumbers.push('1', '2', '3', '4', '5', '10', '15', '20', '25', '50', '75', '1600', '2000', '2500', '3000');

// Generate combinations
cities.forEach(city => {
  streetNames.forEach(street => {
    houseNumbers.forEach(house => {
      if (count >= 500) return;
      
      const zipIndex = Math.floor(Math.random() * city.zips.length);
      locations.push({
        house: house,
        street: street,
        city: city.name,
        state: city.state,
        zip: city.zips[zipIndex]
      });
      count++;
    });
  });
});

// Shuffle array to mix locations
for (let i = locations.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [locations[i], locations[j]] = [locations[j], locations[i]];
}

// Take first 500
const finalLocations = locations.slice(0, 500);

// Save to JSON file
const outputPath = path.join(__dirname, '..', 'data', 'us-locations.json');
fs.writeFileSync(outputPath, JSON.stringify({ locations: finalLocations }, null, 2));

console.log(`✅ Generated ${finalLocations.length} locations`);
console.log(`📁 Saved to: ${outputPath}`);
console.log(`\nSample locations:`);
console.log(finalLocations.slice(0, 5));
