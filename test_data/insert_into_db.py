import csv
import datetime
import random
import psycopg2


params = {
    'dbname': 'ase_db',
    'user': 'postgres',
    'password': 'ase',
    'host': 'localhost'
}

def generate_random_date():
    year = random.randint(2010, 2024)
    month = random.randint(1, 12)
    day = random.randint(1, 28)  
    date = datetime.date(year, month, day).isoformat()
    current_date = datetime.date.today().isoformat()
    if date > current_date:
        year = 2023
        date = datetime.date(year, month, day).isoformat()
    return date

def insert_user(row):
    user_id, email, name, password, qualification_type, usertype = row
    conn = psycopg2.connect(**params)
    cursor = conn.cursor()
    try:
        cursor.execute("""INSERT INTO users(id, email, name, password,
        receiveemails, qualification_type)
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;
        """, (user_id, email, name, password, True, "Masters"))

        cursor.execute("""INSERT INTO user_types(user_id, user_type)
            VALUES (%s, %s) RETURNING user_id;
        """, (user_id, usertype))

        # add three tags to each user
        tag_id = 101
        cursor.execute("""INSERT INTO user_tags(tag_id, user_id)
            VALUES (%s, %s) RETURNING user_id;
        """, (tag_id, user_id))

        tag_id = 101003
        cursor.execute("""INSERT INTO user_tags(tag_id, user_id)
            VALUES (%s, %s) RETURNING user_id;
        """, (tag_id, user_id))

        tag_id = 101015
        cursor.execute("""INSERT INTO user_tags(tag_id, user_id)
            VALUES (%s, %s) RETURNING user_id;
        """, (tag_id, user_id))

        conn.commit()
    except Exception as e:
        print("An error occurred:", e)
        conn.rollback()
    finally:
        cursor.execute("ALTER SEQUENCE users_id_seq RESTART WITH 8;")
        conn.commit()
        cursor.close()
        conn.close()

def insert_data(row, listing_id):
    title, details, qualification_type, date, university, advisor, tag_id, tag_name = row
    date = generate_random_date();
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
