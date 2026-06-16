import os
from dotenv import load_dotenv


load_dotenv()

# Retrieve secret key from secret file mount
jwt_secret_file = "/run/secrets/jwt_secret"

if os.path.isfile(jwt_secret_file):
    with open(jwt_secret_file, "r") as jwt_secret:
        SECRET_KEY = jwt_secret.read().rstrip()
        if not SECRET_KEY:
            raise Exception("jwt_secret was retrieved but is not set.")     
else:
    raise Exception("Could not access jwt_secret mount.")