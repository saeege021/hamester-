from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import hmac
import hashlib
from urllib.parse import unquote


def validate_init_data(init_data: str, bot_token: str):
    vals = {k: unquote(v) for k, v in [s.split('=', 1) for s in init_data.split('&')]}
    data_check_string = '\n'.join(f"{k}={v}" for k, v in sorted(vals.items()) if k != 'hash')

    secret_key = hmac.new("WebAppData".encode(), bot_token.encode(), hashlib.sha256).digest()
    h = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256)
    return h.hexdigest() == vals['hash']


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'


@app.route('/')
def main_page():
    init_data = request.args.get('init_data')
    user_name = "User"  # Default name

    if init_data:
        bot_token = 'Your-bot-token'
        is_valid = validate_init_data(init_data, bot_token)
        if is_valid:
            vals = {k: unquote(v) for k, v in [s.split('=', 1) for s in init_data.split('&')]}
            user_name = vals.get('first_name', '') + ' ' + vals.get('last_name', '')

    return render_template('index.html', user_name=user_name)


@app.route('/process', methods=['POST'])
def validate_user():
    data = request.get_json()
    if data and 'value' in data:
        print(data['value'])
        is_valid = validate_init_data(data['value'], 'Your-bot-token')
        print(is_valid)

        if is_valid:
            username = data.get('username')
            email = data.get('email')
            if username and email:
                new_user = User(username=username, email=email)
                db.session.add(new_user)
                db.session.commit()
                return jsonify(is_valid=True)
        return jsonify(is_valid=is_valid)
    return jsonify(is_valid=False)


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run()
