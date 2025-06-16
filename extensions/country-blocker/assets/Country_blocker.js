const blockedCountriesElement = document.getElementById("blocked-countries");
  const blockedCountries = JSON.parse(blockedCountriesElement.getAttribute("data-countries"));

  // Fetch user's country from API
  fetch("https://api.country.is/")
    .then(response => response.json()) // Convert response to JSON
    .then(data => {
      const userCountry = data.country; // Extract user's country code

      console.log('Blocked Countries:', blockedCountries);
      console.log('User Country:', userCountry);

      // Check if user's country is in the blocked list
      if (blockedCountries.includes(userCountry)) {
        document.getElementById("blocker-div").style.display = "flex"; // Show blocker div if blocked
        console.log("User is blocked - Blocker visible");
      } else {
        console.log("Access allowed - Blocker remains hidden");
      }
    })
    .catch(error => console.error("Error fetching country data:", error));