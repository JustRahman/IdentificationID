import os

# Never ping IndexNow (Bing) from tests.
os.environ["INDEXNOW_KEY"] = ""
