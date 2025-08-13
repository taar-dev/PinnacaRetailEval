import json
from collections import defaultdict
import psycopg2

def detect_repeated_mistakes(conn, agent_name):
    """
    Detect KPIs that are repeated issues for the given agent.
    Returns a dictionary: {kpi_number: count_of_occurrences}
    """
    with conn.cursor() as cur:
        cur.execute("""
            SELECT evaluation FROM analysis_results
            WHERE agent_name = %s
        """, (agent_name,))
        rows = cur.fetchall()

    kpi_issues = defaultdict(int)

    for row in rows:
        evaluation_list = row[0]

        # Load JSON if it's stored as a string
        if isinstance(evaluation_list, str):
            try:
                evaluation_list = json.loads(evaluation_list)
            except json.JSONDecodeError:
                continue

        # Skip if data isn't a proper list
        if not isinstance(evaluation_list, list):
            continue

        for kpi in evaluation_list:
            if not isinstance(kpi, dict):
                continue
            score = kpi.get("score", 5)
            penalty = kpi.get("penalty", False)

            try:
                score = float(score)
            except (ValueError, TypeError):
                score = 5

            # If score < 3 or penalty is applied
            if score < 3 or penalty:
                kpi_number = kpi.get("kpi_number", "unknown")
                kpi_issues[kpi_number] += 1

    # Only keep KPIs that appear in at least 2 calls
    repeated = {k: v for k, v in kpi_issues.items() if v >= 2}
    return repeated


