-- Insert sample data into listings with corresponding tags

-- Listing 1
INSERT INTO listings (id, details, requirement, title, created_at) VALUES
    (1, 'Exploring the Quantum World', 'PhD', 'Quantum Exploration', '2022-08-15') RETURNING id;
INSERT INTO listing_tags (listing_id, tag_id) VALUES
                                                  (1, 1), (1, 103), (1, 103003), (1, 103020);

-- Listing 2
INSERT INTO listings (id, details, requirement, title, created_at) VALUES
    (2, 'Advancements in Machine Learning', 'Masters', 'ML Progress', '2022-08-16') RETURNING id;
INSERT INTO listing_tags (listing_id, tag_id) VALUES
                                                  (2, 1), (2, 102), (2, 102019);

-- Listing 3
INSERT INTO listings (id, details, requirement, title, created_at) VALUES
    (3, 'Theoretical Insights into Cyber-Physical Systems', 'PhD', 'CPS Theory', '2022-08-17') RETURNING id;
INSERT INTO listing_tags (listing_id, tag_id) VALUES
                                                  (3, 1), (3, 102), (3, 102034);

-- Listing 4
INSERT INTO listings (id, details, requirement, title, created_at) VALUES
    (4, 'Astronomy and the Search for Exoplanets', 'Masters', 'Exoplanet Exploration', '2022-08-18') RETURNING id;
INSERT INTO listing_tags (listing_id, tag_id) VALUES
                                                  (4, 1), (4, 103), (4, 103003);

-- Listing 5
INSERT INTO listings (id, details, requirement, title, created_at) VALUES
    (5, 'Applying Algebraic Techniques in Cryptography', 'PhD', 'Algebraic Cryptography', '2022-08-19') RETURNING id;
INSERT INTO listing_tags (listing_id, tag_id) VALUES
                                                  (5, 1), (5, 101), (5, 101001), (5, 102017);

-- Listing 6
INSERT INTO listings (id, details, requirement, title, created_at) VALUES
    (6, 'Interactive Computer Animation for Educational Purposes', 'Masters', 'Interactive Animation', '2022-08-20') RETURNING id;
INSERT INTO listing_tags (listing_id, tag_id) VALUES
                                                  (6, 1), (6, 102), (6, 102007);

-- Listing 7
INSERT INTO listings (id, details, requirement, title, created_at) VALUES
    (7, 'Mathematical Modeling of Biological Systems', 'PhD', 'Bio Systems Modeling', '2022-08-21') RETURNING id;
INSERT INTO listing_tags (listing_id, tag_id) VALUES
                                                  (7, 1), (7, 101), (7, 101004), (7, 101028);

-- Listing 8
INSERT INTO listings (id, details, requirement, title, created_at) VALUES
    (8, 'Advancements in Statistical Analysis Techniques', 'Masters', 'Statistical Advances', '2022-08-22') RETURNING id;
INSERT INTO listing_tags (listing_id, tag_id) VALUES
                                                  (8, 1), (8, 101), (8, 101018);

-- Listing 9
INSERT INTO listings (id, details, requirement, title, created_at) VALUES
    (9, 'Exploring the History of Computer Science', 'Masters', 'History of Computing', '2022-08-23') RETURNING id;
INSERT INTO listing_tags (listing_id, tag_id) VALUES
                                                  (9, 1), (9, 102), (9, 102012);

-- Listing 10
INSERT INTO listings (id, details, requirement, title, created_at) VALUES
    (10, 'Advanced Techniques in Usability Research', 'PhD', 'Usability Advances', '2022-08-24') RETURNING id;
INSERT INTO listing_tags (listing_id, tag_id) VALUES
                                                  (10, 1), (10, 102), (10, 102024);

-- Listing 11
INSERT INTO listings (id, details, requirement, title, created_at) VALUES
    (11, 'Studying the Dynamics of Time Series', 'Masters', 'Time Series Dynamics', '2022-08-25') RETURNING id;
INSERT INTO listing_tags (listing_id, tag_id) VALUES
                                                  (11, 1), (11, 101), (11, 101026);

-- Listing 12
INSERT INTO listings (id, details, requirement, title, created_at) VALUES
    (12, 'Advancements in Computational Intelligence', 'PhD', 'CI Advances', '2022-08-26') RETURNING id;
INSERT INTO listing_tags (listing_id, tag_id) VALUES
                                                  (12, 1), (12, 102), (12, 102032);

-- Listing 13
INSERT INTO listings (id, details, requirement, title, created_at) VALUES
    (13, 'Exploring the Role of Mathematics in Operations Research', 'Masters', 'Mathematics in OR', '2022-08-27') RETURNING id;
INSERT INTO listing_tags (listing_id, tag_id) VALUES
                                                  (13, 1), (13, 101), (13, 101015);

-- Listing 14
INSERT INTO listings (id, details, requirement, title, created_at) VALUES
    (14, 'Advancements in Astrophysics', 'PhD', 'Astrophysics Advances', '2022-08-28') RETURNING id;
INSERT INTO listing_tags (listing_id, tag_id) VALUES
                                                  (14, 1), (14, 103), (14, 103004);

-- Listing 15
INSERT INTO listings (id, details, requirement, title, created_at) VALUES
    (15, 'Digital Accessibility in Computing', 'Masters', 'Digital Accessibility', '2022-08-29') RETURNING id;
INSERT INTO listing_tags (listing_id, tag_id) VALUES
                                                  (15, 1), (15, 102), (15, 102036);
