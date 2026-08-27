from playwright.sync_api import sync_playwright
import time
import os
import glob

def run_cuj(page):
    page.goto("http://localhost:5173")
    page.wait_for_timeout(4000)

    # Dashboard - Check Pulse Widget
    page.screenshot(path="/home/jules/verification/screenshots/dashboard_pulse.png")
    page.wait_for_timeout(1000)

    # Go to candidate evaluation
    page.goto("http://localhost:5173/candidate-evaluation/1")
    page.wait_for_timeout(4000)
    page.screenshot(path="/home/jules/verification/screenshots/candidate_evaluation.png")
    page.wait_for_timeout(1000)

    # Go to candidate scores
    page.goto("http://localhost:5173/candidate-scores/1")
    page.wait_for_timeout(4000)
    page.screenshot(path="/home/jules/verification/screenshots/candidate_scores.png")
    page.wait_for_timeout(1000)

    # Go to job analytics
    page.goto("http://localhost:5173/job-analytics")
    page.wait_for_timeout(4000)
    page.screenshot(path="/home/jules/verification/screenshots/job_analytics.png")
    page.wait_for_timeout(2000)

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={"width": 1280, "height": 800}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            context.close()
            browser.close()

        videos = glob.glob("/home/jules/verification/videos/*.webm")
        if videos:
            print(f"Video saved to {videos[-1]}")
