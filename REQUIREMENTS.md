# Backend Tech Challenge

## Trip planner

Implement an API that allows to search a trip from an `origin` to a `destination` and define a `sort_by` strategy which can be:
- `fastest` should sort results by the trips with lower `duration` first
- `cheapest` should sort results by the trips with lower `cost` first

The 3rd party API powering the experience in the background defines a `Trip` in this way:
```
{
    "origin": "SYD",
    "destination": "GRU",
    "cost": 625,
    "duration": 5,
    "type": "flight",
    "id": "a749c866-7928-4d08-9d5c-a6821a583d1a",
    "display_name": "from SYD to GRU by flight"
}
```

You can query in the background the `trips` API by using this endpoint https://z0qw1e7jpd.execute-api.eu-west-1.amazonaws.com/default/trips

You can use the API key provided in the email to authenticate each request by using the header `x-api-key`.


### Requirements

#### Languages and Frameworks:
The app should run in NodeJS, you can choose any library or framework you are more familiar with.

#### Functionality

Create an API endpoint that accepts the following parameters:
`origin`: IATA 3 letter code of the origin
`destination`: IATA 3 letter code of the destination
`sort_by`: Sorting strategy, either `fastest` or `cheapest`

Integrate with 3rd party API provided to display to the client only the relevant results sorted accordingly to each request.

The supported places by the 3rd party API are:
```
[
    "ATL", "PEK", "LAX", "DXB", "HND", "ORD", "LHR", "PVG", "CDG", "DFW",
    "AMS", "FRA", "IST", "CAN", "JFK", "SIN", "DEN", "ICN", "BKK", "SFO",
    "LAS", "CLT", "MIA", "KUL", "SEA", "MUC", "EWR", "MAD", "HKG", "MCO",
    "PHX", "IAH", "SYD", "MEL", "GRU", "YYZ", "LGW", "BCN", "MAN", "BOM",
    "DEL", "ZRH", "SVO", "DME", "JNB", "ARN", "OSL", "CPH", "HEL", "VIE"
]
```

#### Bonus (optional)

Implement a simple Trip Manager that allows (via API) to:

- `save` a Trip

- `list` all the saved Trips

- `delete` a Trip

## Submission
- Create a project that solves the assignement described
- Include a README with relevant information (how to install, build, test and run the software)
- Please submit the Git repository URL and ensure the repository is accessible for review. Include any necessary API keys or credentials in a secure manner, such as environment variables or a .env file (do not hard-code them in the source code).
- Explain any compromise you may have made


## Evaluation Criteria
- Functionality: The API meets the requirements and works as expected.
- Code Quality: Code is clean, well-structured, and follows best practices.
- Documentation: Clear and comprehensive documentation.
- Testing: Adequate unit tests and error handling.
- Creativity: Additional features or improvements beyond the basic requirements.
