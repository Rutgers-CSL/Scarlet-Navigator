import requests
import json
import sys

''' *first semester of data is Spring 2021 at the moment
    *likely keeps running list of past 4 years
    *we can append to our master list every semester

    The following creates master list of all unique courses from Spring 2021 to Spring 2025.
'''

if len(sys.argv) > 1:
    mode = sys.argv[1]
else:
    mode = "a"

url = "https://classes.rutgers.edu/soc/api/courses.json?year={year}&term={term}&campus={campus}"
output_file = "masterlist.jsonl"

campuses = ["NB", "NK", "CM"]
years = [2025, 2024, 2023, 2022, 2021]
terms = {9:"Fall", 7:"Summer", 1:"Spring", 0:"Winter"}
course_fields = ["subject", "preReqNotes", "courseString", "school", "credits",
                 "subjectDescription", "coreCodes", "expandedTitle", "title",
                 "mainCampus", "level", "synopsisUrl"]

# Some courses have the same course string between campuses, but we will consider them different.
course_ids = {"NB":set(), "NK":set(), "CM":set()}

with open(output_file, mode) as master:
    for campus in campuses:
        for year in years:
            for term in terms:
                print(f"Adding courses from {campus} {year} {term}...")
                response = requests.get(url.format(year = year, term = term, campus = campus))

                try:
                    courses = response.json()
                except:
                    print(f"{campus} {year} {term} does not return valid JSON")
                    continue

                if len(courses) == 0:
                    continue

                for course in courses:
                    course_id = course.get("courseString")

                    # Should not happen.
                    if course_id is None:
                        print("Course without ID")
                        continue

                    # Already added this course from this campus.
                    if course_id in course_ids[campus]:
                        continue

                    # Add course to this campus's list
                    course_ids[campus].add(course_id)

                    # create unique identifier for each course

                    course_modified = {i:course.get(i, " ") for i in course_fields}
                    course_modified["lastOffered"] = "{season} {year}".format(season=terms[term], year=year)
                    course_modified["uid"] = "{course_id} {campus}".format(course_id=course_id, campus=campus)


                    master.write(json.dumps(course_modified) + "\n")
                    # json.dump(course_modified, master, indent=4)


# Record courses added
with open("course_ids.txt", "a") as course_ids_record:
    for key in course_ids:
        course_ids_record.write("\n")
        course_ids_record.write(key)
        course_ids_record.write("\n")
        for val in course_ids[key]:
            course_ids_record.write(val)
            course_ids_record.write("\n")






