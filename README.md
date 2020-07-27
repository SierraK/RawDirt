# RawDirt
Web application for the buying and selling of offroad machines like dirtbikes

The live version can be found at http://www.therawdirt.com/

![Preview image for RawDirt website](preview.png)

## Has the following features:
- Display offroad listings from database
- CRUD operations for both the offroad listings and user profiles
- Search for offroad listings
- Users can create a favorites list of offroad listing
- Create an account (login and signup)
- User authenication
- Hosted on Heroku
- Built using Bootstrap, Node.js, Express, MongoDB, Mongoose
- Responsive Web Design

## To use the application: 

1. Clone to your local machine

2. Set up Cloudinary, Geocoder, Gmail, and Mapbox accounts to get API keys
- Go to .env file and change the following to your API Keys
```
CLOUDINARY_API_KEY="Cloudinary Api Key"
CLOUDINARY_API_SECRET="Cloudinary Api Secret"
GEOCODER_API_KEY="Geocoder Api Key"
GMAILPW="Gmail Api Key"
MAPBOX_API_KEY="MapBox Api Key"
```
3. Go to the folder in the terminal

4. Install the dependencies in package.json
```
npm install
```
5. Run the app
```
node app.js
```
6. Go to http://localhost:3000/ in browser to see the application
