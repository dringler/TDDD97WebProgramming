# SELENIUM TESTING
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time

# PARAMETER
# USERNAME
pUsername = 'danri205@liu.se'
# PASSWORD
pPassword = 'test1'

# LOGIN AND LOGOUT TESTING
print ("Start login and logout testing")

#open web page
browser = webdriver.Firefox()
browser.get('http://127.0.0.1:5000/')

# enter user email
elemEmail = browser.find_element_by_id('loginEmail')  # Find the email input field
elemEmail.send_keys(pUsername) # enter user email

# enter user password
elemPw = browser.find_element_by_id('loginPassword')  # Find the email input field
elemPw.send_keys(pPassword) # enter user email

# press login button
browser.find_element_by_id('loginButtonID').click()

print ("Login successful")

#go to account tab
accountLink = browser.find_element_by_link_text('Account')
accountLink.click()

time.sleep(1)

#click sign-out-button
browser.find_element_by_id('signOutButton').click()

print ("Lougout successful")