import json
import firebase_admin
import uuid
from firebase_admin import credentials
from firebase_admin import firestore

print('creating a test user')
cred = credentials.Certificate("./scarletnav-cred.json")
# firebase_admin.initialize_app(cred)

# Use the application default credentials
# cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
  'projectId': 'scarlet-navigator-8d739',
})


def create_blank_plan():
    plan = {}
    for index in range(24):
        plan[str(index)] = []
    return plan


db = firestore.client()
doc_ref = db.collection(u'users').document(u'test-user')
user = {
    "plan": create_blank_plan(),
    "secondPlan": create_blank_plan(),
    "thirdPlan": create_blank_plan()
}
print(user)
# doc_ref.set(user)
