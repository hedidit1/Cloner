figma.showUI(__html__);

figma.ui.onmessage = msg => {
  console.log("Received message:", msg);

  if (msg.type === 'create-rectangles') {
    const selectedNodes = figma.currentPage.selection;

    if (selectedNodes.length !== 1 || (selectedNodes[0].type !== 'RECTANGLE' && selectedNodes[0].type !== 'ELLIPSE')) {
      figma.notify('Please select exactly one rectangle or ellipse.');
      return;
    }

    const object = selectedNodes[0];

    if (!object.parent) {
      figma.notify('The selected object must have a parent.');
      return;
    }

    const numberOfRectangles = msg.count;

    // Create a rectangle to be used as a component
    const rect = figma.createRectangle();
    rect.resize(100, 100); // Define the size of the rectangles
    rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];

    // Create a component from the rectangle
    const component = figma.createComponent();
    component.appendChild(rect);
    component.resize(100, 100);

    // Create a new frame
    const frame = figma.createFrame();
    frame.name = `${object.name} - ${numberOfRectangles}`;
    frame.resize(object.width, object.height);
    frame.x = object.x;
    frame.y = object.y;
    frame.clipsContent = false; // Disable "clip content"

    // Append the object to the new frame
    const clonedObject = object.clone();
    clonedObject.x = 0; // Center horizontally
    clonedObject.y = 0; // Center vertically
    frame.appendChild(clonedObject); // Ensure the cloned object is appended

    // Append the component to the frame
    frame.appendChild(component);

    const parent = object.parent;
    if (parent) {
      // Remove the original object
      object.remove();
      // Append the frame to the original parent
      parent.appendChild(frame);
    }

    let perimeter = 0;

    if (clonedObject.type === 'RECTANGLE') {
      perimeter = 2 * (clonedObject.width + clonedObject.height);
    } else if (clonedObject.type === 'ELLIPSE') {
      perimeter = Math.PI * (3 * (clonedObject.width + clonedObject.height) - Math.sqrt((3 * clonedObject.width + clonedObject.height) * (clonedObject.width + 3 * clonedObject.height)));
    }

    const step = perimeter / numberOfRectangles;

    for (let i = 0; i < numberOfRectangles; i++) {
      const distance = step * i;
      let x, y, angle = 0;

      // Handle Rectangle
      // ...

      // Handle Ellipse
      if (clonedObject.type === 'ELLIPSE') {
        const t = (distance / perimeter) * 2 * Math.PI;
        x = (clonedObject.width / 2 * Math.cos(t));
        y = (clonedObject.height / 2 * Math.sin(t));

        // Calculate the angle of rotation based on the derivative of the parametric equations for an ellipse
        const dx = -clonedObject.width / 2 * Math.sin(t);
        const dy = clonedObject.height / 2 * Math.cos(t);
        angle = Math.atan2(dy, dx) * (180 / Math.PI); // Convert to degrees

        // Adjust the x and y positions based on the center of the ellipse
        x += clonedObject.width / 2 + clonedObject.x;
        y += clonedObject.height / 2 + clonedObject.y;
      }

      if (x !== undefined && y !== undefined) {
        // Create an instance of the component and set its position
        const instance = component.createInstance();
        instance.x = x - instance.width / 2; // Adjust x coordinate
        instance.y = y - instance.height / 2; // Adjust y coordinate

        // Align the instance's rotation to the tangential curve of the ellipse
        instance.rotation = angle;

        // Append the instance to the frame
        frame.appendChild(instance);
      }
    }
  }
};
