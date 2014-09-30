# Cesium

Cesium is a continuous integration radiator based on the [Meteor](http://meteor.com) platform.

## Development

### Test Data
In order to get test data into the system, enter the data in `private/bootstrap/data.json`. The file is a key-value list of collection names and a list of data that should be inserted for that collection, e.g.:

    {
      "tasks": [
        {
          "name": "The name of the task"
        }
      ]
    }

