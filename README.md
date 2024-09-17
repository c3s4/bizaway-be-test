# Bizaway BE Test

This project is a backend test for BizAway. It provides a set of APIs to demonstrate backend capabilities and handle specific tasks.

## Table of Contents

[TOC]

---

## 1. Requirements

Before running the project you need some tools installed and some configurations set up. **_Of course, you need to clone this repository in your local machine first_**.

### 1.1. Docker and Docker Compose

You need this 2 tools installed and running in your machine. To install them you can follow the instructions in the following links:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

Or, if you are on a Mac and you have `brew`, you can use the following commands:

```bash
brew install --cask docker
```

### 1.2. Prepare .env

You need to prepare a `.env` file in the root of the project. You can use the `.env.example` file as a template.

Because of the nature of the project, you can just copy the `.env.example` file to `.env`. The only thing you need to change is the `PLANNER_API_KEY`, which is a key to access the API used in the project, and you already provided it in the email.

The content of the `.env` file should be like this:

```
SERVER_PORT=3000
PLANNER_API_URL=https://z0qw1e7jpd.execute-api.eu-west-1.amazonaws.com/default/trips
PLANNER_API_KEY=********

MONGO_LOCAL_PORT=27019
MONGO_ADMIN_USER=bizAway_BE_test_user
MONGO_ADMIN_PASSWORD=bizAway_BE_test_psw
MONGO_DB_NAME=bizAway

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_CACHE_DURATION_SECONDS=90

DATABASE_URL=mongodb://${MONGO_ADMIN_USER}:${MONGO_ADMIN_PASSWORD}@localhost:${MONGO_LOCAL_PORT}/${MONGO_DB_NAME}?authSource=admin

JWT_SECRET=YOUR_SECRET_KEY_HERE
JWT_TOKEN_AUDIENCE=localhost:3000
JWT_TOKEN_ISSUER=localhost:3000
JWT_ACCESS_TOKEN_TTL=3600
```

- The `SERVER_PORT` is the port where the server will listen.
- The `PLANNER_API_URL` is the URL of the 3rd party API.
- The `PLANNER_API_KEY` is the key to access the 3rd party API.
- The `MONGO_LOCAL_PORT` is the port where the mongo db will be running in the host (is used by docker for port mapping).
- The `MONGO_ADMIN_USER` is the user to access the mongo db.
- The `MONGO_ADMIN_PASSWORD` is the password to access the mongo db.
- The `MONGO_DB_NAME` is the name of the database in the mongo db.
- The `DATABASE_URL` is the URL to access the mongo db, this does not need to be changed.
- The `REDIS_HOST` is the host where the redis server is running.
- The `REDIS_PORT` is the port where the redis server is running.
- The `REDIS_CACHE_DURATION_SECONDS` is the duration in seconds to cache the results from the 3rd party API.
- The `JWT_SECRET` is the secret key to generate the JWT token. For the purpose of the test, you can leave it as it is.
- The `JWT_TOKEN_AUDIENCE` is the audience of the JWT token.
- The `JWT_TOKEN_ISSUER` is the issuer of the JWT token.
- The `JWT_ACCESS_TOKEN_TTL` is the time to live of the JWT token.

> ⚠️ **Note**: The `REDIS_*` variables are for the caching mechanism ([see bonus section](#bonus)).

> ⚠️ **Note**: The `JWT*` variables are for the authentication system ([see bonus section](#bonus)).

### 1.3. [_Optional_] Node.js and package manager

In case you choose _method 2_ or _method 3_ to run the project ([see below](#method-2-using-pnpm)), you need to have Node.js and a package manager installed in your machine.

> **Note**: We recommend using `pnpm` as a package manager because it's the one we use in the project and we already have a `pnpm-lock.yaml` file. If you don't want to use `pnpm`, you can use `npm` or `yarn` as well.

You can use the following links to install them:

- [Node.js](https://nodejs.org/en/download/) - We suggest to install using nvm or other version manager. This'll help you to manage different versions of Node.js in your machine.

  > **Note**: The suggested version of Node.js is 20.0.0 or higher.

- [pnpm](https://pnpm.io/installation)

Or, if you are on a Mac and you have `brew`, you can use the following commands:

```bash
brew install nvm
nvm install 20
brew install pnpm
```

## 2. How to Run

To run this project, you can use different methods. Here we provide instructions for each of them.

### 2.1. Method 1: Using Docker (preferred)

This method is the easiest way to run the project. You just need to have Docker and Docker Compose installed in your machine.

To run the project, you can use the following command in the root of the project:

```bash
docker compose -f docker-compose.prod.yml up
```

This command will build the app image and run the containers. The first time you run this command, it will take some time to download the images and build what is needed.

This will start the server listening on the port you set in the `.env` file. The server will be ready when you see the following message in the console:

```
Application started...
```

Now you can [start using the APIs](#how-to-use).

📘 **Note**: _In a real world scenario, we should have a CI script that build the image and push in a container registry, from where you can pull the image and run the containers. In this case, instead, the image is built during the "up phase", so in case you have to change something in the code, **you need to rebuild the image**. So you have to run this command:_

```bash
docker compose -f docker-compose.prod.yml up --build
```

### 2.2. Method 2: Using pnpm

If you want to run the project "directly from the code" you can use this method (remember: you need to have Node.js and pnpm installed in your machine).

To run the project, just type the following commands:

```bash
pnpm install
pnpm start:dev
```

This will start the server listening on the port you set in the `.env` file. The server will be ready when you see the following message in the console:

```
Application started...
```

### 2.3. Method 3: Running Tests

In case you would like to run the tests, you have to prepare a proper `env` file for tests. As we've done for the `.env` file, you can copy the `.env.example` file to `.env.test.local` and change the values accordingly.

An example of the `.env.test.local` file should be like this:

```
SERVER_PORT=3001
PLANNER_API_URL=https://z0qw1e7jpd.execute-api.eu-west-1.amazonaws.com/default/trips
PLANNER_API_KEY=********

MONGO_LOCAL_PORT=27020
MONGO_ADMIN_USER=biz-test-user
MONGO_ADMIN_PASSWORD=biz-test-psw
MONGO_DB_NAME=bizAway-test

DATABASE_URL=mongodb://${MONGO_ADMIN_USER}:${MONGO_ADMIN_PASSWORD}@localhost:${MONGO_LOCAL_PORT}/${MONGO_DB_NAME}?authSource=admin

JWT_SECRET=YOUR_SECRET_KEY_HERE
JWT_TOKEN_AUDIENCE=localhost:3000
JWT_TOKEN_ISSUER=localhost:3000
JWT_ACCESS_TOKEN_TTL=3600
```

Just note that the `SERVER_PORT` should be different from the one you set in the `.env` file, in case you are running the server at the same time.
Same for the `MONGO_LOCAL_PORT`. For the `MONGO_DB_NAME`, as you can see, we added a `-test` suffix to the name of the database, this is not mandatory because we are using a different container for the tests, but could be useful, just to avoid mistakes.

We have 2 kinds of tests in the project: unit tests and e2e tests. To run them, you can use the following commands:

```bash
pnpm test
```

for unit tests, and

```bash
pnpm test:e2e
```

for e2e tests.

Last thing to note here is that these scripts are responsible to start the database container, run the tests and stop and remove the container. So, you don't need to worry about starting the database container before running the tests.

## 3. How to Use

Now that the server is running, you can start using the APIs. The server is listening on the port you set in the `.env` file.

To know the endpoints and how to use them, you can check the basic **Swagger Documentation**, pointing your browser to `http://localhost:<port_in_env>/docs`.

You can use any API client to test the endpoints, like Postman or Insomnia. In case you want to use Insomnia, you can import the collection provided in the repository (`insomnia.json` in the root of the project). The port is configured as an env variable and is the 3000 as default.

Anyway, here are all the endpoints and its descriptions:

### 3.1. Trips resource

#### 3.1.1. GET /api/trips/search

This endpoint is responsible to search trips based on the parameters you provide. The parameters are:

- `origin`: the origin of the trip, value is one of the IATA 3 code provided. **Mandatory**.
- `destination`: the destination of the trip, value is one of the IATA 3 code provided. **Mandatory**.
- `sort_by`: the field to sort the results, value is one of `[fastest, cheapest]`. **Optional**.
- `trip_type`: the type of the trip, values is one of `[flight, car, train]`. **Optional**.
- `page`: the page number of the results, default is 1. **Optional**.
- `items_per_page`: the number of items per page, default is 10. **Optional**.

You can use request like this:

```bash
http://localhost:3000/api/trips/search?origin=FRA&destination=IST&sort_by=fastest&trip_type=flight
```

The response will be a list of trips, like this one:

```json
{
  "items": [
    {
      "origin": "FRA",
      "destination": "GRU",
      "cost": 5910,
      "duration": 31,
      "type": "train",
      "remote_id": "8ca83fb6-5850-446c-af91-99d875305ad5",
      "display_name": "from FRA to GRU by train"
    }
  ],
  "current_page": 1,
  "items_per_page": 10,
  "total_pages": 1,
  "total_items": 1
}
```

#### 3.1.2. POST /api/trips/

This endpoint is responsible to save a trip. The body of the request should be like this:

```json
{
  "origin": "AMS",
  "destination": "BOM",
  "cost": 1415,
  "duration": 41,
  "type": "car",
  "remote_id": "911fef2b-fb91-455e-85c5-7129d214d5d5",
  "display_name": "from AMS to BOM by car"
}
```

All the fields are mandatory:

- Type of `origin` and `destination` are the same as for the `search` endpoint.
- The `type` is one of `[flight, car, train]`.
- The `remote_id` is a string in uuid format.
- The `display_name` is a string to display the trip.
- The `cost` is a positive number.
- The `duration` is a positive number.

You have to set the content type of the request to `application/json`.

#### 3.1.3. GET /api/trips/

This endpoint is responsible to list all the saved trips. The url parameters are:

- `page`: the page number of the results, default is 1. **Optional**.
- `items_per_page`: the number of items per page, default is 10. **Optional**.

The request url should be like this:

```bash
http://localhost:3000/api/trips/?page=2&items_per_page=2
```

It'll return a list of trips like this:

```json
{
  "items": [
    {
      "id": "66e44a4feeb9a912dd0ee463",
      "origin": "BCN",
      "destination": "IST",
      "cost": 100,
      "duration": 10,
      "type": "flight",
      "remote_id": "123e4567-e89b-12d3-a456-426614174300",
      "display_name": "test"
    },
    {
      "id": "66e44a6da35a23c8453b9d60",
      "origin": "BCN",
      "destination": "IST",
      "cost": 100,
      "duration": 10,
      "type": "flight",
      "remote_id": "123e4567-e89b-12d3-a456-426614174300",
      "display_name": "test"
    }
  ],
  "current_page": 2,
  "items_per_page": 2,
  "total_pages": 7,
  "total_items": 14
}
```

#### 3.1.4. GET /api/trips/:id

This is a simple endpoint to get a trip by its `id`. The request url should be like this:

```bash
http://localhost:3000/api/trips/66e44a6da35a23c8453b9d60
```

The response will be like this:

```json
{
  "id": "66e44a6da35a23c8453b9d60",
  "origin": "BCN",
  "destination": "IST",
  "cost": 100,
  "duration": 10,
  "type": "flight",
  "remote_id": "123e4567-e89b-12d3-a456-426614174300",
  "display_name": "test"
}
```

#### 3.1.5. DELETE /api/trips/:id

To delete a trip, you can use this endpoint. Just use the `id` as a parameter in the URL. The response will be an empty response with status code 204.

The request url should be like this, using the `DELETE` http method:

```bash
http://localhost:3000/api/trips/66e44a6da35a23c8453b9d60
```

##### Authentication

Given the purpose of the test, the endpoints are not protected by an authentication system. The only endpoint under authentication is this one. So to delete a previously saved trip, you need to provide a valid JWT token in the `Authorization` header.

The approach is the classic Bearer token, so you have to provide the token in the header like this:

```
Authorization: Bearer <your_token_here>
```

To get the token you have to call [the `login` endpoint](#322-post-apiauthlogin), providing the credentials in the body of the request. When you run this app for the first time, no user is created, so you have to create one. You can use [the `register` endpoint](#321-post-apiauthregister).

### 3.2 Authentication resource

#### 3.2.1. POST /api/auth/register

This endpoint is responsible to register a new user. The body of the request should be like this:

```json
{
  "email": "exampl@email.com",
  "password": "password"
}
```

The response will have a 201 as status code and the body will be something like this:

```json
{
  "id": "66e44a6da35a23c8453b9d60",
  "email": "exampl@email.com"
}
```

#### 3.2.2. POST /api/auth/login

This endpoint is responsible to login a user. The body of the request should be like this:

```json
{
  "email": "exampl@email.com",
  "password": "password"
}
```

The response will have a 200 as status code and the body will contain the JWT token, to use in the [delete endpoint](#315-delete-apitripsid):

```json
{
  "accessToken": "eyJhbGciOiJI....."
}
```

## Bonus

To improve the project adding some interesting features, I implemented the following:

### Caching

Considering that the 3rd party API could be slow or could have a rate limit, I decided to implement a caching mechanism to improve the performance of the search endpoint. I implemented a simple cache system using Redis.

Because I don't have a lot of information about the 3rd party API, I decided to implement a simple caching mechanism based on time. The idea is to cache the results for a TTL configurable by `.env` file. The cache is invalidated when the TTL expires.

The cache is used only in the search endpoint.

### Authentication

I implemented a simple authentication system using JWT. The authentication is only for the delete endpoint and the users management is the minimum needed to make the system work. In the assumption section below, you can find more information about the limitation of this part.

## Assumptions

Here some assumptions and compromise I made during the development of the project:

- Because of some test requests I made on the thirdy party API, I assumed that results are not paginated.

  - I have anyway implemented the pagination in the search endpoint. In this scenario is not useful but in case of a real API it would be.

- In case of exception from the 3rd party API, I assumed that the response is a 500 status code with a message in the body, explaining that the error is from the 3rd party API.

- The `id` field in the response from the 3rd party API seems to be a uuid, so I assumed it is a string in uuid format for the data validation.

- The `id` field in the response from the 3rd party API has been remapped to `remote_id` in the response provided, to be consistent with other endpoints. We use the `id` filed referring to _our_ data.

- The caching mechanism is based on time, so the results are cached for a configurable amount of time. Each cached record is simply the 3rd party trips list stringified, using origin and destination codes as key.

- For the authentication feature, I assumed that the user management is the minimum needed to make the system work. So, I implemented only the register and login endpoints. Regarding the authentication, I protected only the delete endpoint, and for the token is not available a refresh token mechanism.

- Despite the users management, I didn't add owners to the trips. So, any user can see and delete any trip.
