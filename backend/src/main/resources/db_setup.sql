CREATE TYPE user_type AS ENUM ('Administrator', 'ListingConsumer', 'ListingProvider');
CREATE TYPE qualification_type as ENUM ('None', 'Bachelors', 'Masters', 'PhD');

CREATE TABLE users
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    user_type user_type
);

CREATE TABLE topic_tags
(
    id   SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    parent_id INTEGER REFERENCES topic_tags(id)
);

CREATE TABLE listings
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    details VARCHAR NOT NULL,
    requirement qualification_type NOT NULL

);

CREATE TABLE listing_topictags
(
    listing_id INTEGER REFERENCES listings(id),
    topic_tag_id INTEGER REFERENCES topic_tags(id),
    PRIMARY KEY (listing_id, topic_tag_id)
);