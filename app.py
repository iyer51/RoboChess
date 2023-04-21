from flask import Flask, render_template, request
from flask_socketio import SocketIO
import serial

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

ser = serial.Serial('/dev/ttyACM0', 9600)

# Function to write board state to a text file
def write_board_state(board_state):
    with open('board_state.txt', 'w') as file:
        file.write(','.join(map(str, board_state)) + '\n')

# Function to read board state from a text file
def read_board_state():
    with open('board_state.txt', 'r') as file:
        board_state_str = file.read().strip()
    return list(map(int, board_state_str.split(',')))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_data', methods=['GET'])
def get_data():
    # Read data from the microcontroller
    data = ser.readline().decode('utf-8').strip()
    # Parse the data into a dictionary of coordinates
    coord_data = {
        "pick": [int(data[0]), int(data[1])],
        "place": [int(data[2]), int(data[3])]
    }
    # Update the board state based on the received data
    board_state = read_board_state()
    pick_index = coord_data["pick"][0] - 1
    place_index = coord_data["place"][0] - 1
    board_state[place_index] = board_state[pick_index]
    board_state[pick_index] = 0
    write_board_state(board_state)
    # Emit the updated board state to the website
    socketio.emit('update', board_state)
    # Return a response to the client
    return "Data received and emitted to website."

if __name__ == '__main__':
    # Initialize the board state to all 1's
    board_state = [1] * 5
    write_board_state(board_state)
    # Run the app
    socketio.run(app, host='0.0.0.0', port=5000)
