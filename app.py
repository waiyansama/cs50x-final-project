from flask import Flask, render_template, request
import sqlite3

app = Flask(__name__)


@app.route('/', methods=["GET", "POST"])
def index():
    if request.method == "POST":
        ...
    else:
        return render_template('index.html')


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
