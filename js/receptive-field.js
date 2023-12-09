// List of layers, from top to bottom.
// Last displayed layer is input.
// {'k': kernel size, 's': stride, 'd': dilation}
var layers = [
  {k: 3, s: 1, d: 1},
  {k: 3, s: 1, d: 1},
  {k: 3, s: 1, d: 1},
];
// Adjust below values so that stuff fits in screen.
var display_sizes = [5, 7, 9, 11];
var w_offset = 300;
var h_offset = 0;
var cell_size = 10;


/* DISPLAY CODE BELOW */
var canvas = document.getElementsByTagName('canvas')[0];
var ctx = canvas.getContext("2d");

// Draw each layer.
var rects = {};
for (var layer = 0; layer < layers.length; layer++) {
  [h_offset, rects] = drawGrid(h_offset, w_offset, display_sizes[layer], display_sizes[layer], layer, cell_size, rects);
}
// Input Image
[h_offset, rects] = drawGrid(h_offset, w_offset, display_sizes[layers.length], display_sizes[layers.length], layer, cell_size, rects);

function drawGrid(h_offset, w_offset, h, w, id, cell_size, rects) {
  var width = cell_size * w;
  var height = cell_size * h;
  for (var i = -1 * Math.floor(h / 2); i <= Math.floor(h / 2); i++) {
    var tyPoint = h_offset + height/2 + cell_size * i;
    for (var j = -1 * Math.floor(w / 2); j <= Math.floor(w / 2); j++) {
      var txPoint = w_offset + cell_size * j;     
      // Draw the rectangle.
      ctx.beginPath();
      ctx.fillStyle = 'white';
      ctx.rect(txPoint, tyPoint, cell_size, cell_size);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      // Enter this into the dict of rectangles.
      var key = makeKey(id, i, j);
      rects[key] = {x: txPoint, y: tyPoint, w: cell_size, h: cell_size, id: id, i: i, j: j};
    }
  }
  return [h_offset + height + 2*cell_size, rects];
}

canvas.onmousemove = function(e) {
  var rect = this.getBoundingClientRect(),
    x = e.clientX - rect.left,
    y = e.clientY - rect.top;
  
  // Find all cells which are connected to this neuron.
  var connected_rects = [];
  for (var key in rects) {
    var r = rects[key];
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.w, r.h);
    if (ctx.isPointInPath(x, y) == true) {
      ctx.fillStyle = "red";
      // Call this for every connected child pixel.
      connected_rects = getConnectedRects(r.id, r.i, r.j, rects, layers);
    } else {
      ctx.fillStyle = "white";
    }
    ctx.fill();
    ctx.stroke();
  }

  // Paint each cell that is connected to the neuron.
  i = 0;
  while (r = connected_rects[i++]) {
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = r.color;
    ctx.fill();
    ctx.stroke();
  }
};

function getConnectedRects(l, i, j, rects, layers) {
  var connected_rects = [];
  if (l >= layers.length) {
    return connected_rects;
  }
  
  var layer = layers[l];
  for(var x_ind = -1*Math.floor(layer.k/2); x_ind <= Math.floor(layer.k/2); x_ind++) {
    for(var y_ind = -1*Math.floor(layer.k/2); y_ind <= Math.floor(layer.k/2); y_ind++) {
    		var x = layer.d * x_ind + i * layer.s;
        var y = layer.d * y_ind + j * layer.s;
    		// Add the current cell.
        var key = makeKey(l+1, x, y);
        var color_rect = rects[key];
        color_rect['color'] = getColor(l, i, j, layers.length);
        console.log(color_rect['color']);
        connected_rects.push(color_rect);
        // Get children cell.
        var child_connected_rects = getConnectedRects(l+1, x, y, rects, layers);
        connected_rects = connected_rects.concat(child_connected_rects);
    }
  }
  return connected_rects;
}

function makeKey(l, i, j) {
  var key = l.toString() + '_' + i.toString() + '_' + j.toString();
  return key;
}

function getColor(l, i, j, num_layers) {
  var alpha = l / num_layers;
  var r = 0; // 255 - i*0.5;
  var g = 0; //- i*10/l;
  var b = 255;
  var color = 'rgba(' + r.toString() + ',' + g.toString() + ',' + b.toString() + ',0.2)';
  return color;
}

