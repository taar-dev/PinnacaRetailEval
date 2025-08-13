import openai
import requests
import json

AUDIO_FILE = "agent.wav"  
openai.api_key = "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"  
GPT_MODEL = "gpt-4o-mini" 

client = openai.OpenAI(api_key="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")

system_prompt = """
You are a call quality assurance evaluator for technical support calls.

Your job is to evaluate the agent's performance based on these 16 fixed KPIs.

For each KPI:
- Give a score out of 5
- Note if a penalty applies (Yes/No)
- Give a short justification

KPI List:
1. Was the customer greeted with Good [Time of Day] Pinnaca Retail Solutions,[Engineer Speaking], How May I Help?
2. Was the customer asked for their Name, Company, & Location?
3. Did the engineer put the call on proper hold as per the script?
4. Did the engineer thank the caller after putting them on hold?
5. Was there any dead air during the call?
6. Was the customer given a ticket number?
7. Was the proper closing script followed?
8. Did the engineer ask for further assistance?
9. Politeness and professionalism in all interactions.
10. Active listening skills to understand customer concerns.
11. Empathy and understanding of customer frustrations.
12. Clear explanation of solutions and next steps.
13. Need to improve customer Interaction.
14. Active listening and responding.
15. Effective troubleshooting and problem-solving.
16. Clear and concise communication with the customer.

MAKEE SURE TO RETURN OUTPUT IN THIS EXACT JSON format:

{
  "evaluation": [
    {
      "kpi_number": <1-16>,
      "description": "<brief KPI description>",
      "score": <0-5>,
      "penalty": <true|false>,
      "justification": "<short explanation>"
    },
    ...
  ]
  }
"""
def transcribe_audio(audio_path):
    print("[1] Transcribing audio via Whisper API...")

    with open(audio_path, "rb") as audio_file:
        response = requests.post(
            "https://api.openai.com/v1/audio/transcriptions",
            headers={
                "Authorization": f"Bearer {openai.api_key}"
            },
            files={
                "file": (audio_path, audio_file, "audio/wav"),
                "model": (None, "whisper-1")
            }
        )

    if response.status_code != 200:
        raise Exception(f"Transcription failed: {response.status_code} - {response.text}")
    #print(response.json())
    return response.json()["text"]


def evaluate_transcript(transcript):
    print("[2] Sending transcript to GPT for KPI evaluation...")

    user_message = f"""
Evaluate the following agent transcript against the KPIs listed in the system prompt.

Transcript:
\"\"\"
{transcript}
\"\"\"
"""

    response = client.chat.completions.create(
        model=GPT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        temperature=0,  # <-- Makes output deterministic
        top_p=1
    )
    #print(response.choices[0].message.content)
    content = response.choices[0].message.content

    try:
        parsed = json.loads(content)  # ✅ Parse the JSON
        return parsed["evaluation"]   # ✅ Return the list of evaluations directly
    except json.JSONDecodeError as e:
        print("[ERROR] Failed to parse GPT response as JSON")
        raise Exception(f"JSON parsing error: {str(e)}")



def main():
    try:
        transcript = transcribe_audio(AUDIO_FILE)
        print("\n[TRANSCRIPT]\n", transcript)

        evaluation = evaluate_transcript(transcript)
        print("\n=== Evaluation Report ===\n")
        print(evaluation)

        with open("evaluation_report.txt", "w", encoding="utf-8") as f:
            f.write(evaluation)
        print("\nReport saved to evaluation_report.txt")

    except Exception as e:
        print("Error:", str(e))

if __name__ == "__main__":
    main()
