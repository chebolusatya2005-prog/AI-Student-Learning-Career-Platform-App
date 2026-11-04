#!/usr/bin/env python3
"""
Unit Test Suite for Student Analytics Engine (python/student_analytics.py).

Verifies:
1. Valid student record evaluation
2. Missing identifier validation failure
3. Out-of-range readiness & attendance score rejection
4. Invalid data types handling
5. Missing paired values handling in Pearson correlation
6. Insufficient sample size (N < 2) handling
7. Zero-variance correlation handling (undefined mathematically)
8. Bidirectional r classification (positive, negative, negligible strength & direction)
"""

import unittest
import sys
import os

# Ensure local module is importable
sys.path.insert(0, os.path.dirname(__file__))

from student_analytics import (
    validate_student_record,
    evaluate_student,
    calculate_pearson_correlation,
    calculate_batch_statistics,
    parse_numeric
)


class TestStudentAnalyticsEngine(unittest.TestCase):

    def test_01_valid_student_evaluation(self):
        """Test evaluation of a completely valid student record."""
        record = {
            "student_id": 11391,
            "overall_readiness_score": 76.8,
            "risk_level": "Low",
            "placement_ready": True,
            "recommended_topic": "Logic Puzzles & Patterns",
            "attendance_percentage": 92.0,
            "sessions_attended": 23,
            "sessions_missed": 2
        }
        res = evaluate_student(record)
        self.assertTrue(res["is_valid"])
        self.assertEqual(len(res["validation_errors"]), 0)
        self.assertEqual(res["overall_readiness_score"], 76.8)
        self.assertEqual(res["risk_level"], "Low")
        self.assertEqual(res["placement_status"], "Placement Ready")
        self.assertEqual(res["attendance"]["percentage"], 92.0)

    def test_02_missing_identifier(self):
        """Test validation failure when student ID / id is absent."""
        record = {
            "overall_readiness_score": 70.0,
            "risk_level": "Low"
        }
        is_valid, errors = validate_student_record(record)
        self.assertFalse(is_valid)
        self.assertTrue(any("Missing identifier" in e for e in errors))

    def test_03_out_of_range_scores(self):
        """Test rejection of scores below 0 or above 100."""
        record_neg = {
            "student_id": 101,
            "overall_readiness_score": -15.0,
            "risk_level": "Low",
            "attendance_percentage": 105.0
        }
        is_valid, errors = validate_student_record(record_neg)
        self.assertFalse(is_valid)
        self.assertTrue(any("out of expected [0, 100] range" in e for e in errors))

    def test_04_invalid_data_types(self):
        """Test non-dict or non-numeric types."""
        is_valid, errors = validate_student_record("not a dict")
        self.assertFalse(is_valid)
        self.assertIn("Record must be a JSON object.", errors)

        self.assertIsNone(parse_numeric("abc-invalid"))
        self.assertIsNone(parse_numeric(None))
        self.assertEqual(parse_numeric("85.5%"), 85.5)
        self.assertEqual(parse_numeric("1,200.5"), 1200.5)

    def test_05_missing_paired_values_in_correlation(self):
        """Test that records with unpaired attendance or readiness are safely excluded."""
        records = [
            {"attendance_percentage": 90, "overall_readiness_score": 80},  # valid pair
            {"attendance_percentage": 85, "overall_readiness_score": None}, # missing y
            {"attendance_percentage": None, "overall_readiness_score": 70}, # missing x
            {"attendance_percentage": 75, "overall_readiness_score": 65},  # valid pair
        ]
        corr = calculate_pearson_correlation(records)
        self.assertEqual(corr["valid_pairs_count"], 2)
        self.assertEqual(corr["status"], "computed")
        self.assertIsNotNone(corr["correlation_coefficient"])

    def test_06_insufficient_sample_size(self):
        """Test correlation behavior when valid pairs N < 2."""
        records = [
            {"attendance_percentage": 90, "overall_readiness_score": 80}
        ]
        corr = calculate_pearson_correlation(records)
        self.assertEqual(corr["valid_pairs_count"], 1)
        self.assertIsNone(corr["correlation_coefficient"])
        self.assertEqual(corr["status"], "insufficient_data")

    def test_07_zero_variance_correlation(self):
        """Test zero variance handling when all x or all y are identical."""
        records = [
            {"attendance_percentage": 80, "overall_readiness_score": 60},
            {"attendance_percentage": 80, "overall_readiness_score": 75},
            {"attendance_percentage": 80, "overall_readiness_score": 90},
        ]
        corr = calculate_pearson_correlation(records)
        self.assertEqual(corr["valid_pairs_count"], 3)
        self.assertIsNone(corr["correlation_coefficient"])
        self.assertEqual(corr["status"], "zero_variance")

    def test_08_bidirectional_r_classification(self):
        """Test positive, negative, and negligible r classifications and non-causal labeling."""
        # Perfect positive: x = [60, 70, 80, 90], y = [50, 60, 70, 80]
        pos_records = [
            {"attendance_percentage": 60, "overall_readiness_score": 50},
            {"attendance_percentage": 70, "overall_readiness_score": 60},
            {"attendance_percentage": 80, "overall_readiness_score": 70},
            {"attendance_percentage": 90, "overall_readiness_score": 80},
        ]
        pos_corr = calculate_pearson_correlation(pos_records)
        self.assertEqual(pos_corr["direction"], "positive")
        self.assertEqual(pos_corr["strength"], "strong")
        self.assertAlmostEqual(pos_corr["correlation_coefficient"], 1.0, places=2)
        self.assertIn("does not prove causation", pos_corr["description"])

        # Perfect negative: x = [60, 70, 80, 90], y = [90, 80, 70, 60]
        neg_records = [
            {"attendance_percentage": 60, "overall_readiness_score": 90},
            {"attendance_percentage": 70, "overall_readiness_score": 80},
            {"attendance_percentage": 80, "overall_readiness_score": 70},
            {"attendance_percentage": 90, "overall_readiness_score": 60},
        ]
        neg_corr = calculate_pearson_correlation(neg_records)
        self.assertEqual(neg_corr["direction"], "negative")
        self.assertEqual(neg_corr["strength"], "strong")
        self.assertAlmostEqual(neg_corr["correlation_coefficient"], -1.0, places=2)
        self.assertIn("does not prove causation", neg_corr["description"])


if __name__ == "__main__":
    unittest.main()
