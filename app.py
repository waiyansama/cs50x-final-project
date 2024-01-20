from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, login_user, login_required, logout_user,  current_user
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from model import User, Task, Base


app = Flask(__name__)
app.secret_key = 'f56c70b5bea3695ab531'

# Creating sqlite3 database
engine = create_engine("sqlite:///database.db", echo=True)
Base.metadata.create_all(bind=engine)
session = Session(bind=engine)

# Flask Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# Loading user from database


@login_manager.user_loader
def load_user(user_id):
    return session.query(User).get(user_id)

# Home page


@app.route('/')
@login_required
def index():
    return render_template('index.html')


@app.route('/login', methods=["GET", "POST"])
def login():
    if request.method == "POST" and request.form["username"] and request.form["password"]:
        username_input = request.form["username"]
        password_input = request.form["password"]
        user = session.query(User).filter_by(username=username_input).first()

        if user and check_password_hash(user.hash, password_input):
            login_user(user)
            return redirect(url_for("index"))
        elif not user:
            flash("Username does not exist.", "error")
        elif not check_password_hash(user.hash, password_input):
            flash("Password incorrect.", "error")

    return render_template("login.html")


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))


@app.route('/register', methods=["GET", "POST"])
def register():
    if request.method == "POST" and request.form["username"] and request.form["password"] and request.form["confirmation"]:
        username_input = request.form["username"]
        password_input = request.form["password"]
        comfirmation_input = request.form["confirmation"]
        user = session.query(User).filter_by(username=username_input).first()

        if user:
            flash("Username already exist.", "error")
        elif len(username_input) < 3:
            flash("Username must be at least 3 characters.", "error")
        elif len(password_input) < 5:
            flash("Password must be at least 6 characters.", "error")
        elif password_input != comfirmation_input:
            flash("Confirm password must be same.", "error")
        else:
            password_hash = generate_password_hash(password_input)
            user = User(username=username_input, hash=password_hash)

            session.add(user)
            session.commit()
            flash("Account created successfully!", "success")

            return redirect(url_for("login"))

    return render_template("register.html")


@app.route('/add', methods=["POST"])
def add():
    # Fetch tasks from JS
    task_content = request.json["content"]

    # Save task to database
    task = Task(user_id=current_user.id, text=task_content, is_check=False)
    session.add(task)
    session.commit()
    return jsonify({"success": True, "message": "Task added successfully"})


@app.route('/edit', methods=["POST"])
def edit():
    # Fetch id and current task from JS
    task_id = request.json["id"]
    task_text = request.json["text"]

    # Update the existing task
    task = session.query(Task).filter_by(id=task_id).first()
    task.text = task_text
    session.commit()
    return jsonify({"success": True, "message": "Task deleted successfully"})


@app.route('/delete', methods=["POST"])
def delete():
    # Fetch id from JS
    task_id = request.json["id"]

    # Delete task from database
    task = session.query(Task).filter_by(id=task_id).first()
    session.delete(task)
    session.commit()
    return jsonify({"success": True, "message": "Task deleted successfully"})


@app.route('/check', methods=["POST"])
def check():
    # Fetch id and checkbox value from JS
    task_id = request.json["id"]
    task_check = request.json["check"]

    # Update the check value True/False
    task = session.query(Task).filter_by(id=task_id).first()
    task.is_check = task_check
    session.commit()
    return jsonify({"success": True, "message": "Task checked successfully"})


@app.route('/get_data')
@login_required
def get_data():
    # Converting user's task to dictionary and send as JSON
    data_dict = [task.to_dict() for task in current_user.tasks]
    return jsonify(data_dict)


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
