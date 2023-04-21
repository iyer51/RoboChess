from flask import Flask, render_template, request
from flask_socketio import SocketIO
import time
import serial

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
ser = serial.Serial('/dev/ttyUSB0', 9600)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/move', methods=['POST'])
def move():
    move_data = request.json
    from_coord = (move_data['pick'] + 1)
    to_coord = (move_data['place'] + 1)
    move_str = f'Pick from {from_coord} place {to_coord}'.encode('utf-8')
    socketio.emit('piece_moved', {'from': from_coord, 'to': to_coord})
    ser.write(move_str)
    return "OK"

@app.route('/load_moves')
def load_moves():
    with open('moves.txt', 'r') as f:
        moves = f.readlines()

    for move in moves:
        move_data = move.strip().split(',')
        pick = int(move_data[0].split(':')[1]) - 1
        place = int(move_data[1].split(':')[1]) - 1
        board_state = [1] * 5
        board_state[pick] = 0
        board_state[place] = 1
        socketio.emit('update_board', board_state)
        ser.write(f"Pick from {pick+1} place {place+1}".encode('utf-8'))

    return "OK"
