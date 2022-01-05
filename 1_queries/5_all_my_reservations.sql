SELECT reservations.*, properties.*, avg(rating) as average_rating
FROM properties
JOIN reservations ON properties.id = property_id
JOIN property_reviews ON property_reviews.property_id = reservations.property_id
WHERE reservations.guest_id = 1 AND end_date < now()::date
GROUP by reservations.id, properties.id
ORDER BY start_date
LIMIT 10;

