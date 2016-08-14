#!/bin/sh

cd ./frontend
npm install
npm run build
cd ..
go get
go install
go build
