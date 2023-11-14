CREATE TYPE user_type AS ENUM ('Administrator', 'ListingConsumer', 'ListingProvider');

CREATE TABLE Users
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    usertype user_type
);
