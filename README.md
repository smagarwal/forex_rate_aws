# Forex Data Collection and Presentation

This project focuses on collecting Forex rate data using AWS Lambda, storing the data in AWS DynamoDB, and creating a React frontend with an Express backend. The goal is to display retrieved data based on user selection of dates and currencies. The data is present in an Chart and Tabular format.

## Try it Live

Explore the live application [here](https://fx-client.pages.dev/).

## Project Overview

- **Data Collection:** Utilizes AWS Lambda to collect Forex data at regular intervals (every hour).
- **Data Storage:** Stores collected data in AWS DynamoDB, ensuring reliability and scalability.
- **User Interface:** A React frontend allows users to interact with the data by selecting specific dates and currencies.
- **Backend API:** An Express backend serves as the API, retrieving and delivering data based on user requests.

