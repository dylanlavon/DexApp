console.log("hi from functions")

function submitOnEnter(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      document.querySelector('.search-form').submit(); // Submit the form programmatically
    }
  }