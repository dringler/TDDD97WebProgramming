# SELENIUM TESTING
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
import time

# PARAMETER
# USERNAME
pUsername = 'autoTest6@liu.se'
# PASSWORD
pPassword = 'test1' 
# FIRST NAME
pFirstName = 'firstname'
# LAST NAME
pLastName = 'lastname'
# GENDER
pGender = 'Female'
# CITY
pCity = 'Stockholm'
# COUNTRY
pCountry = 'Sweden'

# LOGIN TESTING
print ("Start signup testing")

browser = webdriver.Firefox()
browser.get('http://127.0.0.1:5000/')

# enter user email
elemEmail = browser.find_element_by_id('signUpEmail')  
elemEmail.send_keys(pUsername)

# enter password
elemPw = browser.find_element_by_id('signUpPassword') 
elemPw.send_keys(pPassword)

# enter repeat password
elemPw2 = browser.find_element_by_id('confirmSignUpPassword') 
elemPw2.send_keys(pPassword)

# enter first name
browser.find_element_by_id('signUpFirstName').send_keys(pFirstName)
# enter last name
browser.find_element_by_id('signUpLastName').send_keys(pLastName)
# enter gender
select = Select(browser.find_element_by_id('signUpGender'))
# select by visible text
select.select_by_visible_text(pGender)

# enter city
browser.find_element_by_id('signUpCity').send_keys(pCity)
# enter country
browser.find_element_by_id('signUpCountry').send_keys(pCountry + Keys.RETURN)

time.sleep(1)
# press signup button
browser.find_element_by_id('signUpButtonID').click()

print ("Signup successful")