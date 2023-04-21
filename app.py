from flask import Flask, request, render_template
from flask_socketio import SocketIO, emit
import serial

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

# Initialize the board state as an array of 5 ones
board_state = [1, 1, 1, 1, 1]

# Define a function to update the board state based on a move from the microcontroller
def update_board_state(pick_index, place_index):
    # Update the board state based on the pick and place indices
    board_state[pick_index] = 0
    board_state[place_index] = 1

    # Emit the updated board state to the website
    emit('update', board_state, broadcast=True)

# Define a function to read moves from a text file and update the board state accordingly
def read_moves_file():
    # Open the moves file
    with open('moves.txt', 'r') as f:
        # Read the lines in the file
        lines = f.readlines()

        # Iterate over the lines and update the board state
        for line in lines:
            # Split the line into the pick and place indices
            pick_index, place_index = map(int, line.strip().split(','))

            # Update the board state
            update_board_state(pick_index, place_index)

# Route for the home page
@app.route('/')
def index():
    # Render the template
    return render_template('index.html', board_state=board_state)

# Route for receiving moves from the website
@app.route('/move', methods=['POST'])
def move():
    # Get the pick and place indices from the request data
    data = request.get_json()
    pick_index = data['pick'] - 1
    place_index = data['place'] - 1

    # Update the board state and emit the update to the website
    update_board_state(pick_index, place_index)

    # Write the move to the moves file
    with open('moves.txt', 'a') as f:
        f.write(f'{pick_index},{place_index}\n')

    # Return a success response
    return 'Move successful'

if __name__ == '__main__':
    # Start the serial connection with the microcontroller
    ser = serial.Serial('/dev/ttyACM0', 9600)

    # Start the application
    socketio.run(app)

    # Read moves from the file
    read_moves_file()
