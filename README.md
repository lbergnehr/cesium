# Cesium

Cesium is a continuous integration radiator based on the [Meteor](http://meteor.com) platform. You can see a demo of it at [the demo site](http://cesium.meteor.com).

## Administration
The administration of the site can be done through the `admin` route. For a default development URL, that would be equal to `http://localhost:3000/admin`.

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

### Coding style
In order to get some consistent syntax it's recommended to format JavaScript code with js-beautify or a similar tool. Here's an example command you can use:

    js-beautify -s 2 -m 2 -f file_to_beautify.js

You can put this in your .vimrc to make it easy to format the current file with `<leader>bj`:

    nmap <leader>bj mq:%! js-beautify -f - -s 2<cr>'q

