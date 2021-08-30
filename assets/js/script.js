var siteTitleEl = document.querySelector("#site-title");
var zipcodeInputEl = document.querySelector("#user-entry");
var buttonClickEl = document.querySelector("#get-zip");
var zipcodeContainerEl = document.querySelector("#zipcode-container")

var buttonSubmitHandler = function(event) {
    // prevent page from refreshing
    event.preventDefault();

    // get value from input element
    var zipcode = zipcodeInputEl.nodeValue.trim();

    if (zipcode) {
        getUserZipCode(zipcode);

        // clear old content
        
    }
}