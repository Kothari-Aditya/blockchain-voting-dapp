# import pywhatkit
# import datetime
# import time
# import argparse
# import sys
# import pyautogui

# def send_whatsapp_message(phone_number, otp):
#     """
#     Send a WhatsApp message using pywhatkit
#     This method doesn't require browser automation with user profiles
#     """
#     try:
#         # Format phone number (remove + if present)
#         if phone_number.startswith('+'):
#             phone_number = phone_number[1:]
            
#         # Create message
#         message = f'Your OTP for Voting DApp verification is: {otp}. This code will expire in 5 minutes.'
            
#         # Get current time and add 1 minute
#         now = datetime.datetime.now()
#         send_time_hour = now.hour
#         send_time_minute = now.minute + 1
        
#         # Handle minute overflow
#         if send_time_minute >= 60:
#             send_time_minute -= 60
#             send_time_hour += 1
        
#         # Handle hour overflow
#         if send_time_hour >= 24:
#             send_time_hour -= 24
            
#         print(f"Scheduled message to {phone_number} at {send_time_hour}:{send_time_minute}")
        
#         # Send message (with minimal wait time and auto-close options)
#         pywhatkit.sendwhatmsg(
#             phone_no=f"+{phone_number}",
#             message=message,
#             time_hour=send_time_hour,
#             time_min=send_time_minute,
#             wait_time=15,
#             tab_close=True,
#             close_time=5
#         )

#         pyautogui.press('enter')
#         print("Enter key pressed to send message")
        
#         print("WhatsApp message sent successfully")
#         return True
        
#     except Exception as e:
#         print(f"Error sending WhatsApp message: {str(e)}")
#         return False

# def main():
#     parser = argparse.ArgumentParser(description='Send OTP via WhatsApp using pywhatkit')
#     parser.add_argument('--phone', required=True, help='Phone number with country code')
#     parser.add_argument('--otp', required=True, help='OTP to send')
#     args = parser.parse_args()
    
#     # Send message
#     success = send_whatsapp_message(args.phone, args.otp)
    
#     # Exit with appropriate code
#     sys.exit(0 if success else 1)

# if __name__ == "__main__":
#     main()

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import urllib.parse
import sys
import argparse

def send_whatsapp_otp(phone_number, otp, headless=True):
    try:
        # Setup Chrome options to use your own profile
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument(r"--user-data-dir=C:/Users/ancla/AppData/Local/Google/Chrome/User Data")
        chrome_options.add_argument("--profile-directory=Default")
        
        if headless:
            chrome_options.add_argument('--headless=new')
            chrome_options.add_argument('--disable-gpu')
            
        chrome_options.add_argument('--window-size=1920,1080')
        
        # Setup Chrome driver
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.get('https://web.whatsapp.com/')
        wait = WebDriverWait(driver, 30)
        
        # Wait for WhatsApp Web to load
        print("Waiting for WhatsApp Web to load...")
        time.sleep(15)
        
        # Format phone number (remove + if present)
        if phone_number.startswith('+'):
            phone_number = phone_number[1:]
            
        # Create message with OTP
        message = f'Your OTP for Voting DApp verification is: {otp}. This code will expire in 5 minutes.'
        encoded_message = urllib.parse.quote(message)
        
        # Open WhatsApp chat with the number
        print(f"Opening chat with {phone_number}...")
        driver.get(f"https://web.whatsapp.com/send?phone={phone_number}&text={encoded_message}")
        
        # Wait for message box to appear
        try:
            print("Waiting for send button...")
            send_button = wait.until(EC.element_to_be_clickable((By.XPATH, '//span[@data-icon="send"]')))
            send_button.click()
            print("Message sent!")
            success = True
        except Exception as e:
            print(f"Failed to send the message: {str(e)}")
            print("Make sure the number is on WhatsApp and valid.")
            success = False
            
        time.sleep(5)
        driver.quit()
        return success
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Send OTP via WhatsApp')
    parser.add_argument('--phone', required=True, help='Phone number with country code')
    parser.add_argument('--otp', required=True, help='OTP to send')
    parser.add_argument('--visible', action='store_true', help='Run in visible mode (non-headless)')
    args = parser.parse_args()
    
    success = send_whatsapp_otp(args.phone, args.otp, not args.visible)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()