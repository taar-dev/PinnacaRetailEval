# c.py
import requests
import json
import time

API_KEY = "aQJfSi3GEls1QNmO7rDAZhSBJiqYzhGUEdTYSBhUL1ApmEL7"  
BASE_URL = "https://api.hume.ai/v0/batch/jobs"

def submit_hume_job(audio_path):
    headers = {"X-Hume-Api-Key": API_KEY}
    job_config = {
        "models": {
            "prosody": {"granularity": "utterance"},
            "burst": {},
            "language": {"granularity": "word"}
        },
        "notify": False
    }

    with open(audio_path, "rb") as file_data:
        files = {
            "file": file_data,
            "json": (None, json.dumps(job_config), "application/json")
        }
        response = requests.post(BASE_URL, headers=headers, files=files)

    if response.status_code == 200:
        return response.json()["job_id"]
    else:
        raise Exception(f"Hume job submission failed: {response.text}")


def wait_for_completion(job_id):
    while True:
        response = requests.get(f"{BASE_URL}/{job_id}", headers={"X-Hume-Api-Key": API_KEY})
        status = response.json().get("state", {}).get("status")
        if status in ["COMPLETED", "FAILED"]:
            break
        time.sleep(10)
    if status == "FAILED":
        raise Exception("Hume job failed")


def download_results(job_id):
    response = requests.get(f"{BASE_URL}/{job_id}/predictions", headers={"X-Hume-Api-Key": API_KEY})
    return response.json()


def run_hume_pipeline(audio_path):
    job_id = submit_hume_job(audio_path)
    wait_for_completion(job_id)
    return download_results(job_id)
