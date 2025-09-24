# codedex-cafe-finder
Build a Cafe Finder with JavaScript and the open street map
Prerequisites: HTML, CSS, JavaScript
Originally this project build on codedex was supposed to be using google but google's clouds and apis and billing instead i used another free alternative open street
Setup
## Workspace
Start by creating a new HTML/CSS/JS project in Codédex Builds. You can also use a code editor of your choice, like VS Code.
## Clone Template
Head over to this GitHub link and clone the repository. The repo has all the basic HTML and CSS set up so we don't have to worry about it later and focus on API implementation.

You can clone the template in 3 different ways:

Downloading the folder and adding it to your local workspace
GitHub Desktop app
git clone with command line
If you don't have VS Code and don't know how to use it, head over to our VS Code setup tutorial.

# Accessing Locations with JavaScript
Time to write some back-end code!
## Geolocation
To see cafes nearby, the browser needs access to your location. There's a built-in JavaScript function that takes care of that for you called useLocation() and it takes your device's latitude and longitude coordinates.
 Cafe UI and Animations
We're gonna create a wrapper for our cards, and inject data from the API into the wrapper as we go. To start, let's make a function called displayCards() that renders a div container whenever the website starts up.

We'll start by creating a container that takes the first saved cafe in our cafe options. We'll make the content of this card blank for now, and fill it in with information when we use the Places API.
