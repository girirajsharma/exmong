# exmong

Test Generator Application(Node.js, express/jade, mongodb/mongoose and jQuery Mobile)

[![Build Status](https://travis-ci.org/girirajsharma/exmong.svg?branch=master)](https://travis-ci.org/girirajsharma/exmong)

Holla guys,

This is a simple demo application for generating a test paper pdf by selecting some random questions from the database. It exploits express at back end and jquery mobile for end users with mongo as a database.

Rest API :

GET / : Renders the index page

GET /question : Lists all the questions present in database

POST /question : Persists a question record into database

PUT /question/{id} : Updates a question record into database

DELETE /question/{id} : Deletes a question record from database

GET /question/list : Returns json representation of all the questions which can be further used as per requiremnets

GET /question/{id} : Returns json representation of a single question

GET /generate : Generates a pdf in the root directory by randomly selecting a set of questions
