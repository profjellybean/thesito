from openai import OpenAI
import random
import datetime
import csv
client = OpenAI()

qualification = ['None', 'Bachelors', 'Masters', 'PhD']
universities = ["Sofa State University (SSU),", "University of Underwater Basket Weaving (UUBW)",
                "Couch Potato College (CPC)", "Pajama Party Institute (PPI)",
                "Procrastination University (PU)", "Extra Terrestrial Academy (ETA)",
                "Academy of Advanced Armchair Philosophy (AAAP)", "Bigfoot School of Natural Mysteries (BSNM)"
                , "Institute of Imaginary Inventions (III)", "School of Selective Studies (SSS)", "Hibernation University (HU)",
                "College of Comical Arts (CCA)", "University of Unlimited Naps (UUN)", "Virtual Reality Varsity (VRV)",
                "Academy for Aspiring Superheroes (AAS)"]

title_message = "Provide me with a research title or thesis topic. Add a touch of humor to it, please. It should relate to: "
description_message = """Generate a compelling and humorous research topic
description that spans around 200 words. This description should outline the
potential benefits and advancements that could arise from the proposed research
while also encouraging student engagement.  The description should align with a
specific title:"""
name_message = "Suggest a plausible name for a university professor, chosen at random."
times = 50
count = 20

def get_random_tag():
    with open("tags_en.csv", mode='r') as tagscsv:
        csv_reader = csv.reader(tagscsv, delimiter=";")
        all_rows = list(csv_reader)
        random_row = random.choice(all_rows)
        return random_row[3],random_row[1]

def generate_titles(tags):
    titles = []
    title_prompts = []
    for tag in tags:
        title_prompts.append(title_message + tag)
    r = client.completions.create(
        model="gpt-3.5-turbo-instruct",
        prompt=title_prompts,
        max_tokens=30,
        temperature=0.9
    )
    for text in r.choices:
        title = text.text.strip().replace('"','')
        titles.append(title)
    return titles


def generate_descriptions(titles):
    descriptions = []
    description_prompts = []
    for title in titles:
        description_prompts.append(description_message + title)
    r = client.completions.create(
        model="gpt-3.5-turbo-instruct",
        prompt=description_prompts,
        max_tokens=400,
        temperature=0.9
    )
    for text in r.choices:
        descriptions.append(text.text)
    return descriptions

def generate_advisors():
    advisors = []
    name_prompts = [name_message] * count
    r = client.completions.create(
    model="gpt-3.5-turbo-instruct",
    prompt=name_prompts,
    max_tokens=200,
    temperature=0.9
    )
    for text in r.choices:
        advisors.append(text.text)
    return advisors

def generate_random_date():
    year = random.randint(2010, 2023)
    month = random.randint(1, 12)
    day = random.randint(1, 28)  
    return datetime.date(year, month, day).isoformat()


def run():
    with open('generated_test_data.csv', 'a', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        #header = ['Title', 'Details', 'Qualification_Type', 'Date', 'University', 'Advisor', 'tag_id', 'tag_name']
        #writer.writerow(header)

        for _ in range(times):
            tag_names = []
            tag_ids = []
            for _ in range(count):
                random_tag = get_random_tag()
                tag_names.append(random_tag[0])
                tag_ids.append(random_tag[1])

            titles = generate_titles(tag_names)
            descriptions = generate_descriptions(titles)
            advisors = generate_advisors()

            for i in range(count):
                university = random.choice(universities)
                qualification_type = random.choice(qualification)
                date = generate_random_date()
                tag_id = tag_ids[i]
                tag_name = tag_names[i]
                title = titles[i]
                details = descriptions[i]
                advisor = advisors[i]
                row = [title, details, qualification_type, date, university, advisor, tag_id, tag_name]
                writer.writerow(row)
                csvfile.flush()
        print("done")

run()



