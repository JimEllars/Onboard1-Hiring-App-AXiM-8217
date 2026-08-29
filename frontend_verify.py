from playwright.sync_api import sync_playwright
import time
import os
import glob

def run_cuj(page):
    page.goto("http://localhost:5173/jobs")
    page.wait_for_timeout(2000)

    # Click first job "Senior Frontend Engineer"
    page.get_by_text("Senior Frontend Engineer").first.click()
    page.wait_for_timeout(3000)
    page.screenshot(path="/home/jules/verification/screenshots/job_details_1.png")

    # Click "Apply Now" (we'll just go directly to the form as we may not have built an explicit "Apply Now" button on that page)
    page.goto("http://localhost:5173/apply/1")
    page.wait_for_timeout(3000)
    page.screenshot(path="/home/jules/verification/screenshots/application_form_1.png")

    # Verify that the title correctly says "Applying for Senior Frontend Engineer"
    print("Checking title:", page.locator("h2").text_content())

    # Navigate to the E-Sign page
    page.goto("http://localhost:5173/offer/1")
    page.wait_for_timeout(3000)
    page.screenshot(path="/home/jules/verification/screenshots/offer_unsigned.png")

    # Sign the offer
    page.locator("input#signature").fill("John Doe")
    page.wait_for_timeout(1000)
    page.get_by_role("button", name="Sign & Accept Offer").click()
    page.wait_for_timeout(4000) # wait for success state

    page.screenshot(path="/home/jules/verification/screenshots/offer_signed.png")
    page.wait_for_timeout(1000)

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
