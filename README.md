# NAS

## Setting up docker containers
- Make sure to give the right permissions for the storage module when debugging
`sudo chown -R $USER:$USER ./backend/storage`
`chmod -R 755 ./backend/storage`

## Current Status
- FastAPI server running on port 8000
- Basic auth in place (admin/test123)
- File listing endpoint
- Exception handling