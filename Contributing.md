# Contributing

This is not really an introduction to contributing on this project, rather a place for documentation that does not need to be in the Readme, as it is only import for devs

## Known Limitations

- Every client is assigned a room code. The assignment of this room code should be per a hash function
- Multithreading is supported and safe, but for multiprocess deployment, sticky session load balancing is required

## Structure

This is the structure used:

```file
project/
    app.py
    templates/
        *.html
    static/
        componentA/
            componentA.js
            componentA.css
            componentA.*
        componentB/
            componentB.js
            componentB.css
            componentB.*
        ...
        style.css
    viz_utils/
        Viz_aidA.py
        Viz_aidB.py
        ...
    ml_utils/
        backend_componentA.py
        backend_componentB.py

```

### Extending the structure - Frontend

For the frontend component, following requirements should be met:

- The script should be able to be included into any html page; without braking it. Meaning:
  - Any HTMLelement needs to be check for NULL before usage
  - if similar versions of one component exist, they should both be handled by the same .js
- The backend is our only "source of truth". Meaning:
  - Any data should immediatly sent in the backend
  - Any ("default")-data should be fetched from the backend on loading
