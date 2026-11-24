"""
Unit tests for HireSense AI Structuring Engine
Run using: python -m unittest discover -s AI/tests
"""

import unittest
import asyncio
from AI.alias_normalization import normalize_tech_alias
from AI.models import (
    StructuredJobListing,
    SalaryStructure,
    TechStackItem,
    GenerateJobRequest,
    GenerateJobResponse,
)
from AI.structuring_service import (
    sanitize_input,
    post_process_listing,
    deterministic_structuring_fallback,
    generate_structured_listing,
)


class TestAliasNormalization(unittest.TestCase):
    def test_canonical_mapping(self):
        canonical, cat, devicon = normalize_tech_alias("js")
        self.assertEqual(canonical, "JavaScript")
        self.assertEqual(cat, "frontend")
        self.assertEqual(devicon, "javascript")

    def test_postgres_normalization(self):
        canonical, cat, devicon = normalize_tech_alias("psql")
        self.assertEqual(canonical, "PostgreSQL")
        self.assertEqual(cat, "database")

    def test_data_tools(self):
        canonical, _, _ = normalize_tech_alias("ms excel")
        self.assertEqual(canonical, "Microsoft Excel")

        canonical, _, _ = normalize_tech_alias("power bi")
        self.assertEqual(canonical, "Power BI")

    def test_testing_tools(self):
        canonical, cat, _ = normalize_tech_alias("vitest")
        self.assertEqual(canonical, "Vitest")
        self.assertEqual(cat, "tools")

    def test_unknown_technology(self):
        canonical, cat, devicon = normalize_tech_alias("CustomInternalFramework")
        self.assertEqual(canonical, "CustomInternalFramework")
        self.assertEqual(cat, "other")
        self.assertIsNone(devicon)


class TestSanitizeInput(unittest.TestCase):
    def test_strip_html(self):
        raw = "<script>alert('xss')</script><b>Senior Engineer</b>"
        cleaned = sanitize_input(raw)
        self.assertEqual(cleaned, "alert('xss')Senior Engineer")

    def test_max_chars(self):
        raw = "a" * 500
        cleaned = sanitize_input(raw, max_chars=100)
        self.assertEqual(len(cleaned), 100)

    def test_empty_string(self):
        self.assertEqual(sanitize_input(""), "")


class TestPostProcessingAndModels(unittest.TestCase):
    def test_default_synthesized_about_role(self):
        raw_dict = {
            "title": "Backend Developer",
            "company": "Tech Corp",
            "tech_stack": ["python", "fastapi"],
        }
        processed = post_process_listing(raw_dict, "Backend Developer", "Tech Corp")
        self.assertIsInstance(processed, StructuredJobListing)
        self.assertTrue(len(processed.about_role) > 0)
        self.assertEqual(processed.title, "Backend Developer")
        self.assertEqual(len(processed.tech_stack), 2)
        self.assertEqual(processed.tech_stack[0].canonical_name, "Python")

    def test_salary_formatting(self):
        raw_dict = {
            "title": "Data Analyst",
            "company": "Analytics Inc",
            "salary": {"min": 50000, "max": 75000, "currency": "INR", "period": "month"},
        }
        processed = post_process_listing(raw_dict, "Data Analyst", "Analytics Inc")
        self.assertIn("INR 50,000", processed.salary.display)

    def test_deterministic_fallback(self):
        desc = """
        We are seeking a Full Stack Developer with 2-4 years of experience.
        Must have proficiency in React, TypeScript, and Node.js.
        Bonus points for Docker and PostgreSQL.
        This is a remote position.
        Responsibilities:
        - Build and maintain modern web applications
        - Collaborate with UI/UX designers and product managers
        - Write clean and well-tested code
        """
        data = deterministic_structuring_fallback(
            title="Full Stack Developer",
            company="HireSense",
            description=desc,
            salary="₹12 – ₹18 LPA",
        )
        listing = post_process_listing(data, "Full Stack Developer", "HireSense")
        self.assertEqual(listing.work_mode, "remote")
        self.assertEqual(listing.experience, "2-4 years")
        tech_names = [t.canonical_name for t in listing.tech_stack]
        self.assertIn("React", tech_names)
        self.assertIn("TypeScript", tech_names)
        self.assertIn("Node.js", tech_names)
        self.assertTrue(len(listing.responsibilities) > 0)

    def test_generate_structured_listing_async(self):
        async def run():
            listing, model, ver = await generate_structured_listing(
                title="React Engineer",
                company="HireSense",
                description="Looking for React and Tailwind CSS developer with 1+ years experience. Remote.",
            )
            self.assertIsInstance(listing, StructuredJobListing)
            self.assertEqual(listing.work_mode, "remote")
            self.assertTrue(len(model) > 0)
            self.assertEqual(ver, "v1.0.0")

        asyncio.run(run())


if __name__ == "__main__":
    unittest.main()
