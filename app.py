from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import serial

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

ser = serial.Serial('/dev/tty1', 9600)

@socketio.on('connect')
def test_connect():
    print('Client connected')
    send_board_state()

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

@socketio.on('piece_moved')
def piece_moved(move):
    print(f'Piece moved from {move["from"]} to {move["to"]}')
    send_board_state()

@socketio.on('reset_board')
def reset_board():
    print('Board reset')
    send_board_state()

def send_board_state():
    board_state = []
    for i in range(25):
        board_state.append(int(ser.readline().decode('ascii').strip()))
    print(board_state)
    socketio.emit('update_board', board_state)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    socketio.run(app)
