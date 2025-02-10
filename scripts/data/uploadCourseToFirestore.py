import json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


cred = credentials.Certificate("./scarletnav-cred.json")
# firebase_admin.initialize_app(cred)

# Use the application default credentials
# cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
  'projectId': 'scarlet-navigator-8d739',
})

db = firestore.client()
total = 4520
count = 0

with open(r"jsonminifier.json") as f:
    for jsonObj in f:
        myDict = json.loads(jsonObj)
        courses = myDict['courses']

        def get_campus(obj):
            desc = obj['description']
            if desc.lower() == 'o':
                return 'Online'
            return desc

        def get_core(obj):
            return obj['code']

        for course in courses:
            campus_locations = list(map(get_campus, course['campusLocations']))
            cores = list(map(get_core, course['coreCodes']))
            _id = course['courseString']
            projection = {
              '_id': _id,
              'title': course['title'],
              'credits': course['credits'],
              'school': course['school']['description'],
              'subject': course['subjectDescription'],
              'courseString': course['courseString'],
              'campusLocations': campus_locations,
              'cores': cores,
              'preReqNotes': course['preReqNotes']
            }
            # change query_title to full_title
            # then change in interface
            query_title = course['expandedTitle'] if course['expandedTitle'] else course['title']
            query_title = " ".join(query_title.split())
            projection['queryTitle'] = query_title

            doc_ref = db.collection('courses').document(_id)
            doc_ref.set(projection)
            count += 1
            print(f'Creating course document for {_id}. {count / total} done.')
