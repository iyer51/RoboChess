from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import serial
import eventlet

app = Flask(__name__, template_folder = 'templates')
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

ser = serial.Serial('/dev/serial0', 9600)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def test_connect():
    print('Client connected')

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

@socketio.on('piece_moved')
def piece_moved(move):
    print(f'Piece moved from {move["from"]} to {move["to"]}')

    # Parse the move data
    fromIndex = move['from']
    toIndex = move['to']
    fromRow = int(fromIndex / 5) + 1
    fromCol = fromIndex % 5 + 1
    toRow = int(toIndex / 5) + 1
    toCol = toIndex % 5 + 1

    # Construct the message to send to the STM
    message = f'{fromRow},{fromCol},{toRow},{toCol}\n'
    messageBytes = message.encode('utf-8')

    # Send the message over UART
    ser.write(messageBytes)

@socketio.on('reset_board')
def reset_board():
    print('Board reset')

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 5000)), app)
