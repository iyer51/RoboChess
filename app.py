from flask import Flask, render_template, request
from flask_socketio import SocketIO
import serial

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
ser = serial.Serial('/dev/ttyACM0', 9600)

board_state = []

# Write move data to a text file
@app.route('/get_data', methods=['GET'])
def get_data():
    # Read data from the microcontroller
    data = ser.readline().decode('utf-8').strip()
    # Parse the data into a dictionary of coordinates
    coord_data = {
        "pick": int(data[0]),
        "place": int(data[1])
    }
    # Write the data to the move_data.txt file
    with open('move_data.txt', 'a') as f:
        f.write(f"{coord_data['pick']},{coord_data['place']}\n")
    # Return a response to the client
    return "Data received and written to file."


# Read move data from a text file
def read_move_data():
    move_data = []
    with open('move_data.txt', 'r') as f:
        for line in f:
            move = {}
            pick, place = line.strip().split(',')
            move['pick'] = int(pick)
            move['place'] = int(place)
            move_data.append(move)
    return move_data

# Update the board state based on move data
def update_board_state(move_data):
    squares = [0] * 25
    for move in move_data:
        squares[move['place']] = squares[move['pick']]
        squares[move['pick']] = 0
    return squares

# Route for the main page
@app.route('/')
def index():
    return render_template('index.html')

# Route for getting the board state
@app.route('/get_board_state', methods=['GET'])
def get_board_state():
    global board_state
    return {'board_state': board_state}

# Route for receiving move data from the client
@app.route('/move', methods=['POST'])
def move():
    global board_state
    move_data = request.json
    write_move_data(move_data)
    board_state = update_board_state(read_move_data())
    socketio.emit('update_board', {'board_state': board_state})
    return {'success': True}

if __name__ == '__main__':
    app.run(debug=True)
