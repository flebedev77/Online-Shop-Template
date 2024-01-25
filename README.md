# E-commerce buisness website template

Prequesits:\n
    1. Have a modern version of nodejs installed\n
    2. Have a stripe account\n

You can start off by cloning this repo with "git clone https://github.com/flebedev77/Online-Shop-Template.git"

First you will need to make a .env file in the root of this project

Next get your public stripe api key and put it into the .env file like so "STRIPE_PUBLIC_KEY=<your_public_key>"

Then procceed by putting in the stripe private key on a new line like this \n"STRIPE_PRIVATE_KEY=<your_private_key>"

In total your .env file should look like this: "
STRIPE_PUBLIC_KEY=<your_public_key>\n
STRIPE_PRIVATE_KEY=<your_private_key>
"

Then test if the application works by running "node server.js", this will start a local server on port 3000

Navigate to localhost:3000 in your web browser and then you should be redirected to the home page congrats

Things you should change:\n
    change the logo (logo can be found in "client/imgs/logo.png")\n
    change the name\n
