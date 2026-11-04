#!/usr/bin/env python3
"""
Student Analytics Engine for AI Student Learning & Career Success Platform.

Implements reusable data science business logic using Python 3.10 standard libraries:
- Student record schema validation & boundary checking
- Stored field extraction & verification (readiness, risk level, placement, recommendations)
- Dynamic cohort statistical computations (mean, median, std dev, risk distributions, topic frequencies)
- Bidirectional Pearson correlation analysis between attendance and readiness (|r| strength, sign direction)
- Cohort engagement statistics without zero-imputation of missing fields
- JSON IPC over stdin/stdout for TypeScript Express backend integration
"""

import sys
import json
import math
import statistics
from typing import Dict, Any, List, Optional, Tuple

# Validation targets from verified 500-student dataset benchmark
BENCHMARK_TARGETS = {
    "total_records": 500,
    "average_readiness": 61.67,
    "placement_ready_count": 108,
    "placement_ready_pct": 21.6,
    "placement_developing_count": 392,
    "placement_developing_pct": 78.4,
    "risk_breakdown": {
        "Low": 248,
        "Medium": 147,
        "High": 105
    }
}

VALID_RISK_LEVELS = {"High", "Medium", "Low"}


def parse_numeric(val: Any) -> Optional[float]:
    """Safely extracts a numeric float, handling strings with % or commas."""
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val) if not math.isnan(val) else None
    if isinstance(val, str):
        cleaned = val.strip().rstrip('%').replace(',', '')
        try:
            num = float(cleaned)
            return num if not math.isnan(num) else None
        except ValueError:
            return None
    return None


def extract_stored_readiness(record: Dict[str, Any]) -> Optional[float]:
    """Extracts the stored overall readiness score from verified database columns."""
    for key in ("overall_readiness_score", "readiness_score", "score"):
        if key in record and record[key] is not None:
            num = parse_numeric(record[key])
            if num is not None:
                return round(num, 2)
    return None


def extract_stored_risk_level(record: Dict[str, Any]) -> str:
    """Extracts stored risk level, normalizing to 'High', 'Medium', or 'Low'."""
    raw = str(record.get("risk_level") or record.get("risk") or "").strip().lower()
    if "high" in raw:
        return "High"
    if "med" in raw:
        return "Medium"
    if "low" in raw:
        return "Low"
    return "Low"


def extract_stored_placement_ready(record: Dict[str, Any]) -> bool:
    """Extracts stored placement readiness boolean."""
    for key in ("placement_ready", "placement_readiness"):
        if key in record:
            val = record[key]
            if isinstance(val, bool):
                return val
            if isinstance(val, (int, float)):
                return val == 1
            if isinstance(val, str):
                s = val.strip().lower()
                return s in ("ready", "yes", "true", "1")
    return False


def validate_student_record(record: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Validates schema conformance, expected stored fields, and domain boundaries."""
    issues = []
    if not isinstance(record, dict):
        return False, ["Record must be a JSON object."]

    student_id = record.get("student_id") or record.get("id")
    if student_id is None:
        issues.append("Missing identifier ('student_id' or 'id').")

    readiness = extract_stored_readiness(record)
    if readiness is None:
        issues.append("Missing or non-numeric readiness score.")
    elif not (0 <= readiness <= 100):
        issues.append(f"Readiness score {readiness} is out of expected [0, 100] range.")

    risk = extract_stored_risk_level(record)
    if risk not in VALID_RISK_LEVELS:
        issues.append(f"Invalid risk level: '{risk}'.")

    # Attendance bounds check [0, 100]
    attendance = parse_numeric(record.get("attendance_percentage") or record.get("attendance"))
    if attendance is not None and not (0 <= attendance <= 100):
        issues.append(f"Attendance percentage {attendance} is out of expected [0, 100] range.")

    # Counters non-negative check
    for field in ("sessions_attended", "sessions_missed", "assignments_completed", "assignments_assigned"):
        if field in record and record[field] is not None:
            val = parse_numeric(record[field])
            if val is not None and val < 0:
                issues.append(f"Field '{field}' cannot be negative: {val}.")

    return len(issues) == 0, issues


def evaluate_student(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates a single student record based on stored database attributes.
    Preserves existing values without inventing unsupported formulas.
    """
    is_valid, validation_errors = validate_student_record(record)
    readiness = extract_stored_readiness(record)
    risk_level = extract_stored_risk_level(record)
    placement_ready = extract_stored_placement_ready(record)

    student_id = record.get("student_id") or record.get("id")
    topic = record.get("recommended_topic") or record.get("recommended_topics")
    if isinstance(topic, list):
        topic = ", ".join(str(t) for t in topic)
    skill = record.get("recommended_skill")
    action = record.get("recommended_learning_action")

    # Attendance & Assignment metrics
    attendance_pct = parse_numeric(record.get("attendance_percentage") or record.get("attendance"))
    sessions_attended = parse_numeric(record.get("sessions_attended"))
    sessions_missed = parse_numeric(record.get("sessions_missed"))
    assignments_completed = parse_numeric(record.get("assignments_completed"))
    assignments_assigned = parse_numeric(record.get("assignments_assigned"))
    avg_assignment_score = parse_numeric(record.get("average_assignment_score") or record.get("average_assessment_score"))

    return {
        "student_id": student_id,
        "is_valid": is_valid,
        "validation_errors": validation_errors,
        "overall_readiness_score": readiness,
        "risk_level": risk_level,
        "placement_ready": placement_ready,
        "placement_status": "Placement Ready" if placement_ready else "Developing",
        "recommended_topic": topic or "Not recorded",
        "recommended_skill": skill or "Not recorded",
        "recommended_learning_action": action or "Not recorded",
        "attendance": {
            "percentage": attendance_pct,
            "sessions_attended": sessions_attended,
            "sessions_missed": sessions_missed,
        },
        "assignments": {
            "completed": assignments_completed,
            "assigned": assignments_assigned,
            "average_score": avg_assignment_score,
        }
    }


def calculate_pearson_correlation(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes bivariate Pearson correlation coefficient (r) strictly on valid paired
    (attendance_percentage, overall_readiness_score) observations.
    
    Classifies strength using |r| and direction using sign(r).
    Safely handles missing pairs, N < 2, and zero variance without crashing.
    Includes explicit non-causal interpretation.
    """
    disclaimer = "Correlation measures linear statistical association between recorded metrics and does not prove causal relationship."
    
    pairs: List[Tuple[float, float]] = []
    for r in records:
        if not isinstance(r, dict):
            continue
        att = parse_numeric(r.get("attendance_percentage") or r.get("attendance"))
        read = extract_stored_readiness(r)
        if att is not None and read is not None and (0 <= att <= 100) and (0 <= read <= 100):
            pairs.append((att, read))
            
    n = len(pairs)
    if n < 2:
        return {
            "valid_pairs_count": n,
            "correlation_coefficient": None,
            "direction": "negligible",
            "strength": "negligible",
            "status": "insufficient_data",
            "description": "At least 2 valid paired records are required to compute Pearson correlation.",
            "disclaimer": disclaimer
        }
        
    x_vals = [p[0] for p in pairs]
    y_vals = [p[1] for p in pairs]
    
    mean_x = statistics.mean(x_vals)
    mean_y = statistics.mean(y_vals)
    
    ss_xx = sum((x - mean_x) ** 2 for x in x_vals)
    ss_yy = sum((y - mean_y) ** 2 for y in y_vals)
    ss_xy = sum((x - mean_x) * (y - mean_y) for x, y in pairs)
    
    # Zero variance guard
    if ss_xx < 1e-9 or ss_yy < 1e-9:
        return {
            "valid_pairs_count": n,
            "correlation_coefficient": None,
            "direction": "negligible",
            "strength": "negligible",
            "status": "zero_variance",
            "description": "Variance in attendance or readiness is zero (all values identical); correlation is mathematically undefined.",
            "disclaimer": disclaimer
        }
        
    raw_r = ss_xy / math.sqrt(ss_xx * ss_yy)
    r = round(max(-1.0, min(1.0, raw_r)), 4)
    abs_r = abs(r)
    
    # Direction based on sign of r
    if abs_r < 0.1:
        direction = "negligible"
    elif r > 0:
        direction = "positive"
    else:
        direction = "negative"
        
    # Strength based on absolute value |r|
    if abs_r >= 0.7:
        strength = "strong"
    elif abs_r >= 0.4:
        strength = "moderate"
    elif abs_r >= 0.1:
        strength = "weak"
    else:
        strength = "negligible"
        
    if direction == "negligible":
        desc = "Negligible linear association (no meaningful linear relationship observed; does not imply causation)."
    else:
        desc = f"{strength.capitalize()} {direction} linear association (observed relationship; does not prove causation)."
        
    return {
        "valid_pairs_count": n,
        "correlation_coefficient": r,
        "direction": direction,
        "strength": strength,
        "status": "computed",
        "description": desc,
        "disclaimer": disclaimer
    }


def calculate_batch_statistics(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Dynamically calculates cohort statistics across accessible student learning records.
    Computes readiness statistics, placement distribution, risk distribution, topic frequencies,
    engagement metrics without zero-imputation, and bidirectional Pearson correlation.
    """
    if not records:
        return {
            "total_records": 0,
            "error": "No records provided for batch analysis.",
            "benchmark_comparison": BENCHMARK_TARGETS,
            "pearson_correlation": calculate_pearson_correlation([])
        }

    valid_readiness_scores: List[float] = []
    risk_counts = {"High": 0, "Medium": 0, "Low": 0}
    placement_ready_count = 0
    topic_frequencies: Dict[str, int] = {}
    valid_record_count = 0

    # Engagement metric aggregators (without zero-imputation)
    attendance_values: List[float] = []
    missing_attendance_count = 0
    sessions_attended_values: List[float] = []
    missing_attended_count = 0
    sessions_missed_values: List[float] = []
    missing_missed_count = 0
    assignments_completed_values: List[float] = []
    missing_completed_count = 0
    assignments_assigned_values: List[float] = []
    missing_assigned_count = 0
    assignment_score_values: List[float] = []
    missing_score_count = 0

    for r in records:
        if not isinstance(r, dict):
            continue
        valid_record_count += 1
        score = extract_stored_readiness(r)
        if score is not None:
            valid_readiness_scores.append(score)

        risk = extract_stored_risk_level(r)
        if risk in risk_counts:
            risk_counts[risk] += 1
        else:
            risk_counts["Low"] += 1

        if extract_stored_placement_ready(r):
            placement_ready_count += 1

        raw_topics = r.get("recommended_topic") or r.get("recommended_topics")
        if isinstance(raw_topics, str) and raw_topics.strip():
            for part in raw_topics.split(","):
                t = part.strip()
                if t:
                    topic_frequencies[t] = topic_frequencies.get(t, 0) + 1
        elif isinstance(raw_topics, list):
            for t in raw_topics:
                t_str = str(t).strip()
                if t_str:
                    topic_frequencies[t_str] = topic_frequencies.get(t_str, 0) + 1

        # Process engagement fields without zero-imputation
        att = parse_numeric(r.get("attendance_percentage") or r.get("attendance"))
        if att is not None and (0 <= att <= 100):
            attendance_values.append(att)
        else:
            missing_attendance_count += 1

        s_att = parse_numeric(r.get("sessions_attended"))
        if s_att is not None and s_att >= 0:
            sessions_attended_values.append(s_att)
        else:
            missing_attended_count += 1

        s_mis = parse_numeric(r.get("sessions_missed"))
        if s_mis is not None and s_mis >= 0:
            sessions_missed_values.append(s_mis)
        else:
            missing_missed_count += 1

        a_cmp = parse_numeric(r.get("assignments_completed"))
        if a_cmp is not None and a_cmp >= 0:
            assignments_completed_values.append(a_cmp)
        else:
            missing_completed_count += 1

        a_asg = parse_numeric(r.get("assignments_assigned"))
        if a_asg is not None and a_asg >= 0:
            assignments_assigned_values.append(a_asg)
        else:
            missing_assigned_count += 1

        a_scr = parse_numeric(r.get("average_assignment_score") or r.get("average_assessment_score"))
        if a_scr is not None and (0 <= a_scr <= 100):
            assignment_score_values.append(a_scr)
        else:
            missing_score_count += 1

    total_valid = valid_record_count
    mean_readiness = round(statistics.mean(valid_readiness_scores), 2) if valid_readiness_scores else 0.0
    median_readiness = round(statistics.median(valid_readiness_scores), 2) if valid_readiness_scores else 0.0
    stdev_readiness = round(statistics.stdev(valid_readiness_scores), 2) if len(valid_readiness_scores) > 1 else 0.0

    placement_pct = round((placement_ready_count / total_valid * 100), 2) if total_valid > 0 else 0.0
    developing_count = total_valid - placement_ready_count
    developing_pct = round((developing_count / total_valid * 100), 2) if total_valid > 0 else 0.0

    risk_percentages = {
        lvl: round((cnt / total_valid * 100), 2) if total_valid > 0 else 0.0
        for lvl, cnt in risk_counts.items()
    }

    # Top recommended topics sorted by frequency
    sorted_topics = sorted(topic_frequencies.items(), key=lambda item: item[1], reverse=True)

    # Benchmark comparison (for academic validation)
    matches_500_benchmark = (
        total_valid == BENCHMARK_TARGETS["total_records"]
        and abs(mean_readiness - BENCHMARK_TARGETS["average_readiness"]) <= 0.05
    )

    # Compute Pearson correlation safely
    pearson_corr = calculate_pearson_correlation(records)

    return {
        "total_records": total_valid,
        "valid_readiness_count": len(valid_readiness_scores),
        "readiness_statistics": {
            "mean": mean_readiness,
            "median": median_readiness,
            "standard_deviation": stdev_readiness,
            "min": round(min(valid_readiness_scores), 2) if valid_readiness_scores else 0.0,
            "max": round(max(valid_readiness_scores), 2) if valid_readiness_scores else 0.0,
        },
        "placement_status": {
            "placement_ready_count": placement_ready_count,
            "placement_ready_percentage": placement_pct,
            "developing_count": developing_count,
            "developing_percentage": developing_pct
        },
        "risk_distribution": {
            "counts": risk_counts,
            "percentages": risk_percentages
        },
        "engagement_metrics": {
            "attendance": {
                "recorded_count": len(attendance_values),
                "missing_count": missing_attendance_count,
                "mean": round(statistics.mean(attendance_values), 2) if attendance_values else None,
                "median": round(statistics.median(attendance_values), 2) if attendance_values else None,
            },
            "sessions_attended": {
                "recorded_count": len(sessions_attended_values),
                "missing_count": missing_attended_count,
                "mean": round(statistics.mean(sessions_attended_values), 2) if sessions_attended_values else None,
            },
            "sessions_missed": {
                "recorded_count": len(sessions_missed_values),
                "missing_count": missing_missed_count,
                "mean": round(statistics.mean(sessions_missed_values), 2) if sessions_missed_values else None,
            },
            "assignments": {
                "recorded_completed_count": len(assignments_completed_values),
                "missing_completed_count": missing_completed_count,
                "mean_completed": round(statistics.mean(assignments_completed_values), 2) if assignments_completed_values else None,
                "mean_assigned": round(statistics.mean(assignments_assigned_values), 2) if assignments_assigned_values else None,
                "mean_score": round(statistics.mean(assignment_score_values), 2) if assignment_score_values else None,
            }
        },
        "pearson_correlation": pearson_corr,
        "top_recommended_topics": [
            {"topic": t, "count": c} for t, c in sorted_topics[:10]
        ],
        "validation_benchmark": {
            "matches_known_500_dataset": matches_500_benchmark,
            "expected_benchmark": BENCHMARK_TARGETS
        }
    }


def main():
    """Main CLI entry point for subprocess JSON IPC."""
    import argparse
    parser = argparse.ArgumentParser(description="Student Analytics Engine CLI")
    parser.add_argument(
        "--action",
        choices=["evaluate-student", "batch-stats", "verify-dataset", "correlation"],
        required=True,
        help="Action to perform on input JSON"
    )
    args = parser.parse_args()

    # Read JSON payload from stdin
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            payload = {}
        else:
            payload = json.loads(raw_input)
    except Exception as e:
        err_response = {"success": False, "error": f"Invalid JSON on stdin: {str(e)}"}
        sys.stderr.write(json.dumps(err_response) + "\n")
        sys.exit(1)

    try:
        if args.action == "evaluate-student":
            student_data = payload.get("student") if isinstance(payload, dict) and "student" in payload else payload
            result = evaluate_student(student_data)
            output = {"success": True, "action": args.action, "data": result}
            sys.stdout.write(json.dumps(output, indent=2) + "\n")
            sys.exit(0)

        elif args.action == "batch-stats":
            records = payload.get("records") if isinstance(payload, dict) and "records" in payload else payload
            if not isinstance(records, list):
                records = [records] if isinstance(records, dict) else []
            result = calculate_batch_statistics(records)
            output = {"success": True, "action": args.action, "data": result}
            sys.stdout.write(json.dumps(output, indent=2) + "\n")
            sys.exit(0)

        elif args.action == "correlation":
            records = payload.get("records") if isinstance(payload, dict) and "records" in payload else payload
            if not isinstance(records, list):
                records = [records] if isinstance(records, dict) else []
            result = calculate_pearson_correlation(records)
            output = {"success": True, "action": args.action, "data": result}
            sys.stdout.write(json.dumps(output, indent=2) + "\n")
            sys.exit(0)

        elif args.action == "verify-dataset":
            records = payload.get("records") if isinstance(payload, dict) and "records" in payload else payload
            if not isinstance(records, list):
                records = []
            stats = calculate_batch_statistics(records)
            output = {
                "success": True,
                "action": args.action,
                "verified": stats.get("validation_benchmark", {}).get("matches_known_500_dataset", False),
                "data": stats
            }
            sys.stdout.write(json.dumps(output, indent=2) + "\n")
            sys.exit(0)

    except Exception as ex:
        err_response = {"success": False, "error": f"Processing exception: {str(ex)}"}
        sys.stderr.write(json.dumps(err_response) + "\n")
        sys.exit(2)


if __name__ == "__main__":
    main()
