CREATE TYPE user_type AS ENUM ('Administrator', 'ListingConsumer', 'ListingProvider');
CREATE TYPE qualification_type as ENUM ('None', 'Bachelors', 'Masters', 'PhD');

CREATE TABLE users
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    userType user_type,
    qualification_type qualification_type
);

CREATE TABLE listings
(
    id   SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    details VARCHAR NOT NULL,
    qualification_type qualification_type NOT NULL

);

CREATE TABLE tags
(
    id    INTEGER PRIMARY KEY,
    layer INTEGER NOT NULL,
    title_en VARCHAR NOT NULL,
    title_de VARCHAR NOT NULL
);

CREATE TABLE listing_tags
(
    listing_id INTEGER REFERENCES listings(id),
    tag_id INTEGER REFERENCES tags(id),
    PRIMARY KEY (listing_id, tag_id)
);

CREATE TABLE refreshtokens
(
    id    SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL,
    uuid VARCHAR NOT NULL
);
