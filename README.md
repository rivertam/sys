# How to use this repo

## Assumptions

- You're using Linux
- You have Go installed and configured
- You have node and NPM installed
- A handful of things that I think are true of pretty much all Linux systems (and maybe Mac/some other Unix or Unix-like systems)

## Installation

Clone the repo into your Go path source folder. I don't really understand Go's structure, but if you do great. The Godeps are saved so that should be standard. I just put it in ~/go/src/sys and then:

- go install
- go build

That builds the server.

The frontend:

- cd into sys/frontend
- npm run build

and if you're feeling feisty

- npm test

## Running

- go build && ./sys
- Open http://localhost:6474 if you haven't already
  - (6474 is the closest I could get to "data" with numbers)
- Be in shock and awe
