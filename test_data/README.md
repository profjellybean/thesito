# Test data

To insert into the DB:
1. Check if the credentials and IP is correct in the file `insert_into_db.py`
2. Make sure current DB is empty. Best way to do that (I think) is to uncomment
   `quarkus.hibernate-orm.database.generation=drop-and-create` in
   `src/main/resources/application.properties` and start with `quarkus dev`
3. Insert `tags` via the `tags.sql`
4. Run `python insert_into_db.py`
5. You may have to restart `quarkus dev` to force elasticsearch reindex. 
   Comment out the option from step 2!!
