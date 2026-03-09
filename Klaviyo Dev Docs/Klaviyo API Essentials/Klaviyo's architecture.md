# Klaviyo's architecture
Learn the building blocks of Klaviyo's architecture.



Klaviyo operates a real-time data platform built for massive scale on Amazon Web Services (AWS). In order to enable tens of thousands of companies to create dynamic, personalized experiences for their end users, we ingest and store billions of events every day and we power the sending of billions of messages across multiple channels each month including email, push, and SMS.



All Klaviyo data is stored on AWS servers running in AWS Virtual Private Cloud (VPC) networks and we utilize shared AWS resources - such as load balancers, web servers, and more - to optimize performance, reliability and cost efficiency for all customers.



Illustrative technologies we use include:



\- native AWS technologies such as EC2, RDS, and Aurora

\- other database technologies such as MySQL, Cassandra, RabbitMQ, and Redis

\- front-end technologies such as HTML, JavaScript, LESS, Backbone.js, and React

\- programming languages and frameworks such as Python, Django, Celery

