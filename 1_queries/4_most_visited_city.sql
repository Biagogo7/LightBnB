SELECT properties.city as city, count(reservations.id) as total_reservations
FROM properties
JOIN reservations ON properties.id = property_id
GROUP by properties.city
ORDER BY total_reservations DESC;



