import json
import os

DATA_FILE = "data.json"

def load_data():
    if not os.path.exists(DATA_FILE):
        save_data({
            "pre_registered": [], "walk_ins": [], "speakers": [],
            "counters": {"pre_individual": 0, "pre_group": 0, "walkin_individual": 0, "walkin_group": 0}
        })
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2, default=str)
