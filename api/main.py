import logging
from application import app # initialize app

logging.getLogger("passlib").setLevel(logging.ERROR)  # silence the error caused by a bug in the bcrypt package


