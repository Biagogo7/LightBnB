const properties = require('./json/properties.json');
const users = require('./json/users.json');

// connecting to the db

const { Pool, Client } = require('pg');

const pool = new Pool({
  user: 'labber',
  host: 'localhost',
  database: 'lightbnb',
  password: 'labber',
  port: 5432,
})

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithEmail = function(email) {

  let user;
  
  return pool
  .query(`SELECT * FROM users WHERE email = $1`, [email] || null)
  .then(res => res.rows[0])

  .catch((err) => {
    console.log(err.message);
  });   
  
}
exports.getUserWithEmail = getUserWithEmail;



// /**
//  * Get a single user from the database given their id.
//  * @param {string} id The id of the user.
//  * @return {Promise<{}>} A promise to the user.
//  */


const getUserWithId = function(id) {

  let user;

  return pool
  .query(`SELECT * FROM users WHERE id = $1`, [id] || null)
  .then(res => res.rows[0])
  
  .catch((err) => {
    console.log(err.message);
  });   
}

exports.getUserWithId = getUserWithId;


// /**
//  * Add a new user to the database.
//  * @param {{name: string, password: string, email: string}} user
//  * @return {Promise<{}>} A promise to the user.
//  */


const addUser =  function(user) {
  
  const values = [user.name, user.email, user.password]

  return pool
  .query(`INSERT INTO users
    (name, email, password)
    VALUES
    ($1, $2, $3)
    RETURNING *;`, values)
  .then((result) => result.rows[0])
  .catch((err) => console.log(err))
  
}
exports.addUser = addUser;


/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */

const getAllReservations = function(guest_id, limit = 10) {
  //return getAllProperties(null, 2);
  
  return pool
  .query(`SELECT * FROM reservations WHERE guest_id = $1 LIMIT $2`, [guest_id, limit])
  .then(res => res.rows)  
  .catch((err) => {
    console.log(err.message);
  });   
  
}  
 
exports.getAllReservations = getAllReservations;



/// Properties

// /**
//  * Get all properties.
//  * @param {{}} options An object containing query options.
//  * @param {*} limit The number of results to return.
//  * @return {Promise<[{}]>}  A promise to the properties.
//  */

// const getAllProperties = (options, limit = 10) => {
//   return pool
//     .query(`SELECT * FROM properties LIMIT $1`, [limit])
//     .then((result) =>  result.rows)
//     .catch((err) => {
//       console.log(err.message);
//     });
// };
//   exports.getAllProperties = getAllProperties;

  const getAllProperties = function (options, limit = 10) {
    // 1
    const queryParams = [];
    // 2
    let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_id
    `;
    const arrayFilter = [];
    // 3
    if (options.city) {
      queryParams.push(`%${options.city}%`);
      //queryString += `WHERE city LIKE $${queryParams.length} `;
      arrayFilter.push(`city LIKE $${queryParams.length}`);
    }

    if (options.owner_id) {
      queryParams.push(`${options.owner_id}`);
      //queryString += `WHERE owner_id = $${queryParams.length} `;
      arrayFilter.push(`owner_id = $${queryParams.length}`)
    }

    if (options.minimum_price_per_night) {
      queryParams.push(`${options.minimum_price_per_night * 100} ` );

      //queryString += `WHERE cost_per_night >= $${queryParams.length}`;
      arrayFilter.push(`cost_per_night >= $${queryParams.length}`)     
    }

    if (options.maximum_price_per_night) {
      queryParams.push(`${options.maximum_price_per_night * 100} ` );
      
      //queryString += `WHERE cost_per_night <= $${queryParams.length}`;
      arrayFilter.push(`cost_per_night <= $${queryParams.length}`)     
    }

    if (arrayFilter.length !== 0 ) {
      queryString += `WHERE ${arrayFilter.join(' AND ')}`    
    }


      queryString += ` GROUP BY properties.id `;


    if (options.minimum_rating) {
      queryParams.push(`${options.minimum_rating}`);
      queryString += `HAVING avg(rating) >= $${queryParams.length} `;
    }
  
    // 4
    queryParams.push(limit);
    queryString += `
    
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
    `;
  
    // 5
    console.log(queryString, queryParams);
  
    // 6
    return pool.query(queryString, queryParams).then((res) => res.rows);
  };

  exports.getAllProperties = getAllProperties;



/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */


const addProperty = function(property) {
  
  const values = [property.owner_id,
     property.title,
     property.description,
     property.thumbnail_photo_url,
     property.cover_photo_url,
     property.cost_per_night,
     property.parking_spaces,
     property.number_of_bathrooms,
     property.number_of_bedrooms,
     property.country,
     property.street,
     property.city,
     property.province,
     property.post_code     
    ]

  return pool
  .query(`INSERT INTO properties
    (owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms,
    country,
    street,
    city,
    province,
    post_code    
    )
    VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;`, values)
  .then((result) => result.rows[0])
  .catch((err) => console.log(err))
  
}

exports.addProperty = addProperty;
