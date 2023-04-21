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
    data = ser.readline().decode('utf-8').strip()
    data_dict = json.loads(data)

    from_coord = tuple(map(lambda x: x + 1, data_dict['pick']))
    to_coord = tuple(map(lambda x: x + 1, data_dict['place']))

    socketio.emit('update', {'from': from_coord, 'to': to_coord})
    
    
@app.route('/move', methods=['POST'])
def move():
    move_data = request.json
    from_coord = (move_data['pick'][1] + 1, move_data['pick'][0] + 1)
    to_coord = (move_data['place'][1] + 1, move_data['place'][0] + 1)
    move_str = f'Pick from {from_coord} place {to_coord}'.encode('utf-8')
    socketio.emit('piece_moved', {'from': from_coord, 'to': to_coord})
    ser.write(move_str)
    
    return 'Move received'

@app.route('/get_data', methods=['GET'])
def get_data():
    # Read data from the microcontroller
    data = ser.readline().decode('utf-8').strip()
    # Parse the data into a dictionary of coordinates
    coord_data = {
        "pick": [int(data[0]), int(data[1])],
        "place": [int(data[2]), int(data[3])]
    }
    # Emit the data to the website
    socketio.emit('update_board', coord_data)
    # Return a response to the client
    return "Data received and emitted to website."

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('128.46.96.239', 5000)), app)
