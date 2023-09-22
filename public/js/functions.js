console.log("hi from functions")

function submitOnEnter(event, formId) {
    if (event.key === 'Enter') {
      
      const form = document.getElementById(formId)
      form.submit(); // Submit the form programmatically
    }
  }
