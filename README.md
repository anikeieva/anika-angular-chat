## Anika Angular Chat
Online chat based on Angular, Soket.IO, Node.js, Express, MongoDB and Mongoose (not finished yet).

## .gif
![anika-angular-chat](https://user-images.githubusercontent.com/33197158/52374951-358de300-2a67-11e9-974d-3d847a64086e.gif)

## How to install MongoDB

```
#Install MongoDb on Ubuntu 18.04(from official site https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)

#1 Import the public key used by the package management system
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4

#2 Create a list file for MongoDB
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list

#3 Reload local package database
sudo apt-get update

#4 Install the MongoDB packages
sudo apt-get install -y mongodb-org

#start MongoDB
sudo service mongod start

#begin using MongoDb (mongod is running on your localhost with default port 27017)
mongod
```

## How to build server

```
cd server

#install
npm install
gulp build
 
#run
npm start
```

## How to build client

```
cd client

#install:
npm install
 
#run
npm start
```
