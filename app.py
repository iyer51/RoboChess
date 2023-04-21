from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import serial
import eventlet
import time

app = Flask(__name__, template_folder = 'templates', static_folder = 'static')
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

uart_port='/dev/ttyUSB0'
baudrate=9600

ser = serial.Serial(uart_port,baudrate,timeout=1)
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/favicon.ico')
def favicon():
    return ""
    
@socketio.on('connect')
def test_connect(data):
    print('Client connected')
    

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
    print('Sending board state')
    board_state = []
    for i in range(25):
        board_state.append(int(ser.readline().decode('utf-8').strip()))
    print(board_state)
    
    updated_squares = []
    for i, value in enumerate(board_state):
        row = (i // 5) + 1
        col = (i % 5) + 1
        updated_squares.append({"row": row, "col": col, "piece": value})
    
    socketio.emit('update_board', updated_squares)
    
    
@app.route('/move', methods=['POST'])
def move():
    move_data = request.json
    from_coord = (move_data['pick'][1] + 1, move_data['pick'][0] + 1)
    to_coord = (move_data['place'][1] + 1, move_data['place'][0] + 1)
    move_str = f'Pick from {from_coord} place {to_coord}'.encode('utf-8')
    socketio.emit('piece_moved', {'from': from_coord, 'to': to_coord})
    ser.write(move_str)
    
    return 'Move received'


if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('128.46.96.239', 5000)), app)
