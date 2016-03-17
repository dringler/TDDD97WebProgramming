# SELENIUM TESTING
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

# PARAMETER
# USERNAME
pUsername = 'danri205@liu.se'
# PASSWORD
pPassword = 'test1' 

# LOGIN TESTING
print ("Start login testing")

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