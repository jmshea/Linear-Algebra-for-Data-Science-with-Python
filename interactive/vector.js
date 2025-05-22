document.getElementById('vector-plot').addEventListener('input', plotVectors);

document.getElementById('vector-plot').addEventListener('keydown', function(event) {
    const allowedKeys = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', // Number keys
        ',', '[', ']', ' ', // Comma, left bracket, right bracket, space
        '-', '+', // Signs
        'Enter', 'Backspace', 'Delete' // Enter, Backspace, and Delete
    ];

    const key = event.key;

    // Prevent any key that is not in the allowedKeys list
    if (!allowedKeys.includes(key)) {
        event.preventDefault();
        return;
    }

    const textarea = event.target;
    // Check for the left bracket (`[`) and ensure it's unique per line
    if (key === '[') {
        // Get the cursor position
        const cursorPosition = textarea.selectionStart;
        
        // Get the content up to and including the current line
        const valueUpToCursor = textarea.value.substring(0, cursorPosition);
        const lastLineBreak = valueUpToCursor.lastIndexOf('\n');
        const currentLine = valueUpToCursor.substring(lastLineBreak + 1);

        // Check if the current line already contains `[` and prevent insertion if so
        if (currentLine.includes('[')) {
            event.preventDefault();
            return;
        }
    }

    // Check for the right bracket (`]`) and advance to next line if it is pressed
    if (key === ']') {
                // Get the cursor position
                const cursorPosition = textarea.selectionStart;
                
                // Get the content up to and including the current line
                const valueUpToCursor = textarea.value.substring(0, cursorPosition);
                // Prevent the default right bracket input behavior
                event.preventDefault();

                // Insert the right bracket followed by a newline
                textarea.value = textarea.value.substring(0, cursorPosition) + ']\n[' +
                    textarea.value.substring(cursorPosition);

                // Move the cursor position to after the new line
                textarea.selectionStart = textarea.selectionEnd = cursorPosition + 3;
                plotVectors();
            }
            // Check for right bracket and apply specific behavior
        });

let x_min = -5, x_max = 5, y_min = -5, y_max = 5;

function plotVectors() {
    const colors = [ '345995', 'e26d5a', '87a878', '5bc0eb', '861657'];

    const input = document.getElementById('vector-plot').value;
    const vectors = parseVectors(input);

    /*
    const annotations = vectors.slice(0,5).map((vec, index) => ({
        ax: -0.000001,
        ay: -0.000001,
        axref: 'x',
        ayref: 'y',
        x: vec[0],
        y: vec[1],
        xref: 'x',
        yref: 'y',
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 4,
        arrowcolor: colors[index]
    }));*/
    var annotations = vectors
          //.slice(0,5)
          .map((vec, index) =>
              (
                   {
                       ax: -0.000001,
                       ay: -0.000001,
                       axref: 'x',
                       ayref: 'y',
                       x: vec[0],
                       y: vec[1],
                       xref: 'x',
                       yref: 'y',
                       showarrow: true,
                       arrowhead: 2,
                       arrowsize: 1,
                       arrowwidth: 4,
                       arrowcolor: colors[index % colors.length]
                   }
               )
              );
    const annotations2 = vectors
          //.slice(0,5)
          .map((vec, index) =>
              (
                   {
                       x: vec[0] + Math.sign(vec[0])*0.2,
                       y: vec[1] + Math.sign(vec[1])*0.2,
                       xref: 'x',
                       yref: 'y',
                       showarrow: false,
                       text: `[${vec[0]}, ${vec[1]}]`,
                       offset:0.2,
                       font: {
                           color: colors[index % colors.length],
                            size: 14
                        },
                   }
              )
          );

    annotations = annotations.concat(annotations2);
    //annotations = annotations2;


    const traces = vectors
          //.slice(0,5)
          .map((vec, index) =>
              (
                  {
                      x: [0, vec[0]],
                      y: [0, vec[1]],
                      mode: 'lines',
                      line: {
                          width: 3,
                          color: colors[index % colors.length],
                          // Below doesn't actually work bc dots too close togther
                          // maybe fix later
                          dash: (index < colors.length) ? 'solid' : 'dot'
                      },
                      name: String(vec)
                  }
              )
          );
    //console.log(vectors);
    console.log(traces);

    if (vectors.length > 0) {
        const x_values = vectors.map(vec => vec[0]);
        const y_values = vectors.map(vec => vec[1]);

        const new_x_min = Math.min(0, ...x_values) - 1;
        const new_x_max = Math.max(0, ...x_values) + 1;
        const new_y_min = Math.min(0, ...y_values) - 1;
        const new_y_max = Math.max(0, ...y_values) + 1;

        if (new_x_min < x_min) x_min = new_x_min;
        if (new_x_max > x_max) x_max = new_x_max;
        if (new_y_min < y_min) y_min = new_y_min;
        if (new_y_max > y_max) y_max = new_y_max;
    }

    const layout = {
        xaxis: { range: [x_min, x_max] },
        yaxis: { range: [y_min, y_max] },
        showlegend: false,
        annotations: annotations
    };

    //Plotly.newPlot('plot', [], layout);
    Plotly.newPlot('plot', traces, layout);
}

function parseVectors(input) {
    const lines = input.split('\n');
    const vectors = [];
    for (let line of lines) {
        line = line.trim();
        if (line.length > 0) {
            try {
                const vector = JSON.parse(line.replace(/\+/g, ''))
                      .map(Number)
                      .filter(num => !isNaN(num) && isFinite(num))
                      .slice(0, 2);
                if (Array.isArray(vector) && vector.length === 2) {
                    vectors.push(vector);
                }
            } catch (e) {
                console.error("Invalid input: ", e);
            }
        }
    }
    return vectors;
}

plotVectors();  // Initial call to plot any default vectors
