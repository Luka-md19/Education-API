class Example {
  value = 42;

  // Traditional function
  traditionalFunction() {
    console.log(this.value); // `this` refers to the instance of Example
  }

  // Arrow function
  arrowFunction = () => {
    console.log(this.value); // `this` still refers to the instance of Example (inherited from surrounding scope)
  };
}

const example = new Example();

example.traditionalFunction(); // Outputs: 42
example.arrowFunction(); // Outputs: 42

// But if you extract the functions and call them separately:
const tradFunc = example.traditionalFunction;
const arrowFunc = example.arrowFunction;

tradFunc(); // `this` is now undefined or refers to the global object, may cause an error or undefined result
arrowFunc(); // Still outputs: 42, because arrow functions inherit `this` from the class instance
