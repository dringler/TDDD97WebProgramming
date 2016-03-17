# SELENIUM TESTING
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time

# PARAMETER
# USERNAME
pUsername = 'danri205@liu.se'
# PASSWORD
pPassword = 'test1'
# RECEIVER
pSearchUser = '1@liu.se'
# MESSAGE
pMessage = 'automatic generated test message'

# SEARCH USER AND POST MESSAGE TESTING
print ("Start search user and post message testing")

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
browseLink = browser.find_element_by_link_text('Browse')
browseLink.click()

time.sleep(1)

print ("Search for user")

# search for user 
elemReceiver = browser.find_element_by_id('searchUserID')  # Find the email input field
elemReceiver.send_keys(pSearchUser) # enter user to be searched
time.sleep(1)
# click search button
browser.find_element_by_id('searchUserButtonID').click()
time.sleep(1)
print ("User found")

# insert message to text area
elemTextfield = browser.find_element_by_id('postareaBrowse')
elemTextfield.send_keys(pMessage) 

# click post message button
browser.find_element_by_id('postBrowseButton').click()
print ("Message posted")


