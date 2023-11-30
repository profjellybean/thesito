import csv
import psycopg2


params = {
    'dbname': 'ase_db',
    'user': 'postgres',
    'password': 'ase',
    'host': 'localhost'
}


def insert_data(row):
    # Extracting data from the row
    title, details, qualification_type, date, university, advisor, tag_id, tag_name = row

    # Connect to the database
    conn = psycopg2.connect(**params)
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO listings (title, details, qualification_type, created_at)
            VALUES (%s, %s, %s, %s) RETURNING id;
        """, (title, details, qualification_type, date))
        listing_id = cursor.fetchone()[0]

        cursor.execute("""
            INSERT INTO listing_tags (listing_id, tag_id)
            VALUES (%s, %s);
        """, (listing_id, tag_id))

        # Commit the transaction
        conn.commit()
    except Exception as e:
        print("An error occurred:", e)
        conn.rollback()
    finally:
        cursor.close()
        conn.close()


# Read the CSV file and insert data into the database
with open('testdata.csv', newline='', encoding="utf-8") as csvfile:
    reader = csv.reader(csvfile)
    next(reader)  # Skip the header row
    for row in reader:
        insert_data(row)

print("Data insertion complete.")
