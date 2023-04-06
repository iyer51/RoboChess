from flask import Flask, render_template, request
import serial

# Initialize Flask app and serial port
app = Flask(__name__)
ser = serial.Serial('/dev/ttyACM0', 9600)

# Define route to handle move request
@app.route('/move', methods=['POST'])
def move():
    # Parse move info from POST request
    from_square = request.form['from']
    to_square = request.form['to']

    # Send move info to STM32 board via serial port
    move_data = from_square + to_square
    ser.write(move_data.encode())

    # Return success message to client
    return 'Move sent to robot arm!'

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')