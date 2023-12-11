-- Insert into users
INSERT INTO users (id, name, email, password, usertype)
VALUES (10, 'John Doe', 'john@doe.com', 'johnPassword', 'ListingConsumer'),
       (11, 'Jane Smith', 'jane@smith.com', 'janePassword', 'ListingProvider'),
       (12, 'Admin User', 'admin@sample.com', 'adminPassword', 'Administrator');

-- Insert into listings
INSERT INTO listings (id, title, details, qualification_type)
VALUES (0, 'Physics Course', 'Introduction to Physics', 'Bachelors'),
       (1, 'Biology Course', 'Introduction to Biology', 'Masters');

-- Insert into listing_topictags
INSERT INTO listing_tags (listing_id, tag_id)
VALUES ((SELECT id FROM listings WHERE title='Physics Course'), 103004),
       ((SELECT id FROM listings WHERE title='Biology Course'), 301301);
