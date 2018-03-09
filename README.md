## Basic Auth (MONGO)

## Installation

1. Clone this repository
2. Navigate to your cloned directory, and run an `npm i`
3. Once the packages are installed, you can run `npm run start` to start the server, or `npm run test` to run the tests.

## User routes

#### POST: `localhost:3000/api/signup` Enter a username, email, and password to sign up

#### GET: `localhost:3000/api/signin` Enter a username, email, and password to sign in 

## Gallery Routes

#### POST: `localhost:3000/api/gallery` Create a new gallery 

#### GET: `localhost:3000/api/gallery/:galleryId` Get a gallery by using a valid ID in the URL

#### PUT: `localhost:3000/api/gallery/:galleryId` Update a gallery by using a valid ID in the URL

#### DELETE: `localhost:3000/api/gallery/:galleryId` Delete a gallery by using a valid ID in the URL