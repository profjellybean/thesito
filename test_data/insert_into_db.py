import csv
import psycopg2

params = {
    'dbname': 'ase_db',
    'user': 'postgres',
    'password': 'ase',
    'host': 'localhost'
}

def insert_user(row):
    user_id, email, name, password, qualification_type, usertype = row
    conn = psycopg2.connect(**params)
    cursor = conn.cursor()
    try:
        cursor.execute("""INSERT INTO users(id, email, name, password)
            VALUES (%s, %s, %s, %s) RETURNING id;
        """, (user_id, email, name, password))

        cursor.execute("""INSERT INTO user_types(user_id, user_type)
            VALUES (%s, %s) RETURNING user_id;
        """, (user_id, usertype))
        conn.commit()
    except Exception as e:
        print("An error occurred:", e)
        conn.rollback()
    finally:
        cursor.execute("ALTER SEQUENCE users_id_seq RESTART WITH 7;")
        conn.commit()
        cursor.close()
        conn.close()

def insert_data(row, listing_id):
    title, details, qualification_type, date, university, advisor, tag_id, tag_name = row
    conn = psycopg2.connect(**params)
    cursor = conn.cursor()
    try:
        owner_id = listing_id%4 + 1;
        cursor.execute("""
            INSERT INTO listings (id, title, details, qualification_type, created_at, active, owner_id, university)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;
        """, (listing_id, title, details, qualification_type, date, True, owner_id, "TU Wien"))
        listing_id = cursor.fetchone()[0]

        cursor.execute("""
            INSERT INTO listing_tags (listing_id, tag_id)
            VALUES (%s, %s);
        """, (listing_id, tag_id))

        conn.commit()
    except Exception as e:
        print("An error occurred:", e)
        conn.rollback()
    finally:
        cursor.execute("ALTER SEQUENCE listings_id_seq RESTART WITH 2657;")
        conn.commit()
        cursor.close()
        conn.close()


# insert users
with open('users.csv', newline='', encoding="utf-8") as csvfile:
    reader = csv.reader(csvfile)
    for row in reader:
        insert_user(row)

# insert listings
with open('testdata.csv', newline='', encoding="utf-8") as csvfile:
    reader = csv.reader(csvfile)
    listing_id = 1

    next(reader)  # Skip the header row
    for row in reader:
        insert_data(row, listing_id)
        listing_id +=1

print("Data insertion complete.")
