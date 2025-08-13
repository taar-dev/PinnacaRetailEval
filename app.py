from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from a import split_stereo_to_mono
from b import transcribe_audio, evaluate_transcript
from c import run_hume_pipeline
from d import extract_emotion_scores, summarize_emotions
from e import detect_repeated_mistakes

import os
import smtplib
from email.mime.text import MIMEText
import psycopg2
from psycopg2.extras import Json
import json

# Create a connection (do this once at the top of your file)
conn = psycopg2.connect(
    host="localhost",
    database="my_analysis_db",
    user="myuser",
    password="mypassword"
)
conn.autocommit = True

app = Flask(__name__, template_folder="templates")

# Updated CORS to allow Next.js frontend
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5000",
            "http://127.0.0.1:5000"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint for the Next.js frontend"""
    return jsonify({"status": "healthy", "service": "audio-analysis-backend"})

@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Get dashboard statistics from actual database"""
    try:
        with conn.cursor() as cur:
            # Total analyses
            cur.execute("SELECT COUNT(*) FROM analysis_results")
            total_analyses = cur.fetchone()[0]

            if total_analyses == 0:
                return jsonify({
                    "totalAnalyses": 0,
                    "avgKpiScore": 0,
                    "totalAgents": 0,
                })

            # Average KPI score - handle JSON properly
            cur.execute("""
                SELECT evaluation FROM analysis_results
                WHERE evaluation IS NOT NULL AND evaluation != 'null'
            """)
            kpi_rows = cur.fetchall()

            total_kpi_score = 0
            kpi_count = 0

            for row in kpi_rows:
                try:
                    evaluation = row[0]
                    if isinstance(evaluation, str):
                        evaluation = json.loads(evaluation)

                    if isinstance(evaluation, list):
                        for kpi in evaluation:
                            if isinstance(kpi, dict) and 'score' in kpi:
                                score = float(kpi['score'])
                                total_kpi_score += score
                                kpi_count += 1
                except (json.JSONDecodeError, ValueError, TypeError) as e:
                    print(f"Error processing KPI data: {e}")
                    continue

            avg_kpi_score = round(total_kpi_score / kpi_count, 2) if kpi_count > 0 else 0

        return jsonify({
            "totalAnalyses": total_analyses,
            "avgKpiScore": avg_kpi_score,
            "totalAgents": total_analyses,  # Using total analyses as proxy
        })
    except Exception as e:
        print(f"Stats error: {e}")
        return jsonify({
            "totalAnalyses": 0,
            "avgKpiScore": 0,
            "totalAgents": 0,
        })

@app.route("/api/recent-analyses", methods=["GET"])
def get_recent_analyses():
    """Get recent analyses from actual database"""
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, transcript, evaluation, emotion_summary, created_at, agent_name
                FROM analysis_results
                ORDER BY created_at DESC
                LIMIT 5
            """)
            rows = cur.fetchall()

            results = []
            for row in rows:
                # Extract KPI score
                kpi_score = 0
                if row[2]:  # evaluation
                    try:
                        evaluation = row[2]
                        if isinstance(evaluation, str):
                            evaluation = json.loads(evaluation)

                        if isinstance(evaluation, list):
                            scores = []
                            for kpi in evaluation:
                                if isinstance(kpi, dict) and 'score' in kpi:
                                    scores.append(float(kpi['score']))
                            kpi_score = round(sum(scores) / len(scores), 1) if scores else 0
                    except (json.JSONDecodeError, ValueError, TypeError):
                        kpi_score = 0

                results.append({
                    "id": row[0],
                    "transcript": row[1],
                    "kpiScore": kpi_score,
                    "createdAt": row[4].isoformat() if row[4] else None,
                    "status": "completed",
                    "agent_name": row[5] # Include agent_name
                })

        return jsonify(results)
    except Exception as e:
        print(f"Recent analyses error: {e}")
        return jsonify([])

@app.route("/send-email", methods=["POST"])
def send_email():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "No data provided"}), 400

    print("DEBUG - Emotion Summary received:", data.get("emotionSummary"))
    recipients = ["d.azeem@taar.pk", "a.ali@taar.co.uk"]

    try:
        # Build KPI section with full details
        kpi_lines = []
        total_penalties = 0
        for kpi in data.get("kpiScores", []):
            penalty = kpi.get('penalty', 0)
            try:
                penalty = int(penalty)
            except (ValueError, TypeError):
                penalty = 0
            total_penalties += penalty
            kpi_lines.append(
                f"KPI {kpi.get('kpi_number', 'N/A')}: {kpi.get('description', 'No description')}\n"
                f"Score: {kpi.get('score', 'N/A')}/5 | Penalty: {penalty}\n"
                f"Justification: {kpi.get('justification', 'N/A')}\n"
            )

        # Calculate total fine
        fine_per_penalty = 500
        total_fine = total_penalties * fine_per_penalty

        # Get emotion summary
        emotion_summary = data.get("emotionSummary", {})
        top_positive = emotion_summary.get("top_positive_emotions", [])
        top_negative = emotion_summary.get("top_negative_emotions", [])

        # Safely format emotions
        def format_emotions(emotions):
            lines = []
            for e in emotions:
                if isinstance(e, dict):
                    name = e.get("name", "Unknown")
                    score = e.get("score", "N/A")
                elif isinstance(e, (list, tuple)) and len(e) >= 2:
                    name, score = e[0], e[1]
                else:
                    name, score = str(e), "N/A"
                lines.append(f"{name}: {score}")
            return lines

        top_pos_lines = format_emotions(top_positive)
        top_neg_lines = format_emotions(top_negative)

        # Build email body
        body = f"""Audio Analysis Summary:

Agent Name: {data.get('agentName', 'N/A')}
Audio Filename: {data.get('audioFilename', 'N/A')}

KPI Details:
{chr(10).join(kpi_lines)}

Total Penalties: {total_penalties}
Total Fine (PKR): {total_fine}

Emotion Summary:
Top Positive Emotions:
{chr(10).join(top_pos_lines)}

Top Negative Emotions:
{chr(10).join(top_neg_lines)}

-- End of Summary --"""

        # Prepare email
        msg = MIMEText(body)
        msg['Subject'] = "Audio Analysis Detailed Report"
        msg['From'] = "daemazeemdean@gmail.com"
        msg['To'] = ", ".join(recipients)

        # Send email
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        smtp_user = "daemazeemdean@gmail.com"
        smtp_password = "wfsp bnyc ocxg zlyu"

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, recipients, msg.as_string())

        return jsonify({"success": True})

    except Exception as e:
        print("Email error:", e)
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/get-results", methods=["GET"])
def get_results():
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, transcript, evaluation, emotion_summary, created_at, agent_name
                FROM analysis_results
                ORDER BY created_at DESC
            """)
            rows = cur.fetchall()

            results = []
            for row in rows:
                results.append({
                    "id": row[0],
                    "transcript": row[1],
                    "evaluation": row[2],
                    "emotion_summary": row[3],
                    "created_at": row[4].strftime("%Y-%m-%d %H:%M:%S") if row[4] else None,
                    "agent_name": row[5] # Include agent_name
                })

        return jsonify(results)
    except Exception as e:
        print("Database fetch error:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/save-result", methods=["POST"])
def save_result():
    print("💾 Flask Backend: Saving analysis result to database")
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "No data provided"}), 400

    transcript = data.get("transcript", "")
    evaluation = data.get("evaluation", [])
    emotion_summary = data.get("emotion_summary", {})
    agent_name = data.get("agent_name", "Unknown Agent") # Get agent_name from incoming data

    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO analysis_results (transcript, evaluation, emotion_summary, agent_name)
                VALUES (%s, %s, %s, %s)
            """, (transcript, Json(evaluation), Json(emotion_summary), agent_name))
        print("✅ Flask Backend: Result saved to database successfully")
        return jsonify({"success": True})
    except Exception as e:
        print(f"❌ Flask Backend: Database error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/evaluate", methods=["POST", "OPTIONS"])
def evaluate():
    if request.method == "OPTIONS":
        return jsonify({"status": "OK"}), 200

    print("🎯 Flask Backend: Received evaluation request from Next.js")

    if "file" not in request.files:
        print("❌ Flask Backend: No audio file in request")
        return jsonify({"error": "No audio file uploaded"}), 400

    audio = request.files["file"]
    original_filename = audio.filename
    saved_path = os.path.join(".", original_filename)

    # Extract agent_name from form data
    agent_name = request.form.get("agentName", "Unknown Agent")
    print(f"📁 Flask Backend: Processing file: {original_filename}, Agent: {agent_name}")
    audio.save(saved_path)

    try:
        print("🔄 Flask Backend: Step 1 - Converting stereo to mono")
        # Split stereo to mono (will auto-convert if needed)
        agent_file, _ = split_stereo_to_mono(saved_path)

        print("🔄 Flask Backend: Step 2 - Transcribing audio with Whisper")
        # Transcribe with Whisper
        transcript = transcribe_audio(agent_file)

        print("🔄 Flask Backend: Step 3 - Evaluating transcript with GPT")
        # KPI Evaluation via GPT
        kpi_result = evaluate_transcript(transcript)
        if not isinstance(kpi_result, list):
            print("❌ Flask Backend: KPI result is not a list")
            return jsonify({"error": "KPI result is not a list"}), 500

        print("🔄 Flask Backend: Step 4 - Running emotion analysis with Hume")
        # Emotion analysis via Hume API
        hume_data = run_hume_pipeline(agent_file)
        emotion_scores = extract_emotion_scores(hume_data)
        emotion_summary = summarize_emotions(emotion_scores)

        print("🧹 Flask Backend: Cleaning up temporary files")
        # Clean up temp files
        try:
            os.remove(saved_path)
            os.remove(agent_file)
        except Exception as e:
            print(f"⚠️ Flask Backend: Could not remove temp files: {e}")

        print("✅ Flask Backend: Analysis completed successfully!")
        return jsonify({
            "transcript": transcript,
            "evaluation": kpi_result,
            "emotion_scores": emotion_scores,
            "emotion_summary": emotion_summary,
            "agent_name": agent_name # Include agent_name in the response
        })

    except Exception as e:
        print(f"💥 Flask Backend Error: {e}")
        # Clean up temp files in case of error
        try:
            os.remove(saved_path)
            if 'agent_file' in locals():
                os.remove(agent_file)
        except Exception:
            pass

        return jsonify({"error": str(e)}), 500

@app.route("/get-result/<int:result_id>", methods=["GET"])
def get_single_result(result_id):
    """Get a single analysis result by ID"""
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, transcript, evaluation, emotion_summary, created_at, agent_name
                FROM analysis_results
                WHERE id = %s
            """, (result_id,))
            row = cur.fetchone()

            if not row:
                return jsonify({"error": "Result not found"}), 404

            result = {
                "id": row[0],
                "transcript": row[1],
                "evaluation": row[2],
                "emotion_summary": row[3],
                "created_at": row[4].strftime("%Y-%m-%d %H:%M:%S") if row[4] else None,
                "agent_name": row[5] # Include agent_name
            }

        return jsonify(result)
    except Exception as e:
        print(f"Database fetch error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/get-results-by-agent/<string:agent_name>", methods=["GET"])
def get_results_by_agent(agent_name):
    """Get all analysis results for a specific agent name"""
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, transcript, evaluation, emotion_summary, created_at, agent_name
                FROM analysis_results
                WHERE agent_name = %s
                ORDER BY created_at DESC
            """, (agent_name,))
            rows = cur.fetchall()

            results = []
            for row in rows:
                # Extract KPI score for display in the list
                kpi_score = 0
                if row[2]:  # evaluation
                    try:
                        evaluation = row[2]
                        if isinstance(evaluation, str):
                            evaluation = json.loads(evaluation)

                        if isinstance(evaluation, list):
                            scores = []
                            for kpi in evaluation:
                                if isinstance(kpi, dict) and 'score' in kpi:
                                    scores.append(float(kpi['score']))
                            kpi_score = round(sum(scores) / len(scores), 1) if scores else 0
                    except (json.JSONDecodeError, ValueError, TypeError):
                        kpi_score = 0

                results.append({
                    "id": row[0],
                    "transcript": row[1],
                    "evaluation": row[2], # Keep full evaluation for potential future use
                    "emotion_summary": row[3], # Keep full emotion_summary
                    "created_at": row[4].strftime("%Y-%m-%d %H:%M:%S") if row[4] else None,
                    "agent_name": row[5],
                    "kpiScore": kpi_score, # Add kpiScore for convenience
                })

        return jsonify(results)
    except Exception as e:
        print(f"Database fetch by agent error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/unique-agents", methods=["GET"])
def get_unique_agents():
    """Get all unique agent names from the database"""
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT DISTINCT agent_name
                FROM analysis_results
                WHERE agent_name IS NOT NULL AND agent_name != ''
                ORDER BY agent_name ASC
            """)
            rows = cur.fetchall()
            unique_agents = [row[0] for row in rows]
        return jsonify(unique_agents)
    except Exception as e:
        print(f"Error fetching unique agents: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/repeated-mistakes/<string:agent_name>", methods=["GET"])
def api_repeated_mistakes(agent_name):
    """
    Returns repeated KPI mistakes for a given agent.
    """
    try:
        repeated = detect_repeated_mistakes(conn, agent_name)
        return jsonify({
            "agent": agent_name,
            "repeated_mistakes": repeated
        })
    except Exception as e:
        print(f"Error detecting repeated mistakes for {agent_name}: {e}")
        return jsonify({"error": str(e)}), 500
    

@app.route("/leaderboard", methods=["GET"])
def leaderboard():
    try:
        with conn.cursor() as cur:
            query = """
                SELECT 
                    agent_name,
                    ROUND(AVG((kpi->>'score')::numeric), 2) AS avg_score
                FROM analysis_results
                CROSS JOIN LATERAL jsonb_array_elements(evaluation::jsonb) AS kpi
                GROUP BY agent_name
                ORDER BY avg_score DESC;
            """
            cur.execute(query)
            results = cur.fetchall()
            
            leaderboard_data = [
                {"agent_name": row[0], "avg_score": float(row[1])}
                for row in results
            ]
            return jsonify(leaderboard_data)
    except Exception as e:
        print(f"Leaderboard error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🚀 Starting Flask Backend on http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
