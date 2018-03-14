import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import json
import urllib2
import os.path
import os


class MyHandler(FileSystemEventHandler):


    def build_json(thedata):
        return {
            'sessionAttributes': 'sending data to you .... ',
            'file_contents':  thedata
        }

    def on_modified(self, event):
        mystring = str(event)
        ist = mystring.index('=') + 4
        fname = mystring[ist:-2]

        if os.path.isfile(fname):
            with open(fname, 'r') as myfile:
                file_contents = myfile.read().replace('\n', '')
                data = file_contents
                print data

                req = urllib2.Request('https://djh88cqnbi.execute-api.us-west-2.amazonaws.com/prod/mailPluginRouter')
                req.add_header('Content-Type', 'application/json')

                response = urllib2.urlopen(req, json.dumps(data))
                os.remove(fname)



if __name__ == "__main__":
    event_handler = MyHandler()
    observer = Observer()
    observer.schedule(event_handler, path='.', recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()





"""
remote request call https post
json object
contain contents of file 
https://stackoverflow.com/questions/2975624/how-to-run-a-python-script-in-the-background-even-after-i-logout-ssh"""








import sys
import time
import logging
from watchdog.observers import Observer
from watchdog.events import LoggingEventHandler


def newfunction(message):
    logger.debug('hey man')
    logger.debug(message)



if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO,
                        format='%(asctime)s - %(message)s' + 'test123',
                        datefmt='%Y-%m-%d %H:%M:%S')
    path = sys.argv[1] if len(sys.argv) > 1 else '.'
    event_handler = LoggingEventHandler()
    observer = Observer()
    observer.schedule(event_handler, path, recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()