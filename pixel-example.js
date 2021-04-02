// The function gets called when the window is fully loaded
window.onload = function() {
    // Get the canvas and context
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");
 
    // Define the image dimensions
    var width = canvas.width;
    var height = canvas.height;
 
    // Create an ImageData object
    var imagedata = context.createImageData(width, height);
 
    // Create the image
    function createImage(offset) {
        // Loop over all of the pixels
        for (var x=0; x<width; x++) {
            for (var y=0; y<height; y++) {
                // Get the pixel index
                var pixelindex = (y * width + x) * 4;
 
                // Generate a xor pattern with some random noise
                var red = ((x+offset) % 128) * ((y+offset) % 128);
                var green = ((x+offset) % 128) * ((y+offset) % 128);
                var blue = ((x+offset) % 128) * ((y+offset) % 128); 
 
                // Set the pixel data
                imagedata.data[pixelindex] = red;     // Red
                imagedata.data[pixelindex+1] = green; // Green
                imagedata.data[pixelindex+2] = blue;  // Blue
                imagedata.data[pixelindex+3] = 255;   // Alpha
            }
        }
    }
 
    // Main loop
    function main(tframe) {
        // Request animation frames
//        window.requestAnimationFrame(main);
 
        // Create the image
        createImage(Math.floor(tframe / 10));
 
        // Draw the image data to the canvas
        context.putImageData(imagedata, 0, 0);
    }
 
    // Call the main loop
    main(0);
};
